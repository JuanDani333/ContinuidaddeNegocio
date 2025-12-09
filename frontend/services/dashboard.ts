import { AreaData } from '../types';

// Use the same port as auth service (5176)
import { API_BASE_URL } from '../config';

const API_URL = `${API_BASE_URL}/api/dashboard`;

export const fetchDashboardData = async (): Promise<AreaData[]> => {
  const response = await fetch(API_URL);
  
  if (!response.ok) {
    throw new Error('Error fetching dashboard data');
  }

  return response.json();
};
