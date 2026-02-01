/**
 * Core Patient Types - HIPAA Compliant
 * Follows data minimization principles
 */

export interface Patient {
  id: string;
  // PHI (Protected Health Information)
  firstName: string;
  lastName: string;
  dateOfBirth: string; // ISO 8601 format
  email?: string;
  phone: string;
  
  // Medical Information
  medicalRecordNumber: string;
  primaryDiagnosis?: string[];
  chronicConditions: ChronicCondition[];
  allergies?: string[];
  medications?: Medication[];
  
  // Risk Assessment
  riskScore: number; // 0-100, calculated by Gemini AI
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  lastTriageDate?: string;
  
  // Engagement
  lastContactDate?: string;
  preferredContactMethod: 'phone' | 'email' | 'sms';
  consentForAI: boolean;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  lastModifiedBy: string;
}

export interface ChronicCondition {
  code: string; // ICD-10 code
  name: string;
  diagnosisDate: string;
  severity: 'mild' | 'moderate' | 'severe';
  status: 'active' | 'inactive' | 'remission';
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  prescribedDate: string;
  prescribingProvider: string;
  active: boolean;
}

export interface PatientSummary {
  id: string;
  name: string;
  age: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskScore: number;
  lastContact: string;
  upcomingAppointments: number;
}
