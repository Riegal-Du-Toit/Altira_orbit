const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const BROKER_UPDATES = {
  ALB: 'Orbit Blue',
  ALC: 'Orbit Core',
  ALD: 'Orbit Direct',
  ALM: 'Orbit Metro',
  ALR: 'Orbit Reach',
};

const DEMO_PRODUCTS = [
  {
    name: 'Value Plus Hospital Plan',
    code: 'VALUE_PLUS_HOSPITAL',
    slug: 'value-plus-hospital-plan',
    category: 'hospital',
    regime: 'insurance',
    status: 'published',
    description: 'Private hospital cover including illness, accident, emergency support, and funeral benefits.',
    price_single: 390,
    price_couple: 702,
    price_per_child: 156,
    price_range_min: 390,
    price_range_max: 1326,
    age_restriction: 'Ages 18-64',
    monthly_premium: 390,
    cover_amount: 57000,
    benefits: [
      { name: 'Hospital Cover', type: 'hospital', description: 'R10,000 per day up to 21 days for private in-hospital illness.', cover_amount: 57000, waiting_period_days: 90 },
      { name: 'Accident Cover', type: 'accident', description: 'R150,000 single / R300,000 family cover per incident.', cover_amount: 150000, waiting_period_days: 30, family_cover_amount: 300000 },
      { name: '24hr Ambulance', type: 'ambulance', description: '24-hour emergency support and pre-authorisation assistance.', cover_amount: null, waiting_period_days: 0 },
      { name: 'Funeral Cover', type: 'funeral', description: 'R20,000 member and spouse funeral cover with child tiers.', cover_amount: 20000, waiting_period_days: 90 },
    ],
  },
  {
    name: 'Platinum Hospital Plan',
    code: 'PLATINUM_HOSPITAL',
    slug: 'platinum-hospital-plan',
    category: 'hospital',
    regime: 'insurance',
    status: 'published',
    description: 'Enhanced hospital cover with critical illness, maternity, disability, and emergency support.',
    price_single: 560,
    price_couple: 1008,
    price_per_child: 224,
    price_range_min: 560,
    price_range_max: 1904,
    age_restriction: 'All ages',
    monthly_premium: 560,
    cover_amount: 57000,
    benefits: [
      { name: 'Hospital Cover', type: 'hospital', description: 'R10,000 per day up to 21 days with enhanced day-three cover.', cover_amount: 57000, waiting_period_days: 90 },
      { name: 'Critical Illness', type: 'critical_illness', description: 'Up to R250,000 cover for qualifying critical illnesses.', cover_amount: 250000, waiting_period_days: 90 },
      { name: 'Maternity', type: 'maternity', description: 'R20,000 birth benefit for hospital delivery.', cover_amount: 20000, waiting_period_days: 365 },
      { name: 'Disability', type: 'disability', description: 'R250,000 accidental permanent disability cover.', cover_amount: 250000, waiting_period_days: 0 },
      { name: '24hr Ambulance', type: 'ambulance', description: '24-hour emergency support and pre-authorisation assistance.', cover_amount: null, waiting_period_days: 0 },
    ],
  },
  {
    name: 'Executive Hospital Plan',
    code: 'EXECUTIVE_HOSPITAL',
    slug: 'executive-hospital-plan',
    category: 'hospital',
    regime: 'insurance',
    status: 'published',
    description: 'Premium hospital cover with illness top-up, critical illness, disability, maternity, and strong accident cover.',
    price_single: 640,
    price_couple: 1152,
    price_per_child: 256,
    price_range_min: 640,
    price_range_max: 2176,
    age_restriction: 'All ages',
    monthly_premium: 640,
    cover_amount: 66000,
    benefits: [
      { name: 'Hospital Cover', type: 'hospital', description: 'R10,000 per day plus top-up support and enhanced daily rates.', cover_amount: 66000, waiting_period_days: 90 },
      { name: 'Illness Top-Up', type: 'illness_topup', description: 'Up to R25,000 per insured person per year.', cover_amount: 25000, waiting_period_days: 90 },
      { name: 'Accident Cover', type: 'accident', description: 'R250,000 single / R500,000 family cover per incident.', cover_amount: 250000, waiting_period_days: 0, family_cover_amount: 500000 },
      { name: 'Critical Illness', type: 'critical_illness', description: 'Up to R250,000 cover for qualifying critical illnesses.', cover_amount: 250000, waiting_period_days: 90 },
      { name: 'Disability', type: 'disability', description: 'R250,000 accidental permanent disability cover.', cover_amount: 250000, waiting_period_days: 0 },
      { name: 'Maternity', type: 'maternity', description: 'R20,000 birth benefit for hospital delivery.', cover_amount: 20000, waiting_period_days: 365 },
    ],
  },
  {
    name: 'Value Plus Senior Hospital Plan',
    code: 'VALUE_PLUS_SENIOR_HOSPITAL',
    slug: 'value-plus-senior-hospital-plan',
    category: 'senior',
    regime: 'insurance',
    status: 'published',
    description: 'Senior-focused hospital cover with accident, emergency, and funeral support.',
    price_single: 580,
    price_couple: 1160,
    price_per_child: 0,
    price_range_min: 580,
    price_range_max: 1160,
    age_restriction: '65 years and older',
    monthly_premium: 580,
    cover_amount: 57000,
    benefits: [
      { name: 'Hospital Cover', type: 'hospital', description: 'R10,000 per day up to 21 days for senior hospital admissions.', cover_amount: 57000, waiting_period_days: 90 },
      { name: 'Accident Cover', type: 'accident', description: 'R75,000 single / R150,000 couple support for qualifying incidents.', cover_amount: 75000, waiting_period_days: 30, family_cover_amount: 150000 },
      { name: '24hr Ambulance', type: 'ambulance', description: '24-hour emergency support and pre-authorisation assistance.', cover_amount: null, waiting_period_days: 0 },
      { name: 'Funeral Cover', type: 'funeral', description: 'R5,000 principal member and spouse funeral cover.', cover_amount: 5000, waiting_period_days: 90 },
    ],
  },
];

