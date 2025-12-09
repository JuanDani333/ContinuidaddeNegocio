import supabase from './config/supabase';
import bcrypt from 'bcryptjs';

async function debugAuth() {
  console.log('--- Debugging Auth ---');

  // 1. Check if admin exists
  const { data: admins, error } = await supabase
    .from('app_admins')
    .select('*')
    .eq('username', 'admin');

  if (error) {
    console.error('Error fetching admin:', error);
    return;
  }

  if (!admins || admins.length === 0) {
    console.error('❌ Admin user "admin" NOT found in app_admins table.');
  } else {
    console.log('✅ Admin user found:', admins[0]);
    const storedHash = admins[0].password_hash;
    console.log('Stored Hash:', storedHash);

    // 2. Verify password 'admin123' against stored hash
    const isMatch = await bcrypt.compare('admin123', storedHash);
    console.log(`Password 'admin123' matches stored hash? ${isMatch ? '✅ YES' : '❌ NO'}`);
  }

  // 3. Verify user provided hash
  const userHash = '$2b$10$H8Hnz7J8Q9V6M5K3Y2WZDeNc1LpOqRSTuVwXyZzAaBbCcDdEeFfGg';
  const isUserHashMatch = await bcrypt.compare('admin123', userHash);
  console.log(`Password 'admin123' matches USER provided hash? ${isUserHashMatch ? '✅ YES' : '❌ NO'}`);

  // 4. Generate new hash for 'admin123' to be sure
  const newHash = await bcrypt.hash('admin123', 10);
  console.log('New generated hash for admin123:', newHash);
}

debugAuth();
