"""
Teli AI Service
Voice interaction and automated scheduling
"""

import httpx
from typing import Dict, Any, Optional
from datetime import datetime

from app.core.config import settings

class TeliAIService:
    """Teli AI service for voice interactions"""
    
    def __init__(self):
        self.api_key = settings.TELI_AI_API_KEY
        self.webhook_url = settings.TELI_AI_WEBHOOK_URL
        self.base_url = "https://api.teli.ai/v1"  # Placeholder URL
    
    async def initiate_call(
        self,
        patient_data: Dict[str, Any],
        call_type: str,
        script: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Initiate Teli AI call to patient
        Returns call ID and status
        """
        
        payload = {
            "phone_number": patient_data.get('phone'),
            "call_type": call_type,
            "patient_id": patient_data.get('id'),
            "script": script or self._get_default_script(call_type),
            "webhook_url": f"{self.webhook_url}/teli/webhook",
            "max_duration": 300,  # 5 minutes
            "voice_config": {
                "language": "en-US",
                "voice": "professional-female",
                "speech_rate": 1.0
            }
        }
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/calls",
                    json=payload,
                    headers={"Authorization": f"Bearer {self.api_key}"},
                    timeout=30.0
                )
                
                if response.status_code == 200:
                    result = response.json()
                    return {
                        "call_id": result.get('call_id'),
                        "status": "scheduled",
                        "initiated_at": datetime.utcnow().isoformat(),
                        "estimated_duration": 300
                    }
                else:
                    print(f"❌ Teli AI call failed: {response.status_code}")
                    return self._fallback_call_response()
                    
        except Exception as e:
            print(f"❌ Teli AI call exception: {e}")
            return self._fallback_call_response()
    
    async def get_call_status(self, call_id: str) -> Dict[str, Any]:
        """Get status of ongoing or completed call"""
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/calls/{call_id}",
                    headers={"Authorization": f"Bearer {self.api_key}"},
                    timeout=10.0
                )
                
                if response.status_code == 200:
                    return response.json()
                else:
                    return {"status": "unknown", "call_id": call_id}
                    
        except Exception as e:
            print(f"❌ Failed to get call status: {e}")
            return {"status": "error", "call_id": call_id}
    
    async def get_call_transcript(self, call_id: str) -> Optional[str]:
        """Retrieve call transcript"""
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/calls/{call_id}/transcript",
                    headers={"Authorization": f"Bearer {self.api_key}"},
                    timeout=10.0
                )
                
                if response.status_code == 200:
                    data = response.json()
                    return data.get('transcript')
                else:
                    return None
                    
        except Exception as e:
            print(f"❌ Failed to get transcript: {e}")
            return None
    
    async def schedule_call(
        self,
        patient_data: Dict[str, Any],
        call_type: str,
        scheduled_time: str,
        script: Optional[str] = None
    ) -> Dict[str, Any]:
        """Schedule a Teli AI call for future execution"""
        
        payload = {
            "phone_number": patient_data.get('phone'),
            "call_type": call_type,
            "patient_id": patient_data.get('id'),
            "script": script or self._get_default_script(call_type),
            "scheduled_time": scheduled_time,
            "webhook_url": f"{self.webhook_url}/teli/webhook"
        }
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/calls/schedule",
                    json=payload,
                    headers={"Authorization": f"Bearer {self.api_key}"},
                    timeout=30.0
                )
                
                if response.status_code == 200:
                    return response.json()
                else:
                    return {"status": "failed", "error": "Scheduling failed"}
                    
        except Exception as e:
            print(f"❌ Call scheduling failed: {e}")
            return {"status": "failed", "error": str(e)}
    
    async def process_webhook(self, webhook_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process Teli AI webhook callbacks
        Extracts relevant data from completed calls
        """
        
        event_type = webhook_data.get('event')
        call_data = webhook_data.get('data', {})
        
        if event_type == 'call.completed':
            return await self._process_completed_call(call_data)
        elif event_type == 'call.failed':
            return await self._process_failed_call(call_data)
        else:
            return {"status": "acknowledged", "event": event_type}
    
    async def _process_completed_call(self, call_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process completed call data"""
        
        # Extract structured data from call
        extracted_data = self._extract_call_data(
            call_data.get('transcript', ''),
            call_data.get('call_type', '')
        )
        
        return {
            "call_id": call_data.get('call_id'),
            "patient_id": call_data.get('patient_id'),
            "status": "completed",
            "duration": call_data.get('duration'),
            "transcript": call_data.get('transcript'),
            "summary": call_data.get('summary'),
            "extracted_data": extracted_data,
            "sentiment": call_data.get('sentiment', 'neutral'),
            "completed_at": datetime.utcnow().isoformat()
        }
    
    async def _process_failed_call(self, call_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process failed call"""
        
        return {
            "call_id": call_data.get('call_id'),
            "patient_id": call_data.get('patient_id'),
            "status": "failed",
            "error": call_data.get('error', 'Unknown error'),
            "failed_at": datetime.utcnow().isoformat()
        }
    
    def _extract_call_data(self, transcript: str, call_type: str) -> Dict[str, Any]:
        """
        Extract structured data from call transcript
        In production, this would use NLP/AI to parse the transcript
        """
        
        # Placeholder extraction logic
        extracted = {
            "call_type": call_type,
            "concerns_raised": [],
            "follow_up_needed": False,
            "sentiment": "neutral"
        }
        
        # Simple keyword extraction (in production, use NLP)
        if "pain" in transcript.lower():
            extracted["concerns_raised"].append("Patient reported pain")
            extracted["follow_up_needed"] = True
        
        if "appointment" in transcript.lower():
            extracted["appointment_discussed"] = True
        
        if call_type == "onboarding":
            extracted["confirmed_personal_info"] = True
            extracted["insurance_verified"] = "yes" in transcript.lower()
        
        return extracted
    
    def _get_default_script(self, call_type: str) -> str:
        """Get default script for call type"""
        
        scripts = {
            "onboarding": """
                Hello! This is AveloHealth calling to welcome you to our care program.
                We'd like to confirm your contact information and answer any questions you might have.
                Do you have a few minutes to talk?
            """,
            "follow-up": """
                Hello! This is AveloHealth checking in on your recent health status.
                We wanted to see how you're feeling and if you need any support.
                Do you have a moment?
            """,
            "appointment-reminder": """
                Hello! This is AveloHealth with a reminder about your upcoming appointment.
                Can we confirm you're still able to make it?
            """,
            "health-check": """
                Hello! This is AveloHealth doing a routine health check.
                We wanted to see if you're taking your medications as prescribed
                and if you have any concerns we should address.
            """
        }
        
        return scripts.get(call_type, "Hello! This is AveloHealth calling to check in.")
    
    def _fallback_call_response(self) -> Dict[str, Any]:
        """Fallback response if Teli AI is unavailable"""
        return {
            "call_id": f"manual_{int(datetime.utcnow().timestamp())}",
            "status": "failed",
            "error": "Teli AI service unavailable. Manual outreach required.",
            "initiated_at": datetime.utcnow().isoformat()
        }
