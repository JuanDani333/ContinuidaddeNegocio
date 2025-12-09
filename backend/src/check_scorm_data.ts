import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
  console.log('🔍 Buscando el usuario más reciente...');
  const { data: users, error: userError } = await supabase
    .from('users')
    .select('*')
    .order('last_seen', { ascending: false })
    .limit(1);

  if (userError) {
    console.error('Error buscando usuario:', userError.message);
  } else {
    console.log('👤 Último Usuario:', users);
  }

  console.log('\n🔍 Buscando los intentos más recientes...');
  const { data: attempts, error: attemptError } = await supabase
    .from('attempts')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(5);

  if (attemptError) {
    console.error('Error buscando intentos:', attemptError.message);
  } else {
    console.log('📊 Últimos 5 Intentos:', attempts);
  }
}

checkData();
