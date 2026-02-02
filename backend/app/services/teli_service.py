"""
Teli AI Service
SMS and Voice interaction for healthcare reminders
"""

import httpx
from typing import Dict, Any, Optional, List
from datetime import datetime
import uuid

from app.core.config import settings


class TeliSMSService:
    """Teli SMS service for text reminders and notifications"""
    
    def __init__(self):
        self.api_key = settings.TELI_API_KEY
        self.base_url = settings.TELI_API_URL
        self.default_phone = settings.TELI_DEFAULT_PHONE
        self.org_id = settings.TELI_ORG_ID
        self.user_id = settings.TELI_USER_ID
        self.sms_agent_id = settings.TELI_SMS_AGENT_ID
        self.sms_number = settings.TELI_SMS_NUMBER
    
    async def send_sms_with_agent(
        self,
        phone_number: str,
        first_name: str = "Patient",
        campaign_name: str = "AveloHealth Notification"
    ) -> Dict[str, Any]:
        """
        Send SMS using the AI agent (two-way conversation)
        This uses the proper campaign API with the SMS agent
        """
        campaign_id = f"avelo_{uuid.uuid4().hex[:16]}"
        
        payload = {
            "campaign_id": campaign_id,
            "campaign_name": campaign_name,
            "organization_id": self.org_id,
            "user_id": self.user_id,
            "sms_agent_id": self.sms_agent_id,
            "teli_sms_number": self.sms_number,
            "contacts": [
                {"phone_number": phone_number, "first_name": first_name}
            ]
        }
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/v1/campaigns",
                    json=payload,
                    headers={
                        "X-API-Key": self.api_key,
                        "Content-Type": "application/json"
                    },
                    timeout=30.0
                )
                
                result = response.json()
                
                if result.get('status') == 'processing' or result.get('success'):
                    print(f"✅ SMS campaign created for {phone_number}")
                    return {
                        "success": True,
                        "campaign_id": campaign_id,
                        "status": result.get('status', 'processing'),
                        "message": "SMS campaign started with AI agent",
                        "details": result.get('details', {}),
                        "sent_at": datetime.utcnow().isoformat()
                    }
                else:
                    print(f"❌ Teli campaign failed: {result}")
                    return {
                        "success": False,
                        "error": result.get('error', 'Unknown error'),
                        "sent_at": datetime.utcnow().isoformat()
                    }
                    
        except Exception as e:
            print(f"❌ Teli campaign exception: {e}")
            return {
                "success": False,
                "error": str(e),
                "sent_at": datetime.utcnow().isoformat()
            }
    
    async def send_sms(
        self,
        phone_number: str,
        message: str,
        first_name: str = "Patient",
        campaign_name: str = "AveloHealth Notification"
    ) -> Dict[str, Any]:
        """
        Send a single SMS message using Teli broadcast API (one-way)
        """
        campaign_id = f"avelo_{uuid.uuid4().hex[:12]}"
        
        payload = {
            "campaign_data": {
                "campaign_id": campaign_id,
                "campaign_name": campaign_name
            },
            "message": message,
            "clients": [
                {"phone_number": phone_number, "first_name": first_name}
            ]
        }
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/v1/campaigns/broadcast",
                    json=payload,
                    headers={
                        "X-API-Key": self.api_key,
                        "Content-Type": "application/json"
                    },
                    timeout=30.0
                )
                
                result = response.json()
                
                if result.get('success'):
                    print(f"✅ SMS sent successfully to {phone_number}")
                    return {
                        "success": True,
                        "campaign_id": campaign_id,
                        "status": result.get('status', 'processing'),
                        "message": "SMS sent successfully",
                        "details": result.get('details', {}),
                        "sent_at": datetime.utcnow().isoformat()
                    }
                else:
                    print(f"❌ Teli SMS failed: {result}")
                    return {
                        "success": False,
                        "error": result.get('error', 'Unknown error'),
                        "sent_at": datetime.utcnow().isoformat()
                    }
                    
        except Exception as e:
            print(f"❌ Teli SMS exception: {e}")
            return {
                "success": False,
                "error": str(e),
                "sent_at": datetime.utcnow().isoformat()
            }
    
    async def send_bulk_sms(
        self,
        recipients: List[Dict[str, str]],
        message: str,
        campaign_name: str = "AveloHealth Bulk Notification"
    ) -> Dict[str, Any]:
        """
        Send SMS to multiple recipients
        recipients: List of dicts with 'phone_number' and optionally 'first_name'
        """
        campaign_id = f"avelo_bulk_{uuid.uuid4().hex[:12]}"
        
        clients = [
            {
                "phone_number": r.get('phone_number'),
                "first_name": r.get('first_name', 'Patient')
            }
            for r in recipients
        ]
        
        payload = {
            "campaign_data": {
                "campaign_id": campaign_id,
                "campaign_name": campaign_name
            },
            "message": message,
            "clients": clients
        }
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/v1/campaigns/broadcast",
                    json=payload,
                    headers={
                        "X-API-Key": self.api_key,
                        "Content-Type": "application/json"
                    },
                    timeout=30.0
                )
                
                result = response.json()
                
                if result.get('success'):
                    return {
                        "success": True,
                        "campaign_id": campaign_id,
                        "status": result.get('status', 'processing'),
                        "message": f"Bulk SMS sent to {len(clients)} recipients",
                        "details": result.get('details', {}),
                        "sent_at": datetime.utcnow().isoformat()
                    }
                else:
                    return {
                        "success": False,
                        "error": result.get('error', 'Unknown error'),
                        "sent_at": datetime.utcnow().isoformat()
                    }
                    
        except Exception as e:
            print(f"❌ Bulk SMS exception: {e}")
            return {
                "success": False,
                "error": str(e),
                "sent_at": datetime.utcnow().isoformat()
            }
    
    async def send_appointment_reminder(
        self,
        phone_number: str,
        patient_name: str,
        appointment_date: str,
        appointment_time: str,
        provider_name: str = "your provider"
    ) -> Dict[str, Any]:
        """Send appointment reminder SMS"""
        
        message = (
            f"Hi {patient_name}! 🏥 This is a reminder from AveloHealth: "
            f"You have an appointment on {appointment_date} at {appointment_time} "
            f"with {provider_name}. Reply YES to confirm or call us to reschedule."
        )
        
        return await self.send_sms(
            phone_number=phone_number,
            message=message,
            first_name=patient_name,
            campaign_name="Appointment Reminder"
        )
    
    async def send_health_check_reminder(
        self,
        phone_number: str,
        patient_name: str,
        message_content: Optional[str] = None
    ) -> Dict[str, Any]:
        """Send health check-in reminder"""
        
        message = message_content or (
            f"Hi {patient_name}! 💊 AveloHealth reminder: "
            "Don't forget to log your health entries today. "
            "Tracking your symptoms helps us provide better care!"
        )
        
        return await self.send_sms(
            phone_number=phone_number,
            message=message,
            first_name=patient_name,
            campaign_name="Health Check Reminder"
        )
    
    async def send_medication_reminder(
        self,
        phone_number: str,
        patient_name: str,
        medication_name: str = "your medication"
    ) -> Dict[str, Any]:
        """Send medication reminder SMS"""
        
        message = (
            f"Hi {patient_name}! 💊 AveloHealth reminder: "
            f"Time to take {medication_name}. "
            "Reply DONE when you've taken it!"
        )
        
        return await self.send_sms(
            phone_number=phone_number,
            message=message,
            first_name=patient_name,
            campaign_name="Medication Reminder"
        )
    
    async def send_custom_notification(
        self,
        phone_number: str,
        patient_name: str,
        subject: str,
        body: str
    ) -> Dict[str, Any]:
        """Send custom notification SMS"""
        
        message = f"Hi {patient_name}! {subject}: {body}"
        
        return await self.send_sms(
            phone_number=phone_number,
            message=message,
            first_name=patient_name,
            campaign_name=f"Custom: {subject[:30]}"
        )


