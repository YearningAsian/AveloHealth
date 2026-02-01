import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignUpData {
  phoneNumber: string;
  accountNumber: string;
  name: string;
  dateOfBirth: string;
}

export interface User {
  id: string;
  name: string;
  dateOfBirth: string;
  phoneNumber: string;
  accountNumber: string;
}

export interface DiaryEntry {
  id: string;
  date: string;
  symptoms: string;
  severity: 'high' | 'medium' | 'low';
  category: string;
  notes?: string;
}

export interface DashboardData {
  user: User;
  recentEntries: DiaryEntry[];
  stats: {
    totalEntries: number;
    entriesByCategory: { category: string; count: number }[];
    entriesBySeverity: { severity: string; count: number }[];
    entriesOverTime: { date: string; count: number; highCount: number; mediumCount: number; lowCount: number }[];
  };
}

// Auth API
export const authAPI = {
  login: async (credentials: LoginCredentials) => {
    const response = await api.post('/api/auth/login', credentials);
    return response.data;
  },

  signUp: async (data: SignUpData) => {
    const response = await api.post('/api/auth/signup', data);
    return response.data;
  },

  verifyPhone: async (phoneNumber: string, code: string) => {
    const response = await api.post('/api/auth/verify-phone', { phoneNumber, code });
    return response.data;
  },

  sendVerificationCode: async (phoneNumber: string) => {
    const response = await api.post('/api/auth/send-verification', { phoneNumber });
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  },
};

// Dashboard API
export const dashboardAPI = {
  getDashboardData: async (): Promise<DashboardData> => {
    const response = await api.get('/api/dashboard');
    return response.data;
  },

  getEntries: async (filters?: {
    severity?: string;
    category?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: 'newest' | 'oldest';
  }) => {
    const response = await api.get('/api/entries', { params: filters });
    return response.data;
  },

  addEntry: async (entry: Omit<DiaryEntry, 'id'>) => {
    const response = await api.post('/api/entries', entry);
    return response.data;
  },
};

// Mock data for demo purposes
export const getMockDashboardData = (): DashboardData => {
  const today = new Date();
  const entries: DiaryEntry[] = [
    { id: '1', date: new Date(today.getTime() - 0 * 24 * 60 * 60 * 1000).toISOString(), symptoms: 'Headache, fatigue', severity: 'medium', category: 'General' },
    { id: '2', date: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(), symptoms: 'Mild cough', severity: 'low', category: 'Respiratory' },
    { id: '3', date: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(), symptoms: 'Severe back pain', severity: 'high', category: 'Musculoskeletal' },
    { id: '4', date: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(), symptoms: 'Stomach discomfort', severity: 'medium', category: 'Digestive' },
    { id: '5', date: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(), symptoms: 'Dizziness', severity: 'low', category: 'Neurological' },
    { id: '6', date: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(), symptoms: 'Chest tightness', severity: 'high', category: 'Cardiovascular' },
    { id: '7', date: new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(), symptoms: 'Skin rash', severity: 'medium', category: 'Dermatological' },
    { id: '8', date: new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(), symptoms: 'Joint stiffness', severity: 'low', category: 'Musculoskeletal' },
    { id: '9', date: new Date(today.getTime() - 21 * 24 * 60 * 60 * 1000).toISOString(), symptoms: 'Severe migraine', severity: 'high', category: 'Neurological' },
    { id: '10', date: new Date(today.getTime() - 28 * 24 * 60 * 60 * 1000).toISOString(), symptoms: 'Nausea', severity: 'medium', category: 'Digestive' },
    { id: '11', date: new Date(today.getTime() - 35 * 24 * 60 * 60 * 1000).toISOString(), symptoms: 'Shortness of breath', severity: 'high', category: 'Respiratory' },
    { id: '12', date: new Date(today.getTime() - 45 * 24 * 60 * 60 * 1000).toISOString(), symptoms: 'Fatigue', severity: 'low', category: 'General' },
  ];

  // Generate time series data
  const entriesOverTime: { date: string; count: number; highCount: number; mediumCount: number; lowCount: number }[] = [];
  for (let i = 30; i >= 0; i--) {
    const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split('T')[0];
    const dayEntries = entries.filter(e => e.date.split('T')[0] === dateStr);
    entriesOverTime.push({
      date: dateStr,
      count: dayEntries.length,
      highCount: dayEntries.filter(e => e.severity === 'high').length,
      mediumCount: dayEntries.filter(e => e.severity === 'medium').length,
      lowCount: dayEntries.filter(e => e.severity === 'low').length,
    });
  }

  // Category breakdown
  const categories = ['General', 'Respiratory', 'Musculoskeletal', 'Digestive', 'Neurological', 'Cardiovascular', 'Dermatological'];
  const entriesByCategory = categories.map(category => ({
    category,
    count: entries.filter(e => e.category === category).length,
  })).filter(c => c.count > 0);

  // Severity breakdown
  const entriesBySeverity = [
    { severity: 'High', count: entries.filter(e => e.severity === 'high').length },
    { severity: 'Medium', count: entries.filter(e => e.severity === 'medium').length },
    { severity: 'Low', count: entries.filter(e => e.severity === 'low').length },
  ];

  return {
    user: {
      id: 'user_001',
      name: 'Sarah Johnson',
      dateOfBirth: '1985-06-15',
      phoneNumber: '(555) 123-4567',
      accountNumber: 'AVL123456789',
    },
    recentEntries: entries,
    stats: {
      totalEntries: entries.length,
      entriesByCategory,
      entriesBySeverity,
      entriesOverTime,
    },
  };
};

export default api;
