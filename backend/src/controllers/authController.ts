import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import supabase from '../config/supabase';

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    // Query Supabase for the user
    const { data: users, error } = await supabase
      .from('app_admins')
      .select('*')
      .eq('username', username)
      .limit(1);

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ message: 'Database error' });
    }

    if (!users || users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET as string, {
      expiresIn: '1h',
    });

    res.json({ token, user: { id: user.id, username: user.username, display_name: user.display_name } });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
