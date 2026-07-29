const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const DEMO_BROKER_CODES = ['ALB', 'ALC', 'ALD', 'ALM', 'ALR'];
const DEMO_MEMBER_PREFIXES = ['ALT', ...DEMO_BROKER_CODES];

const PLAN_NAME_MAP = {
  'Altira Plus': 'Value Plus Hospital Plan',
  'Altira Executive': 'Executive Hospital Plan',
  'Altira Select': 'Platinum Hospital Plan',
  'Altira Core': 'Value Plus Senior Hospital Plan',
  'Value Plus Hospital': 'Value Plus Hospital Plan',
  'Executive Hospital': 'Executive Hospital Plan',
  'Platinum Hospital': 'Platinum Hospital Plan',
  'Value Plus Senior': 'Value Plus Senior Hospital Plan',
};

const FIRST_NAMES = [
  'Aiden', 'Amara', 'Anele', 'Ayanda', 'Bongani', 'Calvin', 'Chantel', 'Daniel', 'Dineo', 'Ethan',
  'Faith', 'Farai', 'Gareth', 'Gugulethu', 'Hannah', 'Ian', 'Jade', 'Kabelo', 'Keisha', 'Khumo',
  'Lerato', 'Liam', 'Lindiwe', 'Lucas', 'Mia', 'Mpho', 'Naledi', 'Neo', 'Nokuthula', 'Olivia',
  'Owen', 'Precious', 'Reece', 'Rethabile', 'Sam', 'Sanelisiwe', 'Simphiwe', 'Sipho', 'Tandi',
  'Thabo', 'Themba', 'Tiisetso', 'Vuyani', 'Yolanda', 'Zanele'
];

const LAST_NAMES = [
  'Adams', 'Banda', 'Botha', 'Daniels', 'Dlamini', 'Fourie', 'Gumede', 'Jacobs', 'Khumalo', 'Mabaso',
  'Mahlangu', 'Maseko', 'Mbatha', 'Meyer', 'Mokoena', 'Molefe', 'Naidoo', 'Ncube', 'Nkosi', 'Nkomo',
  'Petersen', 'Pillay', 'Radebe', 'Sithole', 'Smith', 'Strydom', 'Tau', 'van Wyk', 'Vilakazi', 'Zulu',
  'Arendse', 'Baloyi', 'Barnard', 'Bosman', 'Cele', 'Chauke', 'Coetzee', 'De Beer', 'Du Preez', 'Erasmus',
  'Faku', 'Fouché', 'Gama', 'Grobler', 'Hadebe', 'Hlatshwayo', 'Janse van Rensburg', 'Jwara', 'Kganyago', 'Koen',
  'Kotze', 'Langa', 'Lebese', 'Lekganyane', 'Louw', 'Madonsela', 'Magubane', 'Mahomed', 'Maimela', 'Makena',
  'Makgoba', 'Malan', 'Maluleke', 'Maphanga', 'Maringa', 'Masemola', 'Mathebula', 'Mathonsi', 'Mazibuko', 'Mkhize',
  'Mnisi', 'Mohale', 'Moletsane', 'Mthembu', 'Mulaudzi', 'Munyai', 'Murray', 'Mutsvangwa', 'Ndlovu', 'Nene',
  'Ngcobo', 'Ngobeni', 'Nhlapo', 'Ntuli', 'Nxumalo', 'Oosthuizen', 'Paulsen', 'Phiri', 'Pretorius', 'Qwabe',
  'Ramabulana', 'Rasmeni', 'Rikhotso', 'Selepe', 'Seroke', 'Shabalala', 'Sibanda', 'Skhosana', 'Slabbert', 'Swanepoel',
  'Thusi', 'Tshabalala', 'Tshivhase', 'van der Merwe', 'Venter', 'Viljoen', 'Visagie', 'Xitsonga', 'Zondo', 'Zuma',
  'Aucamp', 'Bhengu', 'Coka', 'Dikweni', 'Engelbrecht'
];

function buildHumanName(index) {
  const firstName = FIRST_NAMES[index % FIRST_NAMES.length];
  const lastName = LAST_NAMES[index % LAST_NAMES.length];
  return { first_name: firstName, last_name: lastName };
}

function isDemoMember(member) {
  const memberNumber = member.member_number || '';
  return (
    DEMO_MEMBER_PREFIXES.some((prefix) => memberNumber.startsWith(prefix)) ||
    DEMO_BROKER_CODES.includes(member.broker_code)
  );
}

