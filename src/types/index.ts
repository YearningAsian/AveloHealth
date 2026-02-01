/**
 * Centralized Type Exports
 */

export * from './patient';
export * from './ai-analysis';
export * from './teli-ai';
export * from './appointment';
export * from './auth';
export * from './dashboard';
export * from './api';

// Re-export commonly used types
export type { Patient, PatientSummary } from './patient';
export type { GeminiAnalysisResponse, PredictiveTriageResult } from './ai-analysis';
export type { TeliAICallResponse, ScheduledCall } from './teli-ai';
export type { Appointment, AppointmentStats } from './appointment';
export type { User, UserRole, AuthSession } from './auth';
export type { DashboardStats, OutreachQueue } from './dashboard';
export type { ApiResponse, PaginatedResponse } from './api';
