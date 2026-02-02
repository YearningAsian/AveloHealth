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
  password: string;
  email?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
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

  verifyEmail: async (email: string, code: string) => {
    const response = await api.post('/api/auth/verify-email', { email, code });
    return response.data;
  },

  sendVerificationCode: async (phoneNumber?: string, email?: string, channel: 'sms' | 'email' | 'call' = 'sms') => {
    const response = await api.post('/api/auth/send-verification', { phoneNumber, email, channel });
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
    const response = await api.get('/api/dashboard/');
    return response.data;
  },

  getEntries: async (filters?: {
    severity?: string;
    category?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: 'newest' | 'oldest';
  }) => {
    const response = await api.get('/api/dashboard/entries', { params: filters });
    return response.data;
  },

  addEntry: async (entry: Omit<DiaryEntry, 'id'>) => {
    const response = await api.post('/api/dashboard/entries', entry);
    return response.data;
  },

  updateProfile: async (data: { familyHistory?: string[]; profileImage?: string }) => {
    const response = await api.patch('/api/dashboard/profile', data);
    return response.data;
  },

  getAIInsights: async () => {
    const response = await api.get('/api/dashboard/ai-insights');
    return response.data;
  },
};

// Appointments API
export interface Appointment {
  id: string;
  title: string;
  providerName: string;
  providerPhone: string;
  providerSpecialty?: string;
  location: string;
  date: string;
  time: string;
  status: string;
  previousStatus?: string;
  reminderEnabled: boolean;
  canUndo?: boolean;
  notes?: string;
}

export const appointmentsAPI = {
  getAppointments: async (status?: string): Promise<{ success: boolean; data: Appointment[] }> => {
    const response = await api.get('/api/appointments', { params: status ? { status } : {} });
    return response.data;
  },

  getAppointment: async (id: string): Promise<{ success: boolean; data: Appointment }> => {
    const response = await api.get(`/api/appointments/${id}`);
    return response.data;
  },

  createAppointment: async (data: {
    providerId?: string;
    title: string;
    appointmentDate: string;
    appointmentTime: string;
    location?: string;
    reminderEnabled?: boolean;
    notes?: string;
  }): Promise<{ success: boolean; data: Appointment }> => {
    const response = await api.post('/api/appointments', data);
    return response.data;
  },

  cancelAppointment: async (id: string, reason?: string, preferredCallHour?: number): Promise<{ success: boolean }> => {
    const response = await api.post(`/api/appointments/${id}/cancel`, { reason, preferredCallHour });
    return response.data;
  },

  rescheduleAppointment: async (id: string, newDate: string, newTime: string, reason?: string, preferredCallHour?: number): Promise<{ success: boolean }> => {
    const response = await api.post(`/api/appointments/${id}/reschedule`, { newDate, newTime, reason, preferredCallHour });
    return response.data;
  },

  undoAction: async (id: string): Promise<{ success: boolean }> => {
    const response = await api.post(`/api/appointments/${id}/undo`);
    return response.data;
  },

  toggleReminder: async (id: string, enabled: boolean): Promise<{ success: boolean }> => {
    const response = await api.patch(`/api/appointments/${id}/reminder`, { enabled });
    return response.data;
  },

  deleteAppointment: async (id: string): Promise<{ success: boolean }> => {
    const response = await api.delete(`/api/appointments/${id}`);
    return response.data;
  },
};

// Providers API
export interface Provider {
  id: string;
  name: string;
  specialty: string;
  phoneNumber: string;
  location: string;
  address: string;
  acceptsTeliCalls: boolean;
}

export const providersAPI = {
  getProviders: async (specialty?: string): Promise<{ success: boolean; data: Provider[] }> => {
    const response = await api.get('/api/providers', { params: specialty ? { specialty } : {} });
    return response.data;
  },

  getProvider: async (id: string): Promise<{ success: boolean; data: Provider }> => {
    const response = await api.get(`/api/providers/${id}`);
    return response.data;
  },
};

export default api;
