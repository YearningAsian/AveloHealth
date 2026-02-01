/**
 * API Client for AveloHealth Backend
 */

import axios, { AxiosInstance } from 'axios';
import type { ApiResponse, PaginatedResponse } from '@/types';

class APIClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized - clear token and redirect to login
          this.clearToken();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  loadToken() {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        this.token = token;
      }
    }
  }

  // Authentication
  async login(email: string, password: string) {
    const response = await this.client.post('/api/auth/login', { email, password });
    return response.data;
  }

  async getCurrentUser() {
    const response = await this.client.get('/api/auth/me');
    return response.data;
  }

  // Patients
  async getPatients(params?: { riskLevel?: string; limit?: number; offset?: number }) {
    const response = await this.client.get('/api/patients/', { params });
    return response.data;
  }

  async getPatient(patientId: string) {
    const response = await this.client.get(`/api/patients/${patientId}`);
    return response.data;
  }

  async getHighRiskPatients(limit?: number) {
    const response = await this.client.get('/api/patients/high-risk/list', {
      params: { limit },
    });
    return response.data;
  }

  // AI Analysis
  async analyzePatient(patientId: string, analysisType: string = 'triage') {
    const response = await this.client.post('/api/ai/analyze-patient', {
      patientId,
      analysisType,
    });
    return response.data;
  }

  async runPredictiveTriage(limit?: number) {
    const response = await this.client.post('/api/ai/predictive-triage', null, {
      params: { limit },
    });
    return response.data;
  }

  async generateOutreachScript(patientId: string) {
    const response = await this.client.post('/api/ai/generate-outreach-script', null, {
      params: { patient_id: patientId },
    });
    return response.data;
  }

  // Teli AI
  async initiateTeliCall(patientId: string, callType: string, script?: string) {
    const response = await this.client.post('/api/teli/initiate-call', {
      patientId,
      callType,
      script,
    });
    return response.data;
  }

  async scheduleTeliCall(
    patientId: string,
    callType: string,
    scheduledTime: string,
    script?: string
  ) {
    const response = await this.client.post('/api/teli/schedule-call', {
      patientId,
      callType,
      scheduledTime,
      script,
    });
    return response.data;
  }

  async getCallStatus(callId: string) {
    const response = await this.client.get(`/api/teli/call/${callId}/status`);
    return response.data;
  }

  // Dashboard
  async getDashboardStats() {
    const response = await this.client.get('/api/appointments/dashboard');
    return response.data;
  }

  async getAppointmentStats() {
    const response = await this.client.get('/api/appointments/stats');
    return response.data;
  }

  // Health Check
  async healthCheck() {
    const response = await this.client.get('/health');
    return response.data;
  }
}

export const apiClient = new APIClient();
