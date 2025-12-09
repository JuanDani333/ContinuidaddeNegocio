import supabase from './config/supabase';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

// Load env from the root of backend
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function test() {
  console.log('Testing login for admin...');
  console.log('Supabase URL:', process.env.SUPABASE_URL);
  
  const { data: users, error } = await supabase
    .from('app_admins')
    .select('*')
    .eq('username', 'admin');

  if (error) {
    console.error('DB Error:', error);
    return;
  }

  if (!users || users.length === 0) {
    console.log('User admin NOT FOUND in table app_admins');
    return;
  }

  console.log('User found:', users[0].username);
  const hash = users[0].password_hash;
  console.log('Hash from DB:', hash);
  
  const isMatch = await bcrypt.compare('admin123', hash);
  console.log('Password match for admin123:', isMatch);
}

test();
