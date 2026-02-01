/**
 * Appointment & Scheduling Types
 */

export interface Appointment {
  id: string;
  patientId: string;
  providerId: string;
  
  // Scheduling
  appointmentType: 'initial' | 'follow-up' | 'urgent' | 'routine' | 'telehealth';
  scheduledDate: string;
  duration: number; // in minutes
  status: 'scheduled' | 'confirmed' | 'checked-in' | 'completed' | 'cancelled' | 'no-show';
  
  // Details
  chiefComplaint?: string;
  notes?: string;
  
  // AI Integration
  aiTriggered: boolean; // Was this scheduled due to AI recommendation?
  reminderSent: boolean;
  teliCallId?: string; // If Teli AI contacted patient
  
  // Metadata
  createdAt: string;
  createdBy: string;
  cancelledReason?: string;
}

export interface Provider {
  id: string;
  firstName: string;
  lastName: string;
  title: string;
  specialties: string[];
  npiNumber: string;
  email: string;
  phone: string;
  active: boolean;
}

export interface AppointmentStats {
  totalScheduled: number;
  totalCompleted: number;
  totalCancelled: number;
  totalNoShows: number;
  noShowRate: number;
  upcomingToday: number;
  upcomingWeek: number;
}
