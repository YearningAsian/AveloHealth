"""
Teli AI Routes
SMS and Voice interaction for healthcare reminders
AI-powered appointment rescheduling and cancellation
"""

from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime

from app.core.auth import get_current_user
from app.services.teli_service import teli_sms, teli_voice, TeliAIService
from app.db.snowflake_client import SnowflakeClient

router = APIRouter()
teli_service = TeliAIService()


# ==================== Request Models ====================

class SendSMSRequest(BaseModel):
    phoneNumber: str
    message: str
    firstName: Optional[str] = "Patient"

class AppointmentReminderRequest(BaseModel):
    phoneNumber: str
    patientName: str
    appointmentDate: str
    appointmentTime: str
    providerName: Optional[str] = "your provider"

class HealthReminderRequest(BaseModel):
    phoneNumber: str
    patientName: str
    customMessage: Optional[str] = None

class MedicationReminderRequest(BaseModel):
    phoneNumber: str
    patientName: str
    medicationName: Optional[str] = "your medication"

class BulkSMSRequest(BaseModel):
    recipients: List[Dict[str, str]]  # List of {phone_number, first_name}
    message: str
    campaignName: Optional[str] = "AveloHealth Notification"

class TestSMSRequest(BaseModel):
    message: Optional[str] = "Hello! This is a test message from AveloHealth. 🏥"

# AI Appointment Management Models
class AIAppointmentCancelRequest(BaseModel):
    appointmentId: str
    phoneNumber: str
    patientName: str
    reason: Optional[str] = None

class AIAppointmentRescheduleRequest(BaseModel):
    appointmentId: str
    phoneNumber: str
    patientName: str
    currentDate: str
    currentTime: str
    newDate: str
    newTime: str
    providerName: Optional[str] = "your provider"
    reason: Optional[str] = None

class AIAppointmentConfirmRequest(BaseModel):
    appointmentId: str
    phoneNumber: str
    patientName: str
    appointmentDate: str
    appointmentTime: str
    providerName: Optional[str] = "your provider"


# ==================== SMS Endpoints ====================