class TeliVoiceService:
    """Teli Voice service for AI-powered phone calls"""
    
    def __init__(self):
        self.api_key = settings.TELI_API_KEY
        self.base_url = settings.TELI_API_URL
        self.org_id = settings.TELI_ORG_ID
        self.user_id = settings.TELI_USER_ID
        self.voice_agent_id = settings.TELI_VOICE_AGENT_ID
        self.outbound_number = settings.TELI_OUTBOUND_NUMBER
    
    async def start_voice_campaign(
        self,
        phone_number: str,
        first_name: str = "Patient",
        last_name: str = "",
        custom_fields: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Start a voice campaign to call a patient
        Uses the Teli AI voice agent for intelligent conversations
        """
        campaign_id = f"voice_campaign_{uuid.uuid4().hex[:12]}"
        
        lead = {
            "phone_number": phone_number,
            "first_name": first_name,
        }
        if last_name:
            lead["last_name"] = last_name
        if custom_fields:
            lead.update(custom_fields)
        
        payload = {
            "leads": [lead],
            "voice_agent_id": self.voice_agent_id,
            "agent_outbound_number": self.outbound_number,
            "organization_id": self.org_id,
            "tenant_id": "avelohealth",
            "user_id": self.user_id
        }
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/v1/voice/campaigns",
                    json=payload,
                    headers={
                        "X-API-Key": self.api_key,
                        "Content-Type": "application/json"
                    },
                    timeout=30.0
                )
                
                result = response.json()
                
                if result.get('success'):
                    print(f"✅ Voice campaign started for {phone_number}")
                    return {
                        "success": True,
                        "campaign_id": result.get('campaign_id', campaign_id),
                        "status": "calling",
                        "message": "Voice call initiated successfully",
                        "contacts_count": result.get('contacts_count', 1),
                        "initiated_at": datetime.utcnow().isoformat()
                    }
                else:
                    print(f"❌ Voice campaign failed: {result}")
                    return {
                        "success": False,
                        "error": result.get('error', 'Unknown error'),
                        "initiated_at": datetime.utcnow().isoformat()
                    }
                    
        except Exception as e:
            print(f"❌ Voice campaign exception: {e}")
            return {
                "success": False,
                "error": str(e),
                "initiated_at": datetime.utcnow().isoformat()
            }
    
    async def initiate_call(
        self,
        patient_data: Dict[str, Any],
        call_type: str,
        script: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Initiate Teli AI voice call to patient (legacy interface)
        """
        phone_number = patient_data.get('phone_number') or patient_data.get('phone')
        first_name = patient_data.get('first_name', patient_data.get('name', 'Patient'))
        last_name = patient_data.get('last_name', '')
        
        if not phone_number:
            return {
                "success": False,
                "error": "No phone number provided",
                "initiated_at": datetime.utcnow().isoformat()
            }
        
        return await self.start_voice_campaign(
            phone_number=phone_number,
            first_name=first_name,
            last_name=last_name,
            custom_fields={"call_type": call_type}
        )
    
    async def bulk_voice_campaign(
        self,
        leads: List[Dict[str, str]],
        campaign_name: str = "AveloHealth Outreach"
    ) -> Dict[str, Any]:
        """
        Start a voice campaign to call multiple patients
        leads: List of dicts with 'phone_number', 'first_name', etc.
        """
        campaign_id = f"voice_bulk_{uuid.uuid4().hex[:12]}"
        
        payload = {
            "leads": leads,
            "voice_agent_id": self.voice_agent_id,
            "agent_outbound_number": self.outbound_number,
            "organization_id": self.org_id,
            "tenant_id": "avelohealth",
            "user_id": self.user_id,
            "campaign_id": campaign_id
        }
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/v1/voice/campaigns",
                    json=payload,
                    headers={
                        "X-API-Key": self.api_key,
                        "Content-Type": "application/json"
                    },
                    timeout=30.0
                )
                
                result = response.json()
                
                if result.get('success'):
                    return {
                        "success": True,
                        "campaign_id": result.get('campaign_id', campaign_id),
                        "status": "calling",
                        "message": f"Voice campaign started for {len(leads)} contacts",
                        "contacts_count": result.get('contacts_count', len(leads)),
                        "initiated_at": datetime.utcnow().isoformat()
                    }
                else:
                    return {
                        "success": False,
                        "error": result.get('error', 'Unknown error'),
                        "initiated_at": datetime.utcnow().isoformat()
                    }
                    
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "initiated_at": datetime.utcnow().isoformat()
            }
    
    async def call_appointment_reminder(
        self,
        phone_number: str,
        patient_name: str,
        appointment_date: str,
        appointment_time: str,
        provider_name: str = "your provider"
    ) -> Dict[str, Any]:
        """Call patient with appointment reminder"""
        return await self.start_voice_campaign(
            phone_number=phone_number,
            first_name=patient_name,
            custom_fields={
                "appointment_date": appointment_date,
                "appointment_time": appointment_time,
                "provider_name": provider_name,
                "call_type": "appointment_reminder"
            }
        )
    
    def _get_default_script(self, call_type: str) -> str:
        """Get default script for call type"""
        
        scripts = {
            "onboarding": "Hello! This is AveloHealth calling to welcome you to our care program.",
            "follow-up": "Hello! This is AveloHealth checking in on your recent health status.",
            "appointment-reminder": "Hello! This is AveloHealth with a reminder about your upcoming appointment.",
            "health-check": "Hello! This is AveloHealth doing a routine health check."
        }
        
        return scripts.get(call_type, "Hello! This is AveloHealth calling to check in.")


# Create singleton instances
teli_sms = TeliSMSService()
teli_voice = TeliVoiceService()


# Legacy compatibility - keep TeliAIService for existing code
class TeliAIService:
    """Legacy Teli AI service for backward compatibility"""
    
    def __init__(self):
        self.sms = teli_sms
        self.voice = teli_voice
    
    async def initiate_call(self, patient_data: Dict[str, Any], call_type: str, script: Optional[str] = None):
        return await self.voice.initiate_call(patient_data, call_type, script)
    
    async def send_sms(self, phone_number: str, message: str, first_name: str = "Patient"):
        return await self.sms.send_sms(phone_number, message, first_name)
