import { NextRequest, NextResponse } from 'next/server';
import { requireAnyRole } from '@/lib/auth-server';
import {
  fetchCollectionMembers,
  fetchPaymentHistoryTransactions,
  NETCASH_OPERATIONS_ROLES,
  normalizeCollectionMethod,
  toMoney,
} from '@/lib/netcash-operations';

export const dynamic = 'force-dynamic';

function daysBetween(value: string | null | undefined) {
  if (!value) return 0;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 0;
  return Math.max(0, Math.floor((Date.now() - date.getTime()) / 86400000));
}

function methodLabel(value: string | null | undefined) {
  const method = normalizeCollectionMethod(value);
  if (method === 'group_debit_order') return 'Group Debit Order';
  if (method === 'individual_debit_order') return 'Individual Debit Order';
  if (method === 'eft') return 'EFT';
  return 'Unassigned';
}

function ownerForMethod(value: string | null | undefined) {
  const method = normalizeCollectionMethod(value);
  if (method === 'eft') return 'Finance';
  if (method === 'group_debit_order') return 'Operations';
  return 'Call Centre';
}

function riskForCase(amount: number, failedCount: number, ageDays: number) {
  if (failedCount >= 2 || amount >= 1000 || ageDays >= 30) return 'high';
  if (failedCount === 1 || amount >= 500 || ageDays >= 14) return 'medium';
  return 'low';
}

export async function GET(request: NextRequest) {
  try {
    await requireAnyRole(request, NETCASH_OPERATIONS_ROLES);

    const [members, payments] = await Promise.all([
      fetchCollectionMembers(),
      fetchPaymentHistoryTransactions(),
    ]);

    const latestPaymentByMember = new Map<string, any>();
    const failedPaymentsByMember = new Map<string, any[]>();

    for (const payment of payments) {
      const memberId = payment.member_id;
      if (!memberId) continue;

      if (!latestPaymentByMember.has(memberId)) {
        latestPaymentByMember.set(memberId, payment);
      }

      const status = String(payment.status || '').toLowerCase();
      if (status === 'failed' || status === 'rejected') {
        const failures = failedPaymentsByMember.get(memberId) || [];
        failures.push(payment);
        failedPaymentsByMember.set(memberId, failures);
      }
    }

    const cases = members
      .map((member, index) => {
        const latestPayment = latestPaymentByMember.get(member.id);
        const failedPayments = failedPaymentsByMember.get(member.id) || [];
        const method = normalizeCollectionMethod(member.collection_method);
        const arrearsAmount = Math.max(
          toMoney(member.total_arrears),
          failedPayments.reduce((sum, payment) => sum + toMoney(payment.amount), 0),
          String(member.debit_order_status || '').toLowerCase() === 'failed' ? toMoney(member.monthly_premium) : 0,
          String(member.payment_status || '').toLowerCase() === 'rejected' ? toMoney(member.monthly_premium) : 0
        );
        const memberPaymentStatus = String(member.payment_status || '').toLowerCase();
        const debitStatus = String(member.debit_order_status || '').toLowerCase();
        const latestStatus = String(latestPayment?.status || '').toLowerCase();
        const failedCount = Math.max(member.failed_debit_count || 0, failedPayments.length);
        const isEftWatch =
          method === 'eft' &&
          ['pending', 'overdue', 'arrears', 'unpaid'].includes(memberPaymentStatus || latestStatus);
        const isArrears =
          arrearsAmount > 0 ||
          failedCount > 0 ||
          debitStatus === 'failed' ||
          ['rejected', 'overdue', 'arrears'].includes(memberPaymentStatus) ||
          latestStatus === 'failed' ||
          latestStatus === 'rejected' ||
          isEftWatch;

        if (!isArrears) return null;

        const lastAttemptDate = latestPayment?.created_at || latestPayment?.transaction_date || latestPayment?.payment_date || null;
        const ageDays = daysBetween(lastAttemptDate);
        const risk = riskForCase(arrearsAmount, failedCount, ageDays);

        return {
          id: member.id,
          memberId: member.id,
          memberNumber: member.member_number,
          memberName: `${member.first_name || ''} ${member.last_name || ''}`.trim() || member.member_number || `Member ${index + 1}`,
          email: member.email,
          phone: member.mobile || member.phone,
          brokerName: Array.isArray(member.brokers) ? member.brokers[0]?.name : member.brokers?.name || member.broker_code || 'Direct',
          planName: member.plan_name || 'Unassigned Plan',
          collectionMethod: method,
          collectionMethodLabel: methodLabel(method),
          groupName: Array.isArray(member.payment_groups) ? member.payment_groups[0]?.group_name : member.payment_groups?.group_name || null,
          monthlyPremium: toMoney(member.monthly_premium),
          arrearsAmount,
          failedCount,
          ageDays,
          risk,
          owner: ownerForMethod(method),
          status: isEftWatch ? 'eft_follow_up' : failedCount > 0 ? 'collection_failed' : memberPaymentStatus || debitStatus || 'arrears',
          reason:
            failedPayments[0]?.failure_reason ||
            failedPayments[0]?.rejection_reason ||
            latestPayment?.failure_reason ||
            latestPayment?.rejection_reason ||
            (isEftWatch ? 'EFT payment awaiting confirmation' : 'Outstanding payment follow-up'),
          lastAttemptDate,
          nextAction:
            method === 'eft'
              ? 'Confirm EFT proof or allocate receipt'
              : failedCount > 1
                ? 'Escalate recovery call'
                : 'Contact member and retry collection',
        };
      })
      .filter(Boolean)
      .sort((a: any, b: any) => {
        if (b.arrearsAmount !== a.arrearsAmount) return b.arrearsAmount - a.arrearsAmount;
        return b.ageDays - a.ageDays;
      });

    const totalArrears = cases.reduce((sum: number, item: any) => sum + item.arrearsAmount, 0);
    const byMethod = cases.reduce((acc: Record<string, { count: number; amount: number }>, item: any) => {
      acc[item.collectionMethodLabel] ||= { count: 0, amount: 0 };
      acc[item.collectionMethodLabel].count += 1;
      acc[item.collectionMethodLabel].amount += item.arrearsAmount;
      return acc;
    }, {});
    const byOwner = cases.reduce((acc: Record<string, { count: number; amount: number }>, item: any) => {
      acc[item.owner] ||= { count: 0, amount: 0 };
      acc[item.owner].count += 1;
      acc[item.owner].amount += item.arrearsAmount;
      return acc;
    }, {});
    const byBroker = cases.reduce((acc: Record<string, { count: number; amount: number }>, item: any) => {
      acc[item.brokerName] ||= { count: 0, amount: 0 };
      acc[item.brokerName].count += 1;
      acc[item.brokerName].amount += item.arrearsAmount;
      return acc;
    }, {});

    return NextResponse.json({
      summary: {
        totalCases: cases.length,
        totalArrears,
        highRiskCases: cases.filter((item: any) => item.risk === 'high').length,
        failedCollections: cases.filter((item: any) => item.status === 'collection_failed').length,
        eftFollowUps: cases.filter((item: any) => item.status === 'eft_follow_up').length,
        averageAgeDays: cases.length ? Math.round(cases.reduce((sum: number, item: any) => sum + item.ageDays, 0) / cases.length) : 0,
      },
      byMethod,
      byOwner,
      byBroker,
      cases,
    });
  } catch (error: any) {
    console.error('Error fetching operations arrears:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch arrears data' },
      { status: error?.message?.includes('Access denied') ? 403 : 500 }
    );
  }
}
