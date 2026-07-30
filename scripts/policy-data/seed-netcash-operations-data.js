require('dotenv').config({ path: 'apps/frontend/.env.local' });
const { Client } = require('pg');

const GROUPS = [
  { group_code: 'ALB', group_name: 'Orbit Blue', collection_method: 'group_debit_order', collection_day: 2 },
  { group_code: 'ALC', group_name: 'Orbit Core', collection_method: 'group_debit_order', collection_day: 9 },
  { group_code: 'ALD', group_name: 'Orbit Direct', collection_method: 'individual_debit_order', collection_day: 16 },
  { group_code: 'ALM', group_name: 'Orbit Metro', collection_method: 'group_debit_order', collection_day: 23 },
  { group_code: 'ALR', group_name: 'Orbit Reach', collection_method: 'eft', collection_day: 30 },
];

function isoDate(date) {
  return date.toISOString().slice(0, 10);
}

function previousMonthDate(day) {
  const date = new Date();
  date.setMonth(date.getMonth() - 1);
  date.setDate(Math.min(day, 28));
  return isoDate(date);
}

function currentCycleDate(day) {
  const date = new Date();
  date.setDate(Math.min(day, 28));
  return isoDate(date);
}

async function main() {
  if (!process.env.TARGET_DB_URL) {
    throw new Error('TARGET_DB_URL is not configured');
  }

  const client = new Client({ connectionString: process.env.TARGET_DB_URL });
  await client.connect();

  try {
    await client.query('begin');

    const groupIds = {};
    for (const group of GROUPS) {
      const result = await client.query(
        `
          insert into public.payment_groups (
            group_code,
            group_name,
            group_type,
            company_name,
            contact_person,
            contact_email,
            contact_phone,
            bank_name,
            account_number,
            branch_code,
            account_holder_name,
            account_type,
            collection_method,
            collection_day,
            collection_frequency,
            netcash_group_reference,
            status,
            notes,
            collection_dates
          )
          values (
            $1::varchar, $2::varchar, 'broker_collection', $2::varchar, 'Collections Desk',
            lower($1::text) || '@system.com', '0870000000',
            'Standard Bank', '1234567890', '051001', $2,
            'current', $3::varchar, $4::integer, 'monthly', 'NC-' || $1::text,
            'active', 'Monthly Netcash collection group',
            $5::jsonb
          )
          on conflict (group_code) do update set
            group_name = excluded.group_name,
            company_name = excluded.company_name,
            collection_method = excluded.collection_method,
            collection_day = excluded.collection_day,
            netcash_group_reference = excluded.netcash_group_reference,
            status = 'active',
            updated_at = now()
          returning id
        `,
        [
          group.group_code,
          group.group_name,
          group.collection_method,
          group.collection_day,
          JSON.stringify(Array.from({ length: 12 }, (_, month) => {
            const date = new Date(new Date().getFullYear(), month, Math.min(group.collection_day, 28));
            return isoDate(date);
          })),
        ]
      );
      groupIds[group.group_code] = result.rows[0].id;
    }

    const { rows: members } = await client.query(
      `
        select id, member_number, first_name, last_name, monthly_premium
        from public.members
        where status = 'active'
        order by member_number
      `
    );

    for (let index = 0; index < members.length; index += 1) {
      const member = members[index];
      const group = GROUPS[index % GROUPS.length];
      const failed = index % 13 === 0;
      const suspended = index % 29 === 0;
      const arrears = failed ? Number(member.monthly_premium || 0) : 0;

      await client.query(
        `
          update public.members
          set
            payment_group_id = $1,
            collection_method = $2,
            debit_order_day = $3,
            netcash_account_reference = coalesce(netcash_account_reference, $4),
            debit_order_status = $5,
            payment_status = $6,
            failed_debit_count = $7,
            total_arrears = $8,
            last_debit_date = $9,
            next_debit_date = $10,
            debit_order_mandate_date = coalesce(debit_order_mandate_date, start_date, created_at::date),
            debicheck_mandate_status = coalesce(debicheck_mandate_status, 'approved'),
            updated_at = now()
          where id = $11
        `,
        [
          groupIds[group.group_code],
          group.collection_method,
          group.collection_day,
          `NC-${member.member_number}`,
          failed ? 'failed' : suspended ? 'suspended' : 'active',
          failed ? 'rejected' : 'active',
          failed ? 1 : 0,
          arrears,
          previousMonthDate(group.collection_day),
          currentCycleDate(group.collection_day),
          member.id,
        ]
      );

      await client.query(
        `
          insert into public.payment_history (
            member_id,
            policy_number,
            broker_group,
            transaction_date,
            debit_order_date,
            amount,
            status,
            rejection_reason,
            netcash_transaction_id,
            source,
            payment_date,
            payment_type,
            payment_method,
            reference_number,
            reconciled,
            reconciled_at
          )
          select
            $1::uuid, $2::varchar, $3::varchar, $4::date, $4::date, $5::numeric, $6::varchar, $7::text, $8::varchar,
            'netcash', case when $6::text = 'successful' then $4::date else null end,
            'premium_collection', $9::varchar, $8::varchar, $10::boolean, case when $10::boolean then now() else null end
          where not exists (
            select 1
            from public.payment_history
            where member_id = $1::uuid
              and transaction_date = $4::date
              and source = 'netcash'
          )
        `,
        [
          member.id,
          member.member_number,
          group.group_code,
          previousMonthDate(group.collection_day),
          Number(member.monthly_premium || 0),
          failed ? 'failed' : 'successful',
          failed ? 'Insufficient funds' : null,
          `NC-TXN-${member.member_number}`,
          group.collection_method,
          !failed,
        ]
      );
    }

    for (const group of GROUPS) {
      const totals = await client.query(
        `
          select count(*)::int as member_count, coalesce(sum(monthly_premium), 0)::numeric as total_amount
          from public.members
          where payment_group_id = $1
            and status = 'active'
        `,
        [groupIds[group.group_code]]
      );
      const memberCount = totals.rows[0].member_count;
      const totalAmount = Number(totals.rows[0].total_amount || 0);
      const paymentDate = previousMonthDate(group.collection_day);

      await client.query(
        `
          update public.payment_groups
          set total_members = $1,
              total_monthly_premium = $2,
              updated_at = now()
          where id = $3
        `,
        [memberCount, totalAmount, groupIds[group.group_code]]
      );

      const groupPayment = await client.query(
        `
          insert into public.group_payment_history (
            group_id,
            payment_date,
            total_amount,
            member_count,
            payment_method,
            transaction_reference,
            netcash_reference,
            bank_reference,
            status,
            reconciled,
            reconciled_at,
            processed_at,
            notes
          )
          select
            $1, $2::date, $3, $4, $5, $6, $7, $8,
            'successful', true, now(), now(), 'Monthly Netcash collection processed'
          where not exists (
            select 1
            from public.group_payment_history
            where group_id = $1
              and payment_date = $2::date
          )
          returning id
        `,
        [
          groupIds[group.group_code],
          paymentDate,
          totalAmount,
          memberCount,
          group.collection_method,
          `GRP-${group.group_code}-${paymentDate.replace(/-/g, '')}`,
          `NC-${group.group_code}-${paymentDate.replace(/-/g, '')}`,
          `BANK-${group.group_code}-${paymentDate.replace(/-/g, '')}`,
        ]
      );

      const groupPaymentId = groupPayment.rows[0]?.id;
      if (groupPaymentId) {
        await client.query(
          `
            insert into public.group_member_payments (
              group_payment_id,
              member_id,
              member_number,
              member_name,
              amount,
              payment_date,
              included_in_group_payment
            )
            select
              $1,
              id,
              member_number,
              concat(first_name, ' ', last_name),
              monthly_premium,
              $2::date,
              true
            from public.members
            where payment_group_id = $3
              and status = 'active'
          `,
          [groupPaymentId, paymentDate, groupIds[group.group_code]]
        );
      }
    }

    await client.query('commit');
    console.log(`Seeded ${GROUPS.length} payment groups and linked ${members.length} active members.`);
  } catch (error) {
    await client.query('rollback');
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
