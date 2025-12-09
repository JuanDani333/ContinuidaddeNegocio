import supabase from './config/supabase';

async function inspectSchema() {
  console.log('--- Courses ---');
  const { data: courses } = await supabase.from('courses').select('*').limit(1);
  console.log(courses?.[0]);

  console.log('--- Skills ---');
  const { data: skills } = await supabase.from('skills').select('*').limit(1);
  console.log(skills?.[0]);

  console.log('--- Users ---');
  const { data: users } = await supabase.from('users').select('*').limit(1);
  console.log(users?.[0]);

  console.log('--- Attempts (Latest) ---');
  const { data: attempts } = await supabase
    .from('attempts')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(1);
  console.log(attempts?.[0]);
}

inspectSchema();
