"""
Teli AI Routes
Voice interaction and automated scheduling
"""

from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime

from app.core.auth import get_current_user, require_permission
from app.core.hipaa import HIPAACompliance
from app.services.teli_service import TeliAIService
from app.db.snowflake_client import SnowflakeClient

router = APIRouter()
teli_service = TeliAIService()

class InitiateCallRequest(BaseModel):
    patientId: str
    callType: str
    script: Optional[str] = None

class ScheduleCallRequest(BaseModel):
    patientId: str
    callType: str
    scheduledTime: str
    script: Optional[str] = None

@router.post("/initiate-call", dependencies=[Depends(require_permission("schedule:teli-calls"))])
async def initiate_call(
    request_data: InitiateCallRequest,
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """
    Initiate Teli AI call to patient
    Core workflow: Teli AI → FastAPI → Snowflake
    """
    
    snowflake: SnowflakeClient = request.app.state.snowflake
    
    try:
        # Get patient data
        patient = await snowflake.get_patient(request_data.patientId)
        
        if not patient:
            raise HTTPException(status_code=404, detail="Patient not found")
        
        # Initiate call via Teli AI
        call_result = await teli_service.initiate_call(
            patient_data=patient,
            call_type=request_data.callType,
            script=request_data.script
        )
        
        # Save call record to Snowflake
        call_record = {
            "id": call_result["call_id"],
            "patient_id": request_data.patientId,
            "call_type": request_data.callType,
            "status": call_result["status"],
            "initiated_at": call_result["initiated_at"],
            "completed_at": None,
            "duration": None,
            "transcript": None,
            "summary": None,
            "extracted_data": {},
            "sentiment": None
        }
        
        await snowflake.save_teli_call(call_record)
        
        # Log audit trail
        audit_entry = HIPAACompliance.create_audit_log(
            user_id=current_user["sub"],
            action="INITIATE_TELI_CALL",
            resource_type="PATIENT",
            resource_id=request_data.patientId,
            details={"call_id": call_result["call_id"], "call_type": request_data.callType}
        )
        await snowflake.log_audit(audit_entry)
        
        return {
            "success": True,
            "data": call_result,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        error = HIPAACompliance.sanitize_error_message(e)
        raise HTTPException(status_code=500, detail=error)

@router.post("/schedule-call", dependencies=[Depends(require_permission("schedule:teli-calls"))])
async def schedule_call(
    request_data: ScheduleCallRequest,
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """Schedule Teli AI call for future execution"""
    
    snowflake: SnowflakeClient = request.app.state.snowflake
    
    try:
        patient = await snowflake.get_patient(request_data.patientId)
        
        if not patient:
            raise HTTPException(status_code=404, detail="Patient not found")
        
        result = await teli_service.schedule_call(
            patient_data=patient,
            call_type=request_data.callType,
            scheduled_time=request_data.scheduledTime,
            script=request_data.script
        )
        
        return {
            "success": True,
            "data": result,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        error = HIPAACompliance.sanitize_error_message(e)
        raise HTTPException(status_code=500, detail=error)

@router.post("/webhook")
async def teli_webhook(webhook_data: Dict[str, Any], request: Request):
    """
    Webhook endpoint for Teli AI callbacks
    Processes completed calls and updates Snowflake
    Updates appointment status based on call outcome
    """
    
    snowflake: SnowflakeClient = request.app.state.snowflake
    
    try:
        # Process webhook
        processed = await teli_service.process_webhook(webhook_data)
        
        call_id = processed.get("call_id")
        event_type = webhook_data.get("event_type")
        
        # Get the Teli call record from our database
        teli_call = await snowflake.get_teli_call_by_id(call_id)
        
        if teli_call:
            action_id = teli_call.get("ACTION_ID") or teli_call.get("action_id")
            call_type = teli_call.get("CALL_TYPE") or teli_call.get("call_type")
            
            if event_type == "call.completed":
                # Update Teli call record
                await snowflake.update_teli_call(call_id, {
                    "status": "completed",
                    "completed_at": processed.get("completed_at"),
                    "duration_seconds": processed.get("duration"),
                    "outcome": processed.get("outcome", "confirmed")
                })
                
                # Save transcript if available
                if processed.get("transcript"):
                    await snowflake.create_call_transcript({
                        "call_id": call_id,
                        "full_transcript": processed.get("transcript"),
                        "summary": processed.get("summary"),
                        "sentiment": processed.get("sentiment"),
                        "extracted_data": processed.get("extracted_data", {})
                    })
                
                # Update appointment status based on call type and outcome
                if action_id:
                    action = await snowflake.get_action_by_id(action_id)
                    if action:
                        appointment_id = action.get("APPOINTMENT_ID") or action.get("appointment_id")
                        action_type = action.get("ACTION_TYPE") or action.get("action_type")
                        outcome = processed.get("outcome", "confirmed")
                        
                        if outcome == "confirmed":
                            # Action succeeded
                            await snowflake.update_action_status(action_id, "completed")
                            
                            if action_type == "cancel":
                                await snowflake.update_appointment(appointment_id, {
                                    "status": "cancelled"
                                })
                            elif action_type == "reschedule":
                                # Update to new date/time if reschedule was confirmed
                                new_date = action.get("REQUESTED_NEW_DATE") or action.get("requested_new_date")
                                new_time = action.get("REQUESTED_NEW_TIME") or action.get("requested_new_time")
                                await snowflake.update_appointment(appointment_id, {
                                    "status": "rescheduled",
                                    "appointment_date": new_date,
                                    "appointment_time": new_time
                                })
                        else:
                            # Action was denied or needs callback
                            await snowflake.update_action_status(action_id, "failed")
                            
                            if action_type == "cancel":
                                await snowflake.update_appointment(appointment_id, {
                                    "status": "cancellation_failed"
                                })
                            elif action_type == "reschedule":
                                await snowflake.update_appointment(appointment_id, {
                                    "status": "rescheduling_failed"
                                })
                
            elif event_type == "call.failed":
                # Call failed (no answer, busy, etc.)
                await snowflake.update_teli_call(call_id, {
                    "status": "failed",
                    "completed_at": datetime.utcnow().isoformat(),
                    "outcome": "no_answer"
                })
                
                # Update appointment to failed status
                if action_id:
                    action = await snowflake.get_action_by_id(action_id)
                    if action:
                        appointment_id = action.get("APPOINTMENT_ID") or action.get("appointment_id")
                        action_type = action.get("ACTION_TYPE") or action.get("action_type")
                        
                        await snowflake.update_action_status(action_id, "failed")
                        
                        if action_type == "cancel":
                            await snowflake.update_appointment(appointment_id, {
                                "status": "cancellation_failed"
                            })
                        elif action_type == "reschedule":
                            await snowflake.update_appointment(appointment_id, {
                                "status": "rescheduling_failed"
                            })
        
        return {
            "success": True,
            "message": "Webhook processed",
            "call_id": call_id,
            "event": event_type,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        print(f"❌ Webhook processing failed: {e}")
        raise HTTPException(status_code=500, detail="Webhook processing failed")

@router.get("/call/{call_id}/status")
async def get_call_status(
    call_id: str,
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """Get status of Teli AI call"""
    
    snowflake: SnowflakeClient = request.app.state.snowflake
    
    try:
        # First check our database
        teli_call = await snowflake.get_teli_call_by_id(call_id)
        
        if teli_call:
            return {
                "success": True,
                "data": {
                    "callId": call_id,
                    "status": teli_call.get("STATUS") or teli_call.get("status"),
                    "callType": teli_call.get("CALL_TYPE") or teli_call.get("call_type"),
                    "phoneNumberCalled": teli_call.get("PHONE_NUMBER_CALLED") or teli_call.get("phone_number_called"),
                    "durationSeconds": teli_call.get("DURATION_SECONDS") or teli_call.get("duration_seconds"),
                    "outcome": teli_call.get("OUTCOME") or teli_call.get("outcome"),
                    "startedAt": str(teli_call.get("STARTED_AT") or teli_call.get("started_at", "")),
                    "completedAt": str(teli_call.get("COMPLETED_AT") or teli_call.get("completed_at", ""))
                },
                "timestamp": datetime.utcnow().isoformat()
            }
        
        # Fall back to Teli API
        status = await teli_service.get_call_status(call_id)
        
        return {
            "success": True,
            "data": status,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        error = HIPAACompliance.sanitize_error_message(e)
        raise HTTPException(status_code=500, detail=error)


@router.get("/call/{call_id}/transcript")
async def get_call_transcript(
    call_id: str,
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """Get transcript for a Teli AI call"""
    
    snowflake: SnowflakeClient = request.app.state.snowflake
    user_id = current_user.get("sub")
    
    try:
        # Verify user owns this call
        teli_call = await snowflake.get_teli_call_by_id(call_id)
        
        if not teli_call:
            raise HTTPException(status_code=404, detail="Call not found")
        
        call_user_id = teli_call.get("USER_ID") or teli_call.get("user_id")
        if call_user_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to view this transcript")
        
        # Get transcript from database
        transcript = await snowflake.get_transcript_by_call_id(call_id)
        
        if transcript:
            return {
                "success": True,
                "data": {
                    "callId": call_id,
                    "transcriptId": transcript.get("TRANSCRIPT_ID") or transcript.get("transcript_id"),
                    "fullTranscript": transcript.get("FULL_TRANSCRIPT") or transcript.get("full_transcript"),
                    "summary": transcript.get("SUMMARY") or transcript.get("summary"),
                    "sentiment": transcript.get("SENTIMENT") or transcript.get("sentiment"),
                    "extractedData": transcript.get("EXTRACTED_DATA") or transcript.get("extracted_data", {})
                },
                "timestamp": datetime.utcnow().isoformat()
            }
        
        # Fall back to Teli API if not in database
        transcript_text = await teli_service.get_call_transcript(call_id)
        
        if transcript_text:
            return {
                "success": True,
                "data": {
                    "callId": call_id,
                    "fullTranscript": transcript_text,
                    "summary": None,
                    "sentiment": None
                },
                "timestamp": datetime.utcnow().isoformat()
            }
        
        return {
            "success": True,
            "data": None,
            "message": "No transcript available yet",
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        error = HIPAACompliance.sanitize_error_message(e)
        raise HTTPException(status_code=500, detail=error)


@router.get("/call/{call_id}/messages")
async def get_transcript_messages(
    call_id: str,
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """Get individual messages from a call transcript"""
    
    snowflake: SnowflakeClient = request.app.state.snowflake
    user_id = current_user.get("sub")
    
    try:
        # Verify user owns this call
        teli_call = await snowflake.get_teli_call_by_id(call_id)
        
        if not teli_call:
            raise HTTPException(status_code=404, detail="Call not found")
        
        call_user_id = teli_call.get("USER_ID") or teli_call.get("user_id")
        if call_user_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized")
        
        # Get transcript first
        transcript = await snowflake.get_transcript_by_call_id(call_id)
        
        if not transcript:
            return {
                "success": True,
                "data": [],
                "message": "No transcript available",
                "timestamp": datetime.utcnow().isoformat()
            }
        
        transcript_id = transcript.get("TRANSCRIPT_ID") or transcript.get("transcript_id")
        
        # Get messages
        messages = await snowflake.get_transcript_messages(transcript_id)
        
        formatted_messages = [
            {
                "id": msg.get("MESSAGE_ID") or msg.get("message_id"),
                "speaker": msg.get("SPEAKER") or msg.get("speaker"),
                "text": msg.get("MESSAGE_TEXT") or msg.get("message_text"),
                "timestampSeconds": msg.get("TIMESTAMP_SECONDS") or msg.get("timestamp_seconds"),
                "sequence": msg.get("SEQUENCE_NUMBER") or msg.get("sequence_number")
            }
            for msg in messages
        ]
        
        return {
            "success": True,
            "data": formatted_messages,
            "count": len(formatted_messages),
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        error = HIPAACompliance.sanitize_error_message(e)
        raise HTTPException(status_code=500, detail=error)
