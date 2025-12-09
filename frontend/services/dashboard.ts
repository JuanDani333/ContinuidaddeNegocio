import { AreaData } from '../types';

// Use the same port as auth service (5176)
const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5176'}/api/dashboard`;

export const fetchDashboardData = async (): Promise<AreaData[]> => {
  const response = await fetch(API_URL);
  
  if (!response.ok) {
    throw new Error('Error fetching dashboard data');
  }

  return response.json();
};
