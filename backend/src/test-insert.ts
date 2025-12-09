import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
  console.log('--- Testing Insertion ---');
  
  const testAttempt = {
    user_id: 'dlincango@digimentore.com.ec', // Existing user
    skill_id: 'eac_1_combined', // Existing skill
    course_id: 'team-eac', // Existing course
    raw_attempt: 999, // Test attempt number
    unit_time_seconds: 123,
    total_time_seconds: 456,
    session_id: `test_session_${Date.now()}`,
    timestamp: new Date().toISOString()
  };

  console.log('Inserting:', testAttempt);

  const { data, error } = await supabase
    .from('attempts')
    .insert([testAttempt])
    .select();

  if (error) {
    console.error('❌ Error inserting:', error);
  } else {
    console.log('✅ Inserted successfully:', data);
  }
}

testInsert();
