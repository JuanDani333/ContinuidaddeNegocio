import supabase from './config/supabase';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function fix() {
  const newHash = await bcrypt.hash('admin123', 10);
  console.log('Generated new hash for admin123:', newHash);

  const { data, error } = await supabase
    .from('app_admins')
    .update({ password_hash: newHash })
    .eq('username', 'admin')
    .select();

  if (error) {
    console.error('Update Error:', error);
  } else {
    console.log('Update Success:', data);
  }
}

fix();
