/**
 * User & Authentication Types
 */

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  permissions: Permission[];
  active: boolean;
  lastLogin?: string;
  createdAt: string;
}

export enum UserRole {
  ADMINISTRATOR = 'administrator',
  PROFESSIONAL = 'professional',
}

export enum Permission {
  // Administrator Only
  CONFIGURE_AI = 'configure_ai',
  CONFIGURE_TELI_AI = 'configure_teli_ai',
  CUSTOMIZE_FIELDS = 'customize_fields',
  VIEW_ALL_APPOINTMENTS = 'view_all_appointments',
  VIEW_SYSTEM_ANALYTICS = 'view_system_analytics',
  MANAGE_USERS = 'manage_users',
  VIEW_AUDIT_LOGS = 'view_audit_logs',
  
  // Professional
  SCHEDULE_APPOINTMENTS = 'schedule_appointments',
  VIEW_CALL_DATA = 'view_call_data',
  MANUALLY_INPUT_DATA = 'manually_input_data',
  VIEW_PATIENT_INFO = 'view_patient_info',
  VIEW_ASSIGNED_APPOINTMENTS = 'view_assigned_appointments',
}

export interface AuthSession {
  user: User;
  token: string;
  expiresAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  session?: AuthSession;
  error?: string;
}
