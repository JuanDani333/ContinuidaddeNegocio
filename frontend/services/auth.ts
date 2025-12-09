import { UserSession } from '../types';

import { API_BASE_URL } from '../config';

const API_URL = `${API_BASE_URL}/api/auth`;

export const login = async (username: string, password: string): Promise<UserSession> => {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error en el inicio de sesión');
  }

  const data = await response.json();
  
  // Map backend response to UserSession
  return {
    username: data.user.username,
    token: data.token,
    role: 'admin', // Hardcoded as per requirement
    display_name: data.user.display_name
  };
};