@router.post("/send-sms")
async def send_sms(
    request_data: SendSMSRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Send a single SMS message
    """
    try:
        result = await teli_sms.send_sms(
            phone_number=request_data.phoneNumber,
            message=request_data.message,
            first_name=request_data.firstName
        )
        
        return {
            "success": result.get("success", False),
            "data": result,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/send-appointment-reminder")
async def send_appointment_reminder(
    request_data: AppointmentReminderRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Send appointment reminder SMS
    """
    try:
        result = await teli_sms.send_appointment_reminder(
            phone_number=request_data.phoneNumber,
            patient_name=request_data.patientName,
            appointment_date=request_data.appointmentDate,
            appointment_time=request_data.appointmentTime,
            provider_name=request_data.providerName
        )
        
        return {
            "success": result.get("success", False),
            "data": result,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/send-health-reminder")
async def send_health_reminder(
    request_data: HealthReminderRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Send health check-in reminder SMS
    """
    try:
        result = await teli_sms.send_health_check_reminder(
            phone_number=request_data.phoneNumber,
            patient_name=request_data.patientName,
            message_content=request_data.customMessage
        )
        
        return {
            "success": result.get("success", False),
            "data": result,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/send-medication-reminder")
async def send_medication_reminder(
    request_data: MedicationReminderRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Send medication reminder SMS
    """
    try:
        result = await teli_sms.send_medication_reminder(
            phone_number=request_data.phoneNumber,
            patient_name=request_data.patientName,
            medication_name=request_data.medicationName
        )
        
        return {
            "success": result.get("success", False),
            "data": result,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/send-bulk-sms")
async def send_bulk_sms(
    request_data: BulkSMSRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Send SMS to multiple recipients
    """
    try:
        result = await teli_sms.send_bulk_sms(
            recipients=request_data.recipients,
            message=request_data.message,
            campaign_name=request_data.campaignName
        )
        
        return {
            "success": result.get("success", False),
            "data": result,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/test-sms")
async def test_sms(
    request_data: TestSMSRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Send a test SMS to the default configured phone number
    Uses TELI_DEFAULT_PHONE from environment
    """
    from app.core.config import settings
    
    if not settings.TELI_DEFAULT_PHONE:
        raise HTTPException(
            status_code=400, 
            detail="TELI_DEFAULT_PHONE not configured in environment"
        )
    
    try:
        result = await teli_sms.send_sms(
            phone_number=settings.TELI_DEFAULT_PHONE,
            message=request_data.message,
            first_name="Test User",
            campaign_name="AveloHealth Test"
        )
        
        return {
            "success": result.get("success", False),
            "data": result,
            "phone": settings.TELI_DEFAULT_PHONE,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/start-ai-conversation")
async def start_ai_conversation(
    request_data: AppointmentReminderRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Start an AI-powered two-way SMS conversation for appointment management
    Uses the Teli SMS Agent for intelligent responses
    """
    try:
        result = await teli_sms.send_sms_with_agent(
            phone_number=request_data.phoneNumber,
            first_name=request_data.patientName,
            campaign_name=f"Appointment: {request_data.appointmentDate}"
        )
        
        return {
            "success": result.get("success", False),
            "data": result,
            "message": "AI conversation started - patient will receive SMS and can reply",
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== AI Appointment Management ====================

@router.post("/ai/cancel-appointment")
async def ai_cancel_appointment(
    request_data: AIAppointmentCancelRequest,
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """
    AI-powered appointment cancellation via SMS
    Sends cancellation confirmation and updates appointment status
    """
    snowflake: SnowflakeClient = request.app.state.snowflake
    
    try:
        # Update appointment status
        await snowflake.update_appointment(request_data.appointmentId, {
            "status": "cancelled",
            "previous_status": "upcoming"
        })
        
        # Generate AI cancellation message using Snowflake Cortex
        reason_text = f" Reason: {request_data.reason}" if request_data.reason else ""
        
        message = (
            f"Hi {request_data.patientName}! 🏥 Your appointment has been CANCELLED.{reason_text} "
            f"If you'd like to reschedule, reply RESCHEDULE or call us. "
            f"Thank you for using AveloHealth!"
        )
        
        # Send SMS notification
        sms_result = await teli_sms.send_sms(
            phone_number=request_data.phoneNumber,
            message=message,
            first_name=request_data.patientName,
            campaign_name="Appointment Cancellation"
        )
        
        # Log the action
        await snowflake.log_audit({
            "user_id": current_user.get("sub"),
            "action": "AI_CANCEL_APPOINTMENT",
            "resource_type": "appointment",
            "resource_id": request_data.appointmentId,
            "details": {"reason": request_data.reason, "sms_sent": sms_result.get("success")}
        })
        
        return {
            "success": True,
            "data": {
                "appointmentId": request_data.appointmentId,
                "status": "cancelled",
                "smsSent": sms_result.get("success", False),
                "smsDetails": sms_result
            },
            "message": "Appointment cancelled and notification sent",
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        print(f"AI cancel error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/ai/reschedule-appointment")
async def ai_reschedule_appointment(
    request_data: AIAppointmentRescheduleRequest,
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """
    AI-powered appointment rescheduling via SMS
    Updates appointment to new date/time and sends confirmation
    """
    snowflake: SnowflakeClient = request.app.state.snowflake
    
    try:
        # Update appointment with new date/time
        await snowflake.update_appointment(request_data.appointmentId, {
            "appointment_date": request_data.newDate,
            "appointment_time": request_data.newTime,
            "status": "upcoming",
            "previous_status": "rescheduled"
        })
        
        # Generate AI rescheduling message
        reason_text = f" ({request_data.reason})" if request_data.reason else ""
        
        message = (
            f"Hi {request_data.patientName}! 📅 Your appointment has been RESCHEDULED{reason_text}.\n\n"
            f"OLD: {request_data.currentDate} at {request_data.currentTime}\n"
            f"NEW: {request_data.newDate} at {request_data.newTime}\n"
            f"Provider: {request_data.providerName}\n\n"
            f"Reply CONFIRM to confirm or CANCEL to cancel. Thank you!"
        )
        
        # Send SMS notification
        sms_result = await teli_sms.send_sms(
            phone_number=request_data.phoneNumber,
            message=message,
            first_name=request_data.patientName,
            campaign_name="Appointment Reschedule"
        )
        
        # Log the action
        await snowflake.log_audit({
            "user_id": current_user.get("sub"),
            "action": "AI_RESCHEDULE_APPOINTMENT",
            "resource_type": "appointment",
            "resource_id": request_data.appointmentId,
            "details": {
                "old_date": request_data.currentDate,
                "old_time": request_data.currentTime,
                "new_date": request_data.newDate,
                "new_time": request_data.newTime,
                "sms_sent": sms_result.get("success")
            }
        })
        
        return {
            "success": True,
            "data": {
                "appointmentId": request_data.appointmentId,
                "newDate": request_data.newDate,
                "newTime": request_data.newTime,
                "status": "upcoming",
                "smsSent": sms_result.get("success", False),
                "smsDetails": sms_result
            },
            "message": "Appointment rescheduled and notification sent",
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        print(f"AI reschedule error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/ai/confirm-appointment")
async def ai_confirm_appointment(
    request_data: AIAppointmentConfirmRequest,
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """
    Send AI-powered appointment confirmation SMS with options to reschedule/cancel
    """
    try:
        message = (
            f"Hi {request_data.patientName}! 🏥 APPOINTMENT REMINDER\n\n"
            f"📅 Date: {request_data.appointmentDate}\n"
            f"🕐 Time: {request_data.appointmentTime}\n"
            f"👨‍⚕️ Provider: {request_data.providerName}\n\n"
            f"Reply:\n"
            f"✅ CONFIRM - to confirm attendance\n"
            f"📅 RESCHEDULE - to change date/time\n"
            f"❌ CANCEL - to cancel appointment\n\n"
            f"- AveloHealth"
        )
        
        sms_result = await teli_sms.send_sms(
            phone_number=request_data.phoneNumber,
            message=message,
            first_name=request_data.patientName,
            campaign_name="Appointment Confirmation"
        )
        
        return {
            "success": True,
            "data": {
                "appointmentId": request_data.appointmentId,
                "smsSent": sms_result.get("success", False),
                "smsDetails": sms_result
            },
            "message": "Confirmation SMS sent",
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        print(f"AI confirm error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/ai/smart-outreach")
async def ai_smart_outreach(
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """
    AI-powered smart outreach - analyzes appointments and sends appropriate reminders
    Uses Snowflake Cortex to generate personalized messages
    """
    from app.core.config import settings
    snowflake: SnowflakeClient = request.app.state.snowflake
    user_id = current_user.get("sub")
    
    try:
        # Get upcoming appointments for user
        appointments = await snowflake.get_appointments_by_user(
            user_id=user_id,
            status="upcoming",
            limit=10
        )
        
        if not appointments:
            return {
                "success": True,
                "data": {"sent": 0, "appointments": []},
                "message": "No upcoming appointments to send reminders for",
                "timestamp": datetime.utcnow().isoformat()
            }
        
        results = []
        for apt in appointments:
            apt_date = str(apt.get("APPOINTMENT_DATE") or apt.get("appointment_date"))
            apt_time = str(apt.get("APPOINTMENT_TIME") or apt.get("appointment_time"))
            provider = apt.get("PROVIDER_NAME") or apt.get("provider_name") or "your provider"
            apt_id = apt.get("APPOINTMENT_ID") or apt.get("appointment_id")
            
            # Use Snowflake Cortex to generate personalized message
            prompt = f"""Generate a friendly, brief appointment reminder SMS for a healthcare app.
Patient has an appointment on {apt_date} at {apt_time} with {provider}.
Keep it under 160 characters. Include emojis. Be warm and professional.
End with options: Reply CONFIRM, RESCHEDULE, or CANCEL."""

            try:
                ai_response = await snowflake.execute(f"""
                    SELECT SNOWFLAKE.CORTEX.COMPLETE(
                        'mistral-large',
                        '{prompt.replace("'", "''")}'
                    ) AS ai_message
                """)
                
                if ai_response and len(ai_response) > 0:
                    ai_message = ai_response[0].get("AI_MESSAGE", "")
                    # Clean up the message
                    if ai_message:
                        ai_message = ai_message.strip().strip('"').strip("'")
                else:
                    # Fallback message
                    ai_message = (
                        f"🏥 Reminder: Appointment on {apt_date} at {apt_time} with {provider}. "
                        f"Reply CONFIRM, RESCHEDULE, or CANCEL."
                    )
            except:
                ai_message = (
                    f"🏥 Reminder: Appointment on {apt_date} at {apt_time} with {provider}. "
                    f"Reply CONFIRM, RESCHEDULE, or CANCEL."
                )
            
            # Send the SMS
            sms_result = await teli_sms.send_sms(
                phone_number=settings.TELI_DEFAULT_PHONE,
                message=ai_message,
                first_name="Patient",
                campaign_name="AI Smart Outreach"
            )
            
            results.append({
                "appointmentId": apt_id,
                "date": apt_date,
                "time": apt_time,
                "provider": provider,
                "messageSent": ai_message,
                "success": sms_result.get("success", False)
            })
        
        return {
            "success": True,
            "data": {
                "sent": len([r for r in results if r["success"]]),
                "total": len(results),
                "appointments": results
            },
            "message": f"Smart outreach completed for {len(results)} appointments",
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        print(f"Smart outreach error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ==================== Voice Endpoints (Legacy) ====================

class InitiateCallRequest(BaseModel):
    patientId: str
    callType: str
    script: Optional[str] = None

@router.post("/initiate-call")
async def initiate_call(
    request_data: InitiateCallRequest,
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """
    Initiate Teli AI voice call (requires additional Teli setup)
    """
    snowflake: SnowflakeClient = request.app.state.snowflake
    
    try:
        patient = await snowflake.get_patient(request_data.patientId)
        
        if not patient:
            raise HTTPException(status_code=404, detail="Patient not found")
        
        result = await teli_voice.initiate_call(
            patient_data=patient,
            call_type=request_data.callType,
            script=request_data.script
        )
        
        return {
            "success": True,
            "data": result,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== Voice Call Endpoints ====================

class VoiceCallRequest(BaseModel):
    phoneNumber: str
    firstName: Optional[str] = "Patient"
    lastName: Optional[str] = ""

class VoiceAppointmentReminderRequest(BaseModel):
    phoneNumber: str
    patientName: str
    appointmentDate: str
    appointmentTime: str
    providerName: Optional[str] = "your provider"

class BulkVoiceRequest(BaseModel):
    leads: List[Dict[str, str]]  # List of {phone_number, first_name, ...}
    campaignName: Optional[str] = "AveloHealth Voice Outreach"


@router.post("/voice/call")
async def initiate_voice_call(
    request_data: VoiceCallRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Initiate an AI voice call to a patient
    Uses the Teli AI voice agent for intelligent conversations
    """
    try:
        result = await teli_voice.start_voice_campaign(
            phone_number=request_data.phoneNumber,
            first_name=request_data.firstName,
            last_name=request_data.lastName
        )
        
        return {
            "success": result.get("success", False),
            "data": result,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/voice/appointment-reminder")
async def voice_appointment_reminder(
    request_data: VoiceAppointmentReminderRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Call patient with appointment reminder using AI voice agent
    """
    try:
        result = await teli_voice.call_appointment_reminder(
            phone_number=request_data.phoneNumber,
            patient_name=request_data.patientName,
            appointment_date=request_data.appointmentDate,
            appointment_time=request_data.appointmentTime,
            provider_name=request_data.providerName
        )
        
        return {
            "success": result.get("success", False),
            "data": result,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/voice/bulk-campaign")
async def bulk_voice_campaign(
    request_data: BulkVoiceRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Start a bulk voice campaign to call multiple patients
    """
    try:
        result = await teli_voice.bulk_voice_campaign(
            leads=request_data.leads,
            campaign_name=request_data.campaignName
        )
        
        return {
            "success": result.get("success", False),
            "data": result,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/voice/test-call")
async def test_voice_call(
    current_user: dict = Depends(get_current_user)
):
    """
    Make a test voice call to the default configured phone number
    """
    from app.core.config import settings
    
    if not settings.TELI_DEFAULT_PHONE:
        raise HTTPException(
            status_code=400,
            detail="TELI_DEFAULT_PHONE not configured"
        )
    
    try:
        result = await teli_voice.start_voice_campaign(
            phone_number=settings.TELI_DEFAULT_PHONE,
            first_name="Test User"
        )
        
        return {
            "success": result.get("success", False),
            "data": result,
            "phone": settings.TELI_DEFAULT_PHONE,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== Knowledge Base Test Endpoints ====================

class KBTestRequest(BaseModel):
    phoneNumber: str
    firstName: Optional[str] = "Test User"


@router.post("/test-sms-with-kb")
async def test_sms_with_knowledge_base(
    request_data: KBTestRequest
):
    """
    Test SMS with knowledge base from appointments data
    """
    try:
        from app.db.snowflake_client import SnowflakeClient
        import httpx
        import uuid
        from app.core.config import settings
        
        # Get appointment data
        client = SnowflakeClient()
        await client.connect()
        
        appointments = await client.execute("""
            SELECT 
                appointment_id,
                user_id,
                title,
                appointment_date,
                appointment_time,
                location,
                status,
                notes
            FROM appointments 
            WHERE status = 'upcoming'
            ORDER BY appointment_date, appointment_time
            LIMIT 5
        """)
        
        await client.disconnect()
        
        # Format appointment data
        kb_content = "\\n\\n".join([
            f"Patient {a['USER_ID']}: {a['TITLE']} on {a['APPOINTMENT_DATE']} at {a['APPOINTMENT_TIME']} at {a['LOCATION']}"
            for a in appointments
        ])
        
        # Create SMS agent with appointment context
        agent_payload = {
            "agent_type": "sms",
            "agent_name": "Avi SMS with Appointments",
            "starting_message": f"Hi {{{{{request_data.firstName}}}}}! I'm Avi from AveloHealth. I can help with your appointments. What do you need?",
            "prompt": f"You are Avi, AveloHealth's assistant. You have appointment information: {kb_content}. Help patients with appointment questions, rescheduling, and general info. Be friendly and professional.",
            "organization_id": settings.TELI_ORG_ID,
            "user_id": settings.TELI_USER_ID
        }
        
        async with httpx.AsyncClient() as http_client:
            agent_response = await http_client.post(
                f"{settings.TELI_API_URL}/v1/agents",
                json=agent_payload,
                headers={
                    "X-API-Key": settings.TELI_API_KEY,
                    "Content-Type": "application/json"
                },
                timeout=30.0
            )
            
            if agent_response.status_code not in [200, 201]:
                return {"success": False, "error": f"Agent creation failed: {agent_response.text}"}
            
            agent_result = agent_response.json()
            sms_agent_id = agent_result.get("agent_id")
            
            # Start SMS campaign
            campaign_id = f"kb_sms_{uuid.uuid4().hex[:8]}"
            campaign_payload = {
                "campaign_id": campaign_id,
                "campaign_name": "SMS with Appointments KB",
                "organization_id": settings.TELI_ORG_ID,
                "user_id": settings.TELI_USER_ID,
                "sms_agent_id": sms_agent_id,
                "teli_sms_number": settings.TELI_SMS_NUMBER,
                "contacts": [
                    {"phone_number": request_data.phoneNumber, "first_name": request_data.firstName}
                ]
            }
            
            campaign_response = await http_client.post(
                f"{settings.TELI_API_URL}/v1/campaigns",
                json=campaign_payload,
                headers={
                    "X-API-Key": settings.TELI_API_KEY,
                    "Content-Type": "application/json"
                },
                timeout=30.0
            )
            
            campaign_result = campaign_response.json()
            
            return {
                "success": True,
                "sms_agent_id": sms_agent_id,
                "campaign_id": campaign_id,
                "appointment_count": len(appointments),
                "message": "SMS campaign with appointment data started",
                "phone": request_data.phoneNumber,
                "appointments_preview": [f"{a['TITLE']} - {a['APPOINTMENT_DATE']}" for a in appointments[:3]]
            }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/test-voice-with-kb")
async def test_voice_with_knowledge_base(
    request_data: KBTestRequest
):
    """
    Test Voice with knowledge base from appointments data
    """
    try:
        from app.db.snowflake_client import SnowflakeClient
        import httpx
        from app.core.config import settings
        
        # Get appointment data
        client = SnowflakeClient()
        await client.connect()
        
        appointments = await client.execute("""
            SELECT 
                appointment_id,
                user_id,
                title,
                appointment_date,
                appointment_time,
                location,
                status,
                notes
            FROM appointments 
            WHERE status = 'upcoming'
            ORDER BY appointment_date, appointment_time
            LIMIT 5
        """)
        
        await client.disconnect()
        
        # Format appointment data for voice
        kb_content = ", ".join([
            f"{a['TITLE']} on {a['APPOINTMENT_DATE']} at {a['APPOINTMENT_TIME']}"
            for a in appointments
        ])
        
        # Create voice agent with appointment context
        agent_payload = {
            "agent_type": "voice",
            "agent_name": "Avi Voice with Appointments",
            "starting_message": f"Hi {{{{{request_data.firstName}}}}}, this is Avi from AveloHealth calling about appointments. I have your schedule here. Do you have a moment?",
            "prompt": f"You are Avi from AveloHealth with appointment information: {kb_content}. Help patients confirm, reschedule, or ask about appointments. Be warm, professional, and HIPAA-compliant.",
            "organization_id": settings.TELI_ORG_ID,
            "user_id": settings.TELI_USER_ID,
            "voice_id": "openai-Alloy",
            "language": "en-US"
        }
        
        async with httpx.AsyncClient() as http_client:
            agent_response = await http_client.post(
                f"{settings.TELI_API_URL}/v1/agents",
                json=agent_payload,
                headers={
                    "X-API-Key": settings.TELI_API_KEY,
                    "Content-Type": "application/json"
                },
                timeout=30.0
            )
            
            if agent_response.status_code not in [200, 201]:
                return {"success": False, "error": f"Voice agent creation failed: {agent_response.text}"}
            
            agent_result = agent_response.json()
            voice_agent_id = agent_result.get("voice_agent_id") or agent_result.get("agent_id")
            
            # Start voice campaign
            campaign_payload = {
                "leads": [{"phone_number": request_data.phoneNumber, "first_name": request_data.firstName}],
                "voice_agent_id": voice_agent_id,
                "agent_outbound_number": settings.TELI_OUTBOUND_NUMBER,
                "organization_id": settings.TELI_ORG_ID,
                "tenant_id": "avelohealth",
                "user_id": settings.TELI_USER_ID
            }
            
            campaign_response = await http_client.post(
                f"{settings.TELI_API_URL}/v1/voice/campaigns",
                json=campaign_payload,
                headers={
                    "X-API-Key": settings.TELI_API_KEY,
                    "Content-Type": "application/json"
                },
                timeout=30.0
            )
            
            campaign_result = campaign_response.json()
            
            return {
                "success": True,
                "voice_agent_id": voice_agent_id,
                "campaign_id": campaign_result.get("campaign_id"),
                "appointment_count": len(appointments),
                "message": "Voice campaign with appointment data started",
                "phone": request_data.phoneNumber,
                "appointments_preview": [f"{a['TITLE']} - {a['APPOINTMENT_DATE']}" for a in appointments[:3]]
            }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== Webhook ====================

@router.post("/webhook")
async def teli_webhook(webhook_data: Dict[str, Any], request: Request):
    """
    Webhook endpoint for Teli AI callbacks
    Processes SMS responses and call completions
    """
    try:
        event_type = webhook_data.get("event")
        
        print(f"📥 Teli webhook received: {event_type}")
        print(f"   Data: {webhook_data}")
        
        # Process based on event type
        if event_type == "sms.received":
            # Handle incoming SMS response
            from_number = webhook_data.get("from_number")
            message_text = webhook_data.get("message")
            print(f"📱 SMS received from {from_number}: {message_text}")
            
        elif event_type == "sms.delivered":
            # SMS was delivered
            to_number = webhook_data.get("to_number")
            print(f"✅ SMS delivered to {to_number}")
            
        elif event_type == "call.completed":
            # Voice call completed
            call_id = webhook_data.get("call_id")
            print(f"📞 Call completed: {call_id}")
        
        return {
            "success": True,
            "message": "Webhook processed",
            "event": event_type,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        print(f"❌ Webhook error: {e}")
        raise HTTPException(status_code=500, detail="Webhook processing failed")


# ==================== Status ====================

@router.get("/status")
async def teli_status():
    """
    Check Teli API configuration status
    """
    from app.core.config import settings
    
    return {
        "success": True,
        "configured": bool(settings.TELI_API_KEY),
        "api_url": settings.TELI_API_URL,
        "default_phone_configured": bool(settings.TELI_DEFAULT_PHONE),
        "sms_agent_configured": bool(settings.TELI_SMS_AGENT_ID),
        "voice_agent_configured": bool(settings.TELI_VOICE_AGENT_ID),
        "outbound_number": settings.TELI_OUTBOUND_NUMBER,
        "timestamp": datetime.utcnow().isoformat()
    }
