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

@router.post("/webhook/tally")
async def tally_webhook(
    request: Request
):
    """
    Tally form webhook endpoint for QuickDiagnosis assessments
    Receives form submissions from Tally and stores patient data
    No authentication required - webhook endpoint
    """
    snowflake: SnowflakeClient = request.app.state.snowflake
    
    try:
        # Get the raw JSON payload from Tally
        payload = await request.json()
        
        # Extract Tally form data
        # Tally sends data in the format: {"eventId": "...", "eventType": "FORM_RESPONSE", "createdAt": "...", "data": {...}}
        event_type = payload.get("eventType")
        form_data = payload.get("data", {})
        
        # Only process form responses
        if event_type != "FORM_RESPONSE":
            return {
                "success": True,
                "message": "Event type not processed",
                "timestamp": datetime.utcnow().isoformat()
            }
        
        # Extract fields from Tally form (adjust field names based on your Tally form structure)
        fields = form_data.get("fields", [])
        
        # Helper function to get field value by label or key
        def get_field_value(fields_list, label_key):
            for field in fields_list:
                if field.get("label") == label_key or field.get("key") == label_key:
                    return field.get("value", "")
            return None
        
        # Extract patient information from form fields
        name = get_field_value(fields, "name") or get_field_value(fields, "Name") or "Unknown"
        age = get_field_value(fields, "age") or get_field_value(fields, "Age")
        phone = get_field_value(fields, "phone") or get_field_value(fields, "Phone") or get_field_value(fields, "Phone number")
        location = get_field_value(fields, "location") or get_field_value(fields, "Location") or ""
        symptoms = get_field_value(fields, "symptoms") or get_field_value(fields, "Symptoms") or ""
        
        # Convert age to int if present
        age_int = None
        if age:
            try:
                age_int = int(age)
            except (ValueError, TypeError):
                age_int = None
        
        # Insert patient call data into Snowflake
        if phone:  # Only insert if we have at least a phone number
            result = await snowflake.insert_patient_call(
                name=name,
                age=age_int or 0,
                phone=phone,
                location=location,
                symptoms=symptoms
            )
            
            return {
                "success": True,
                "message": "Patient assessment received",
                "call_id": result.get("call_id"),
                "timestamp": datetime.utcnow().isoformat()
            }
        else:
            return {
                "success": False,
                "message": "Missing required field: phone",
                "timestamp": datetime.utcnow().isoformat()
            }
        
    except Exception as e:
        # Return 200 with error message to prevent Tally from retrying
        return {
            "success": False,
            "message": f"Error processing webhook: {str(e)}",
            "timestamp": datetime.utcnow().isoformat()
        }


@router.post("/refresh-summary/{patient_id}")
async def refresh_patient_summary(
    patient_id: str,
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """Refresh patient summary after profile updates"""
    
    snowflake: SnowflakeClient = request.app.state.snowflake
    
    try:
        await update_patient_summary_after_profile_change(snowflake, patient_id)
        
        return {
            "success": True,
            "message": "Patient summary updated successfully",
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        error = HIPAACompliance.sanitize_error_message(e)
        raise HTTPException(status_code=500, detail=error)


async def update_patient_summary_after_profile_change(snowflake: SnowflakeClient, patient_id: str):
    """
    Update patient summary after profile changes
    """
    try:
        # Get patient details with appointments
        patient_data = await snowflake.execute(
            """SELECT u.first_name, u.last_name, u.phone, u.date_of_birth, u.chronic_conditions,
                      COUNT(a.appointment_id) as upcoming_appointments
               FROM users u
               LEFT JOIN appointments a ON u.user_id = a.user_id AND a.status = 'upcoming'
               WHERE u.user_id = %s
               GROUP BY u.user_id, u.first_name, u.last_name, u.phone, u.date_of_birth, u.chronic_conditions""",
            (patient_id,)
        )
        
        if not patient_data:
            return
            
        patient = patient_data[0]
        
        # Calculate age from DOB
        dob = patient.get('DATE_OF_BIRTH')
        age = "unknown"
        if dob:
            from datetime import date
            today = date.today()
            if isinstance(dob, str):
                try:
                    dob = datetime.strptime(dob, '%Y-%m-%d').date()
                except:
                    pass
            if isinstance(dob, date):
                age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
        
        # Generate comprehensive summary
        summary_parts = [
            f"Patient: {patient['FIRST_NAME']} {patient['LAST_NAME']}",
            f"Age: {age}",
            f"Upcoming appointments: {patient['UPCOMING_APPOINTMENTS'] or 0}"
        ]
        
        if patient.get('CHRONIC_CONDITIONS'):
            summary_parts.append(f"Chronic conditions: {patient['CHRONIC_CONDITIONS']}")
            
        summary = ". ".join(summary_parts) + "."
        
        # Update AI analyses with new summary
        await snowflake.execute(
            """INSERT INTO ai_analyses (analysis_id, patient_id, analysis_type, ai_insights, priority_level, analysis_date)
               VALUES (%s, %s, %s, %s, %s, %s)""",
            (
                f"profile_summary_{patient_id}_{int(datetime.utcnow().timestamp())}",
                patient_id,
                "profile_summary",
                summary,
                "info",
                datetime.utcnow()
            )
        )
        
        print(f"Updated patient summary for {patient_id}: {summary}")
        
    except Exception as e:
        print(f"Error updating patient summary after profile change: {e}")
        raise
