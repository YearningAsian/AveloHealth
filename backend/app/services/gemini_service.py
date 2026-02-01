"""
Gemini AI Service
Predictive triage and risk assessment
"""

import google.generativeai as genai
from typing import Dict, Any, List
from datetime import datetime
import json

from app.core.config import settings

class GeminiService:
    """Gemini AI service for patient risk analysis"""
    
    def __init__(self):
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = genai.GenerativeModel('gemini-pro')
    
    async def analyze_patient_risk(
        self,
        patient_data: Dict[str, Any],
        clinical_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Analyze patient risk using Gemini AI
        Returns comprehensive risk assessment and recommendations
        """
        
        prompt = self._build_analysis_prompt(patient_data, clinical_data)
        
        try:
            response = self.model.generate_content(prompt)
            analysis = self._parse_gemini_response(response.text)
            
            # Add metadata
            analysis['patient_id'] = patient_data['id']
            analysis['analysis_id'] = f"gemini_{int(datetime.utcnow().timestamp())}"
            analysis['timestamp'] = datetime.utcnow().isoformat()
            
            return analysis
            
        except Exception as e:
            print(f"❌ Gemini analysis failed: {e}")
            return self._fallback_analysis(patient_data)
    
    def _build_analysis_prompt(
        self,
        patient_data: Dict[str, Any],
        clinical_data: Dict[str, Any]
    ) -> str:
        """Build prompt for Gemini analysis"""
        
        prompt = f"""
You are an expert clinical AI assistant for AveloHealth, analyzing patient data to prevent patients from "falling through the cracks."

**Patient Profile:**
- Age: {self._calculate_age(patient_data.get('date_of_birth', ''))}
- Chronic Conditions: {json.dumps(clinical_data.get('chronic_conditions', []))}
- Current Medications: {len(clinical_data.get('medications', []))} active medications
- Recent Appointments: {clinical_data.get('recent_appointments', 0)} in last 3 months
- Missed Appointments: {clinical_data.get('missed_appointments', 0)}
- Last Contact: {patient_data.get('last_contact_date', 'Unknown')}

**Recent Vitals:**
{json.dumps(clinical_data.get('recent_vitals', []), indent=2)}

**Lab Results:**
{json.dumps(clinical_data.get('lab_results', []), indent=2)}

**Task:**
Provide a comprehensive risk assessment in JSON format with the following structure:

{{
  "risk_score": <0-100 integer>,
  "risk_level": "<low|medium|high|critical>",
  "risk_factors": [
    {{
      "factor": "<description>",
      "severity": "<low|medium|high>",
      "description": "<explanation>",
      "impact_score": <0-100>
    }}
  ],
  "recommended_actions": [
    {{
      "action": "<specific action>",
      "priority": "<low|medium|high>",
      "deadline": "<timeframe>",
      "category": "<clinical|administrative|outreach>"
    }}
  ],
  "ai_insights": "<comprehensive analysis>",
  "clinical_summary": "<brief clinical summary>",
  "priority_level": "<routine|elevated|urgent|emergency>",
  "suggested_outreach": {{
    "should_contact": <true|false>,
    "urgency": "<routine|soon|urgent>",
    "preferred_method": "<phone|email|teli-ai-call>",
    "reason": "<why contact is needed>"
  }}
}}

**Focus Areas:**
1. Identify patterns indicating declining health
2. Flag missed appointments or medication non-compliance
3. Assess urgency of intervention needed
4. Recommend proactive outreach to prevent complications
5. Consider social determinants of health

Respond ONLY with valid JSON.
"""
        return prompt
    
    def _parse_gemini_response(self, response_text: str) -> Dict[str, Any]:
        """Parse Gemini JSON response"""
        try:
            # Extract JSON from response (may have markdown formatting)
            json_start = response_text.find('{')
            json_end = response_text.rfind('}') + 1
            
            if json_start != -1 and json_end > json_start:
                json_str = response_text[json_start:json_end]
                return json.loads(json_str)
            else:
                return self._fallback_analysis_structure()
                
        except json.JSONDecodeError:
            print("⚠️  Failed to parse Gemini response as JSON")
            return self._fallback_analysis_structure()
    
    def _fallback_analysis(self, patient_data: Dict[str, Any]) -> Dict[str, Any]:
        """Fallback analysis if Gemini fails"""
        return {
            "patient_id": patient_data['id'],
            "analysis_id": f"fallback_{int(datetime.utcnow().timestamp())}",
            "timestamp": datetime.utcnow().isoformat(),
            "risk_score": 50,
            "risk_level": "medium",
            "risk_factors": [],
            "recommended_actions": [],
            "ai_insights": "Analysis temporarily unavailable. Manual review recommended.",
            "clinical_summary": "Unable to generate automated summary.",
            "priority_level": "routine",
            "suggested_outreach": {
                "should_contact": False,
                "urgency": "routine",
                "preferred_method": "phone",
                "reason": "Standard follow-up"
            }
        }
    
    def _fallback_analysis_structure(self) -> Dict[str, Any]:
        """Return empty analysis structure"""
        return {
            "risk_score": 50,
            "risk_level": "medium",
            "risk_factors": [],
            "recommended_actions": [],
            "ai_insights": "Analysis parsing failed. Manual review needed.",
            "clinical_summary": "Unable to parse response.",
            "priority_level": "routine",
            "suggested_outreach": {
                "should_contact": False,
                "urgency": "routine",
                "preferred_method": "phone",
                "reason": "Standard follow-up"
            }
        }
    
    @staticmethod
    def _calculate_age(date_of_birth: str) -> int:
        """Calculate age from date of birth"""
        if not date_of_birth:
            return 0
        
        try:
            dob = datetime.fromisoformat(date_of_birth.replace('Z', '+00:00'))
            age = (datetime.utcnow() - dob).days // 365
            return age
        except:
            return 0
    
    async def batch_analyze_patients(
        self,
        patients_data: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Batch analyze multiple patients for predictive triage
        Returns list of patients sorted by risk score
        """
        analyses = []
        
        for patient in patients_data:
            analysis = await self.analyze_patient_risk(
                patient,
                patient.get('clinical_data', {})
            )
            analyses.append(analysis)
        
        # Sort by risk score descending
        analyses.sort(key=lambda x: x.get('risk_score', 0), reverse=True)
        
        return analyses
    
    async def generate_outreach_script(
        self,
        patient_data: Dict[str, Any],
        analysis: Dict[str, Any]
    ) -> str:
        """Generate personalized outreach script for Teli AI or staff"""
        
        prompt = f"""
Generate a compassionate, professional phone script for contacting a patient.

**Patient Context:**
- Risk Level: {analysis.get('risk_level', 'unknown')}
- Key Concerns: {', '.join([rf['factor'] for rf in analysis.get('risk_factors', [])[:3]])}
- Last Contact: {patient_data.get('last_contact_date', 'unknown')}

**Script Requirements:**
1. Warm, empathetic greeting
2. Express concern for patient's wellbeing
3. Address specific health concerns without alarming
4. Offer support and schedule follow-up
5. Keep under 2 minutes reading time
6. HIPAA-compliant language

Provide the script in a natural, conversational tone.
"""
        
        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            print(f"❌ Script generation failed: {e}")
            return "Hello, this is AveloHealth calling. We wanted to check in on your recent health status and see if you need any support. Would you be available to schedule a follow-up appointment?"