async function fetchAllRows(table, columns) {
  const pageSize = 1000;
  let from = 0;
  const rows = [];

  while (true) {
    const { data, error } = await supabase
      .from(table)
      .select(columns)
      .range(from, from + pageSize - 1);

    if (error) {
      throw new Error(`${table}: ${error.message}`);
    }

    rows.push(...(data || []));

    if (!data || data.length < pageSize) {
      break;
    }

    from += pageSize;
  }

  return rows;
}

async function updatePlanNames(table, rows) {
  let changed = 0;

  for (const row of rows) {
    const nextPlanName = PLAN_NAME_MAP[row.plan_name];
    if (!nextPlanName || nextPlanName === row.plan_name) {
      continue;
    }

    const { error } = await supabase
      .from(table)
      .update({ plan_name: nextPlanName })
      .eq('id', row.id);

    if (error) {
      throw new Error(`${table} plan update failed for ${row.id}: ${error.message}`);
    }

    changed += 1;
  }

  return changed;
}

async function main() {
  console.log('Inspecting demo members and plan names...\n');

  const [allMembers, allApplications, allProducts] = await Promise.all([
    fetchAllRows('members', 'id, member_number, first_name, last_name, broker_code, plan_name, email'),
    fetchAllRows('applications', 'id, application_number, first_name, last_name, plan_name, email'),
    fetchAllRows('products', 'id, name, status'),
  ]);

  const demoMembers = allMembers
    .filter(isDemoMember)
    .sort((a, b) => (a.member_number || '').localeCompare(b.member_number || ''));

  console.log(`Demo members found: ${demoMembers.length}`);
  console.log(`Applications found: ${allApplications.length}`);
  console.log(`Products found: ${allProducts.length}\n`);

  if (demoMembers.length !== 115) {
    console.log('Warning: expected 115 demo members, continuing with the live count.\n');
  }

  const preview = demoMembers.slice(0, 10).map((member, index) => ({
    member_number: member.member_number,
    before: `${member.first_name || ''} ${member.last_name || ''}`.trim(),
    after: `${buildHumanName(index).first_name} ${buildHumanName(index).last_name}`,
    plan_name: PLAN_NAME_MAP[member.plan_name] || member.plan_name || null,
  }));

  console.log('Preview of member identity updates:');
  preview.forEach((row) => {
    console.log(`- ${row.member_number}: "${row.before}" -> "${row.after}" | plan: ${row.plan_name || 'unchanged'}`);
  });
  console.log('');

  for (let index = 0; index < demoMembers.length; index += 1) {
    const member = demoMembers[index];
    const nextName = buildHumanName(index);
    const nextPlanName = PLAN_NAME_MAP[member.plan_name] || member.plan_name;

    const payload = {
      first_name: nextName.first_name,
      last_name: nextName.last_name,
      plan_name: nextPlanName,
    };

    const { error } = await supabase
      .from('members')
      .update(payload)
      .eq('id', member.id);

    if (error) {
      throw new Error(`Member update failed for ${member.member_number}: ${error.message}`);
    }
  }

  const applicationPlanUpdates = await updatePlanNames('applications', allApplications);

  const productRowsToUpdate = allProducts.filter((product) => PLAN_NAME_MAP[product.name]);
  let productUpdates = 0;
  for (const product of productRowsToUpdate) {
    const { error } = await supabase
      .from('products')
      .update({ name: PLAN_NAME_MAP[product.name] })
      .eq('id', product.id);

    if (error) {
      throw new Error(`Product update failed for ${product.id}: ${error.message}`);
    }

    productUpdates += 1;
  }

  const refreshedMembers = await fetchAllRows('members', 'member_number, first_name, last_name, broker_code, plan_name');
  const refreshedDemoMembers = refreshedMembers
    .filter(isDemoMember)
    .sort((a, b) => (a.member_number || '').localeCompare(b.member_number || ''));

  const distinctDemoPlans = [...new Set(refreshedDemoMembers.map((member) => member.plan_name).filter(Boolean))].sort();

  console.log('Update complete.\n');
  console.log(`Members renamed: ${demoMembers.length}`);
  console.log(`Applications plan_name updates: ${applicationPlanUpdates}`);
  console.log(`Products renamed: ${productUpdates}`);
  console.log(`Distinct demo member plans: ${distinctDemoPlans.join(', ') || 'none'}\n`);

  console.log('First 12 updated demo members:');
  refreshedDemoMembers.slice(0, 12).forEach((member) => {
    console.log(`- ${member.member_number}: ${member.first_name} ${member.last_name} | ${member.plan_name || 'No plan'}`);
  });
}

main().catch((error) => {
  console.error('\nUpdate failed:', error.message || error);
  process.exit(1);
});
