/**
 * Teli AI Types - Voice Interaction & Scheduling
 */

export interface TeliAICallRequest {
  patientId: string;
  callType: 'onboarding' | 'follow-up' | 'appointment-reminder' | 'health-check';
  scheduledTime?: string;
  callbackNumber: string;
  script?: string;
  maxDuration?: number; // in minutes
}

export interface TeliAICallResponse {
  callId: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'failed';
  initiatedAt: string;
  completedAt?: string;
  duration?: number; // in seconds
  transcript?: string;
  summary?: string;
  extractedData?: ExtractedCallData;
  sentiment?: 'positive' | 'neutral' | 'negative';
}

export interface ExtractedCallData {
  // Onboarding specific
  confirmedPersonalInfo?: boolean;
  insuranceInfo?: InsuranceInfo;
  primaryCareProvider?: string;
  emergencyContact?: EmergencyContact;
  
  // Health Check specific
  symptoms?: string[];
  painLevel?: number; // 1-10
  medicationCompliance?: 'compliant' | 'partial' | 'non-compliant';
  
  // Appointment specific
  appointmentConfirmed?: boolean;
  rescheduleRequested?: boolean;
  newAppointmentTime?: string;
  
  // General
  concernsRaised?: string[];
  followUpNeeded?: boolean;
}

export interface InsuranceInfo {
  provider: string;
  policyNumber: string;
  groupNumber?: string;
  verified: boolean;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface TeliAIWebhookPayload {
  event: 'call.started' | 'call.completed' | 'call.failed' | 'transcript.ready';
  callId: string;
  patientId: string;
  timestamp: string;
  data: TeliAICallResponse;
}

export interface ScheduledCall {
  id: string;
  patientId: string;
  patientName: string;
  callType: string;
  scheduledTime: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  teliCallId?: string;
  createdBy: string;
  createdAt: string;
}
