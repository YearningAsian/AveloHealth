"""
Patient Routes
HIPAA-compliant patient data access
"""

from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from app.core.auth import get_current_user, require_permission
from app.core.hipaa import HIPAACompliance
from app.db.snowflake_client import SnowflakeClient

router = APIRouter()

class PatientResponse(BaseModel):
    id: str
    firstName: str
    lastName: str
    dateOfBirth: str
    phone: str
    riskScore: float
    riskLevel: str
    lastContactDate: Optional[str]

@router.get("/", dependencies=[Depends(require_permission("view:patients"))])
async def get_patients(
    request: Request,
    risk_level: Optional[str] = None,
    limit: int = 100,
    offset: int = 0,
    current_user: dict = Depends(get_current_user)
):
    """Get list of patients with optional filtering"""
    
    snowflake: SnowflakeClient = request.app.state.snowflake
    
    try:
        patients = await snowflake.get_patients(
            risk_level=risk_level,
            limit=limit,
            offset=offset
        )
        
        # Log audit trail
        audit_entry = HIPAACompliance.create_audit_log(
            user_id=current_user["sub"],
            action="VIEW",
            resource_type="PATIENTS",
            resource_id="list",
            details={"filters": {"risk_level": risk_level, "limit": limit}}
        )
        await snowflake.log_audit(audit_entry)
        
        return {
            "success": True,
            "data": patients,
            "count": len(patients),
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        error = HIPAACompliance.sanitize_error_message(e)
        raise HTTPException(status_code=500, detail=error)

@router.get("/{patient_id}", dependencies=[Depends(require_permission("view:patients"))])
async def get_patient(
    patient_id: str,
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """Get specific patient by ID"""
    
    snowflake: SnowflakeClient = request.app.state.snowflake
    
    try:
        patient = await snowflake.get_patient(patient_id)
        
        if not patient:
            raise HTTPException(status_code=404, detail="Patient not found")
        
        # Log audit trail
        audit_entry = HIPAACompliance.create_audit_log(
            user_id=current_user["sub"],
            action="VIEW",
            resource_type="PATIENT",
            resource_id=patient_id
        )
        await snowflake.log_audit(audit_entry)
        
        return {
            "success": True,
            "data": patient,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        error = HIPAACompliance.sanitize_error_message(e)
        raise HTTPException(status_code=500, detail=error)

@router.get("/high-risk/list", dependencies=[Depends(require_permission("view:patients"))])
async def get_high_risk_patients(
    request: Request,
    limit: int = 50,
    current_user: dict = Depends(get_current_user)
):
    """Get high-risk patients needing outreach"""
    
    snowflake: SnowflakeClient = request.app.state.snowflake
    
    try:
        patients = await snowflake.get_high_risk_patients(limit=limit)
        
        # Log audit trail
        audit_entry = HIPAACompliance.create_audit_log(
            user_id=current_user["sub"],
            action="VIEW",
            resource_type="HIGH_RISK_PATIENTS",
            resource_id="list"
        )
        await snowflake.log_audit(audit_entry)
        
        return {
            "success": True,
            "data": patients,
            "count": len(patients),
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        error = HIPAACompliance.sanitize_error_message(e)
        raise HTTPException(status_code=500, detail=error)
    
class PatientCallRequest(BaseModel):
    name: str
    age: int
    phone: str
    location: str
    symptoms: str

@router.post("/calls/submit")
async def submit_patient_call(
    data: PatientCallRequest,
    request: Request
):
    """Submit a patient call (no auth required for testing)"""
    snowflake: SnowflakeClient = request.app.state.snowflake
    
    try:
        result = await snowflake.insert_patient_call(
            name=data.name,
            age=data.age,
            phone=data.phone,
            location=data.location,
            symptoms=data.symptoms
        )
        return {
            "success": True,
            "call_id": result["call_id"],
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/calls/list")
async def get_patient_calls(request: Request):
    """Get all patient calls (no auth required for testing)"""
    snowflake: SnowflakeClient = request.app.state.snowflake
    
    try:
        calls = await snowflake.get_patient_calls()
        return {
            "success": True,
            "data": calls,
            "count": len(calls),
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/calls/summaries")
async def get_ai_summaries(request: Request):
    """Get AI-generated summaries for patient calls"""
    snowflake: SnowflakeClient = request.app.state.snowflake
    
    try:
        summaries = await snowflake.get_ai_patient_summaries()
        return {
            "success": True,
            "data": summaries,
            "count": len(summaries),
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
