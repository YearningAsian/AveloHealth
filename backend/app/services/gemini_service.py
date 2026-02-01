import os
import logging
from typing import Dict, Any, List, Optional
import google.generativeai as genai
from app.core.config import settings

logger = logging.getLogger(__name__)

class GeminiService:
    """Service for interacting with Google Gemini AI API"""
    
    def __init__(self):
        """Initialize Gemini AI service"""
        api_key = settings.GEMINI_API_KEY
        if not api_key:
            logger.warning("GEMINI_API_KEY not found in environment variables")
            self.model = None
            return
            
        try:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-pro')
            logger.info("Gemini AI service initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Gemini AI: {str(e)}")
            self.model = None
    
    async def analyze_patient_risk(self, patient_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze patient data to determine risk level
        
        Args:
            patient_data: Dictionary containing patient information
            
        Returns:
            Dictionary with risk assessment results
        """
        if not self.model:
            return {
                "risk_level": "unknown",
                "confidence": 0.0,
                "reasoning": "AI service not available",
                "recommendations": []
            }
        
        try:
            prompt = self._build_risk_assessment_prompt(patient_data)
            response = self.model.generate_content(prompt)
            
            # Parse AI response
            analysis = self._parse_risk_response(response.text)
            return analysis
            
        except Exception as e:
            logger.error(f"Error analyzing patient risk: {str(e)}")
            return {
                "risk_level": "unknown",
                "confidence": 0.0,
                "reasoning": f"Analysis failed: {str(e)}",
                "recommendations": []
            }
    
    async def analyze_symptoms(self, symptoms: str, patient_age: int, patient_gender: str) -> Dict[str, Any]:
        """
        Analyze patient symptoms using Gemini AI
        
        Args:
            symptoms: Description of patient symptoms
            patient_age: Patient age
            patient_gender: Patient gender
            
        Returns:
            Dictionary with symptom analysis
        """
        if not self.model:
            return {
                "severity": "unknown",
                "possible_conditions": [],
                "urgency": "unknown",
                "recommendations": ["Please consult with a healthcare provider"]
            }
        
        try:
            prompt = f"""You are a medical AI assistant. Analyze the following symptoms and provide assessment.

Patient Information:
- Age: {patient_age}
- Gender: {patient_gender}
- Symptoms: {symptoms}

Provide:
1. Severity level (mild, moderate, severe, critical)
2. Possible conditions (list 2-3 most likely)
3. Urgency level (non-urgent, soon, urgent, emergency)
4. Recommendations (practical next steps)

Format your response as a structured analysis."""

            response = self.model.generate_content(prompt)
            analysis = self._parse_symptom_response(response.text)
            return analysis
            
        except Exception as e:
            logger.error(f"Error analyzing symptoms: {str(e)}")
            return {
                "severity": "unknown",
                "possible_conditions": [],
                "urgency": "unknown",
                "recommendations": ["Analysis failed. Please consult a healthcare provider."]
            }
    
    async def triage_patient(self, patient_info: Dict[str, Any]) -> Dict[str, Any]:
        """
        Perform AI-powered patient triage
        
        Args:
            patient_info: Complete patient information including symptoms, vitals, history
            
        Returns:
            Triage results with priority level and recommendations
        """
        if not self.model:
            return {
                "priority": "medium",
                "category": "general",
                "wait_time_estimate": "unknown",
                "recommendations": []
            }
        
        try:
            prompt = self._build_triage_prompt(patient_info)
            response = self.model.generate_content(prompt)
            triage_result = self._parse_triage_response(response.text)
            return triage_result
            
        except Exception as e:
            logger.error(f"Error in patient triage: {str(e)}")
            return {
                "priority": "medium",
                "category": "general",
                "wait_time_estimate": "unknown",
                "recommendations": [f"Triage failed: {str(e)}"]
            }
    
    def _build_risk_assessment_prompt(self, patient_data: Dict[str, Any]) -> str:
        """Build prompt for risk assessment"""
        return f"""You are a medical AI analyzing patient risk factors.

Patient Data:
- Age: {patient_data.get('age', 'unknown')}
- Recent Symptoms: {patient_data.get('symptoms', 'none reported')}
- Medical History: {patient_data.get('medical_history', 'none available')}
- Recent Vitals: {patient_data.get('vitals', 'none available')}

Assess the patient's risk level (low, medium, high, critical) and provide:
1. Risk level with confidence score
2. Key risk factors identified
3. Recommendations for care
4. Suggested follow-up timeline

Provide a structured medical assessment."""
    
    def _build_triage_prompt(self, patient_info: Dict[str, Any]) -> str:
        """Build prompt for patient triage"""
        return f"""You are a medical triage AI assistant.

Patient Information:
- Symptoms: {patient_info.get('symptoms', 'not provided')}
- Pain Level: {patient_info.get('pain_level', 'not provided')}
- Duration: {patient_info.get('symptom_duration', 'not provided')}
- Age: {patient_info.get('age', 'not provided')}

Determine:
1. Priority level (low, medium, high, critical)
2. Care category (general, urgent care, emergency)
3. Estimated wait time appropriateness
4. Immediate recommendations

Provide structured triage assessment."""
    
    def _parse_risk_response(self, response_text: str) -> Dict[str, Any]:
        """Parse AI risk assessment response"""
        # Simple parsing - in production, use more sophisticated NLP
        risk_level = "medium"
        if "high" in response_text.lower() or "critical" in response_text.lower():
            risk_level = "high"
        elif "low" in response_text.lower():
            risk_level = "low"
        
        return {
            "risk_level": risk_level,
            "confidence": 0.75,
            "reasoning": response_text[:200],
            "recommendations": self._extract_recommendations(response_text)
        }
    
    def _parse_symptom_response(self, response_text: str) -> Dict[str, Any]:
        """Parse AI symptom analysis response"""
        severity = "moderate"
        if "severe" in response_text.lower() or "critical" in response_text.lower():
            severity = "severe"
        elif "mild" in response_text.lower():
            severity = "mild"
        
        return {
            "severity": severity,
            "possible_conditions": self._extract_conditions(response_text),
            "urgency": self._extract_urgency(response_text),
            "recommendations": self._extract_recommendations(response_text)
        }
    
    def _parse_triage_response(self, response_text: str) -> Dict[str, Any]:
        """Parse AI triage response"""
        priority = "medium"
        if "critical" in response_text.lower() or "emergency" in response_text.lower():
            priority = "critical"
        elif "high" in response_text.lower() or "urgent" in response_text.lower():
            priority = "high"
        elif "low" in response_text.lower():
            priority = "low"
        
        return {
            "priority": priority,
            "category": self._extract_category(response_text),
            "wait_time_estimate": "15-30 minutes",
            "recommendations": self._extract_recommendations(response_text)
        }
    
    def _extract_recommendations(self, text: str) -> List[str]:
        """Extract recommendations from AI response"""
        # Simple extraction - look for numbered lists or bullet points
        recommendations = []
        lines = text.split('\n')
        for line in lines:
            line = line.strip()
            if line and (line[0].isdigit() or line.startswith('-') or line.startswith('•')):
                recommendations.append(line.lstrip('0123456789.-• '))
        
        if not recommendations:
            recommendations = ["Consult with healthcare provider for detailed assessment"]
        
        return recommendations[:5]  # Return top 5
    
    def _extract_conditions(self, text: str) -> List[str]:
        """Extract possible medical conditions from text"""
        # Simplified extraction
        conditions = []
        common_indicators = ["could be", "possibly", "may indicate", "suggest"]
        
        for line in text.lower().split('\n'):
            for indicator in common_indicators:
                if indicator in line:
                    # Extract the condition name (simplified)
                    parts = line.split(indicator)
                    if len(parts) > 1:
                        condition = parts[1].strip().split('.')[0].strip()
                        if condition:
                            conditions.append(condition.capitalize())
        
        return conditions[:3] if conditions else ["Requires professional evaluation"]
    
    def _extract_urgency(self, text: str) -> str:
        """Extract urgency level from text"""
        text_lower = text.lower()
        if "emergency" in text_lower or "immediate" in text_lower:
            return "emergency"
        elif "urgent" in text_lower or "soon" in text_lower:
            return "urgent"
        elif "non-urgent" in text_lower or "routine" in text_lower:
            return "non-urgent"
        return "soon"
    
    def _extract_category(self, text: str) -> str:
        """Extract care category from text"""
        text_lower = text.lower()
        if "emergency" in text_lower:
            return "emergency"
        elif "urgent care" in text_lower:
            return "urgent care"
        return "general"

# Singleton instance
gemini_service = GeminiService()
