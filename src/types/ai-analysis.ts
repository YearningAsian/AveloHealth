/**
 * AI Analysis Types - Gemini Integration
 */

export interface GeminiAnalysisRequest {
  patientId: string;
  analysisType: 'triage' | 'risk-assessment' | 'outreach-recommendation';
  clinicalData: ClinicalDataSnapshot;
  historicalTrends?: HistoricalTrend[];
}

export interface ClinicalDataSnapshot {
  chronicConditions: string[];
  recentVitals?: VitalSigns[];
  medications: string[];
  recentAppointments: number;
  missedAppointments: number;
  lastLabResults?: LabResult[];
}

export interface VitalSigns {
  date: string;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  heartRate?: number;
  temperature?: number;
  oxygenSaturation?: number;
  weight?: number;
}

export interface LabResult {
  testName: string;
  value: string;
  unit: string;
  referenceRange: string;
  date: string;
  abnormal: boolean;
}

export interface HistoricalTrend {
  metric: string;
  values: Array<{ date: string; value: number }>;
  trend: 'improving' | 'stable' | 'declining';
}

export interface GeminiAnalysisResponse {
  patientId: string;
  analysisId: string;
  timestamp: string;
  
  // Risk Assessment
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskFactors: RiskFactor[];
  
  // Recommendations
  recommendedActions: RecommendedAction[];
  priorityLevel: 'routine' | 'elevated' | 'urgent' | 'emergency';
  
  // Insights
  aiInsights: string;
  clinicalSummary: string;
  
  // Next Steps
  suggestedOutreach: OutreachSuggestion;
}

export interface RiskFactor {
  factor: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  impactScore: number;
}

export interface RecommendedAction {
  action: string;
  priority: 'low' | 'medium' | 'high';
  deadline?: string;
  assignee?: string;
  category: 'clinical' | 'administrative' | 'outreach';
}

export interface OutreachSuggestion {
  shouldContact: boolean;
  urgency: 'routine' | 'soon' | 'urgent';
  preferredMethod: 'phone' | 'email' | 'sms' | 'teli-ai-call';
  suggestedScript?: string;
  reason: string;
}

export interface PredictiveTriageResult {
  patients: Array<{
    patientId: string;
    patientName: string;
    riskScore: number;
    riskLevel: string;
    flaggedConditions: string[];
    lastContact: string;
    recommendedAction: string;
  }>;
  totalHighRisk: number;
  totalCritical: number;
  generatedAt: string;
}
