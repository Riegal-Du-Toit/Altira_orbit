const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './apps/backend/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixComplianceRoles() {
  console.log('🔧 Fixing compliance user roles...\n');

  // Get compliance user
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id, email')
    .eq('email', 'compliance@system.com')
    .single();

  if (userError || !user) {
    console.error('❌ Compliance user not found');
    return;
  }

  console.log(`✅ Found user: ${user.email}`);

  // Get compliance_officer role ID
  const { data: complianceRole, error: roleError } = await supabase
    .from('roles')
    .select('id, name')
    .eq('name', 'compliance_officer')
    .single();

  if (roleError || !complianceRole) {
    console.error('❌ Compliance officer role not found');
    return;
  }

  console.log(`✅ Found role: ${complianceRole.name}`);

  // Delete ALL user_roles for this user
  const { error: deleteError } = await supabase
    .from('user_roles')
    .delete()
    .eq('user_id', user.id);

  if (deleteError) {
    console.error('❌ Error deleting old roles:', deleteError.message);
    return;
  }

  console.log('✅ Deleted all old roles');

  // Insert ONLY compliance_officer role
  const { error: insertError } = await supabase
    .from('user_roles')
    .insert({
      user_id: user.id,
      role_id: complianceRole.id,
    });

  if (insertError) {
    console.error('❌ Error inserting role:', insertError.message);
    return;
  }

  console.log('✅ Assigned compliance_officer role');

  // Verify
  const { data: userRoles, error: verifyError } = await supabase
    .from('user_roles')
    .select(`
      role_id,
      roles (name)
    `)
    .eq('user_id', user.id);

  if (verifyError) {
    console.error('❌ Error verifying:', verifyError.message);
    return;
  }

  console.log('\n✅ Current roles for compliance@system.com:');
  userRoles.forEach(ur => {
    console.log(`  - ${ur.roles.name}`);
  });

  console.log('\n✅ Done! User now has ONLY compliance_officer role.');
  console.log('💡 Please logout and login again.');
}

fixComplianceRoles();
