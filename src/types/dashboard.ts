/**
 * Dashboard & Analytics Types
 */

export interface DashboardStats {
  // Patient Metrics
  totalPatients: number;
  activePatients: number;
  newPatientsThisMonth: number;
  
  // Risk Distribution
  highRiskPatients: number;
  criticalPatients: number;
  patientsNeedingOutreach: number;
  
  // Appointments
  appointmentsToday: number;
  appointmentsThisWeek: number;
  noShowRate: number;
  appointmentsCompleted?: number;
  appointmentsPending?: number;
  
  // AI Activity
  aiAnalysesThisWeek: number;
  teliCallsThisWeek: number;
  averageRiskScore: number;
  
  // Engagement
  patientResponseRate: number;
  averageTimeToContact: number; // in hours
  
  // Professional-specific
  assignedPatients?: number;
  newCallData?: number;
  recentPatientUpdates?: number;
}

export interface RiskDistribution {
  low: number;
  medium: number;
  high: number;
  critical: number;
}

export interface TrendData {
  date: string;
  value: number;
  label?: string;
}

export interface OutreachQueue {
  id: string;
  patientId: string;
  patientName: string;
  riskLevel: 'high' | 'critical';
  reason: string;
  priority: number;
  daysOverdue: number;
  recommendedAction: string;
  assignedTo?: string;
  status: 'pending' | 'in-progress' | 'completed';
}

export interface RecentActivity {
  id: string;
  type: 'ai-analysis' | 'teli-call' | 'appointment' | 'patient-update';
  description: string;
  patientName?: string;
  timestamp: string;
  userId?: string;
  status: 'success' | 'warning' | 'error';
}

export interface SystemHealth {
  snowflakeConnected: boolean;
  geminiApiHealthy: boolean;
  teliAiHealthy: boolean;
  lastDataSync: string;
  activeUsers: number;
}