async function updateBrokerNames() {
  let count = 0;

  for (const [code, name] of Object.entries(BROKER_UPDATES)) {
    const { error } = await supabase
      .from('brokers')
      .update({ name })
      .eq('code', code);

    if (error) {
      throw new Error(`Broker update failed for ${code}: ${error.message}`);
    }

    count += 1;
  }

  return count;
}

async function upsertProduct(product) {
  const { data: existing, error: lookupError } = await supabase
    .from('products')
    .select('id')
    .eq('slug', product.slug)
    .maybeSingle();

  if (lookupError) {
    throw new Error(`Product lookup failed for ${product.slug}: ${lookupError.message}`);
  }

  let productId = existing?.id || null;

  if (productId) {
    const { error } = await supabase
      .from('products')
      .update({
        name: product.name,
        code: product.code,
        category: product.category,
        regime: product.regime,
        status: product.status,
        description: product.description,
        price_single: product.price_single,
        price_couple: product.price_couple,
        price_per_child: product.price_per_child,
        price_range_min: product.price_range_min,
        price_range_max: product.price_range_max,
        age_restriction: product.age_restriction,
        monthly_premium: product.monthly_premium,
        cover_amount: product.cover_amount,
      })
      .eq('id', productId);

    if (error) {
      throw new Error(`Product update failed for ${product.name}: ${error.message}`);
    }
  } else {
    const { data, error } = await supabase
      .from('products')
      .insert({
        name: product.name,
        code: product.code,
        slug: product.slug,
        category: product.category,
        regime: product.regime,
        status: product.status,
        description: product.description,
        price_single: product.price_single,
        price_couple: product.price_couple,
        price_per_child: product.price_per_child,
        price_range_min: product.price_range_min,
        price_range_max: product.price_range_max,
        age_restriction: product.age_restriction,
        monthly_premium: product.monthly_premium,
        cover_amount: product.cover_amount,
      })
      .select('id')
      .single();

    if (error) {
      throw new Error(`Product insert failed for ${product.name}: ${error.message}`);
    }

    productId = data.id;
  }

  const { error: deleteBenefitsError } = await supabase
    .from('product_benefits')
    .delete()
    .eq('product_id', productId);

  if (deleteBenefitsError) {
    throw new Error(`Benefit cleanup failed for ${product.name}: ${deleteBenefitsError.message}`);
  }

  const benefitsToInsert = product.benefits.map((benefit) => ({
    product_id: productId,
    name: benefit.name,
    type: benefit.type,
    description: benefit.description,
    cover_amount: benefit.cover_amount,
    waiting_period_days: benefit.waiting_period_days,
    family_cover_amount: benefit.family_cover_amount || null,
  }));

  const { error: insertBenefitsError } = await supabase
    .from('product_benefits')
    .insert(benefitsToInsert);

  if (insertBenefitsError) {
    throw new Error(`Benefit insert failed for ${product.name}: ${insertBenefitsError.message}`);
  }

  return productId;
}

async function main() {
  console.log('Updating broker labels and seeding demo products...\n');

  const brokerCount = await updateBrokerNames();
  console.log(`Brokers updated: ${brokerCount}`);

  const productIds = [];
  for (const product of DEMO_PRODUCTS) {
    const productId = await upsertProduct(product);
    productIds.push({ id: productId, name: product.name });
    console.log(`Seeded product: ${product.name}`);
  }

  const { data: brokers } = await supabase
    .from('brokers')
    .select('code, name')
    .in('code', Object.keys(BROKER_UPDATES))
    .order('code');

  const { data: products } = await supabase
    .from('products')
    .select('id, name, status')
    .in('id', productIds.map((item) => item.id))
    .order('name');

  console.log('\nBroker labels now:');
  (brokers || []).forEach((broker) => {
    console.log(`- ${broker.code}: ${broker.name}`);
  });

  console.log('\nPolicy Creator demo products now:');
  (products || []).forEach((product) => {
    console.log(`- ${product.name} (${product.status})`);
  });
}

main().catch((error) => {
  console.error('\nSetup failed:', error.message || error);
  process.exit(1);
});
