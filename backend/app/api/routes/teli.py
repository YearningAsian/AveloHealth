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
    """
    
    snowflake: SnowflakeClient = request.app.state.snowflake
    
    try:
        # Process webhook
        processed = await teli_service.process_webhook(webhook_data)
        
        # Update call record in Snowflake
        if processed.get("status") == "completed":
            call_record = {
                "id": processed["call_id"],
                "patient_id": processed["patient_id"],
                "call_type": webhook_data.get("call_type", "unknown"),
                "status": "completed",
                "initiated_at": webhook_data.get("initiated_at"),
                "completed_at": processed["completed_at"],
                "duration": processed.get("duration"),
                "transcript": processed.get("transcript"),
                "summary": processed.get("summary"),
                "extracted_data": processed.get("extracted_data", {}),
                "sentiment": processed.get("sentiment")
            }
            
            await snowflake.save_teli_call(call_record)
        
        return {
            "success": True,
            "message": "Webhook processed",
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        print(f"❌ Webhook processing failed: {e}")
        raise HTTPException(status_code=500, detail="Webhook processing failed")

@router.get("/call/{call_id}/status")
async def get_call_status(call_id: str, current_user: dict = Depends(get_current_user)):
    """Get status of Teli AI call"""
    
    try:
        status = await teli_service.get_call_status(call_id)
        
        return {
            "success": True,
            "data": status,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        error = HIPAACompliance.sanitize_error_message(e)
        raise HTTPException(status_code=500, detail=error)
