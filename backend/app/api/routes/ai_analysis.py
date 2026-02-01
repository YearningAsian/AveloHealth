"""
AI Analysis Routes
Gemini-powered predictive triage
"""

from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from app.core.auth import get_current_user, require_permission
from app.core.hipaa import HIPAACompliance
from app.services.gemini_service import GeminiService
from app.db.snowflake_client import SnowflakeClient

router = APIRouter()
gemini_service = GeminiService()

class AnalyzePatientRequest(BaseModel):
    patientId: str
    analysisType: str = "triage"

class BatchAnalysisRequest(BaseModel):
    patientIds: List[str]

@router.post("/analyze-patient", dependencies=[Depends(require_permission("trigger:ai-analysis"))])
async def analyze_patient(
    request_data: AnalyzePatientRequest,
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """
    Analyze single patient using Gemini AI
    Returns risk assessment and recommendations
    """
    
    snowflake: SnowflakeClient = request.app.state.snowflake
    
    try:
        # Get patient data
        patient = await snowflake.get_patient(request_data.patientId)
        
        if not patient:
            raise HTTPException(status_code=404, detail="Patient not found")
        
        # Check AI consent
        if not patient.get('CONSENT_FOR_AI'):
            raise HTTPException(
                status_code=403,
                detail="Patient has not consented to AI analysis"
            )
        
        # Perform Gemini analysis
        analysis = await gemini_service.analyze_patient_risk(
            patient_data=patient,
            clinical_data={
                "chronic_conditions": patient.get('CHRONIC_CONDITIONS', []),
                "medications": [],
                "recent_appointments": 0,
                "missed_appointments": 0,
                "recent_vitals": [],
                "lab_results": []
            }
        )
        
        # Save analysis to Snowflake
        analysis_record = {
            "id": analysis["analysis_id"],
            "patient_id": request_data.patientId,
            "analysis_type": request_data.analysisType,
            "risk_score": analysis["risk_score"],
            "risk_level": analysis["risk_level"],
            "risk_factors": analysis["risk_factors"],
            "recommended_actions": analysis["recommended_actions"],
            "ai_insights": analysis["ai_insights"],
            "clinical_summary": analysis["clinical_summary"],
            "priority_level": analysis["priority_level"]
        }
        
        await snowflake.save_ai_analysis(analysis_record)
        
        # Update patient risk score
        await snowflake.update_patient_risk(
            patient_id=request_data.patientId,
            risk_score=analysis["risk_score"],
            risk_level=analysis["risk_level"]
        )
        
        # Log audit trail
        audit_entry = HIPAACompliance.create_audit_log(
            user_id=current_user["sub"],
            action="AI_ANALYSIS",
            resource_type="PATIENT",
            resource_id=request_data.patientId,
            details={"analysis_id": analysis["analysis_id"]}
        )
        await snowflake.log_audit(audit_entry)
        
        return {
            "success": True,
            "data": analysis,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        error = HIPAACompliance.sanitize_error_message(e)
        raise HTTPException(status_code=500, detail=error)

@router.post("/predictive-triage", dependencies=[Depends(require_permission("trigger:ai-analysis"))])
async def predictive_triage(
    request: Request,
    limit: int = 50,
    current_user: dict = Depends(get_current_user)
):
    """
    Run predictive triage on high-risk patients
    Core workflow: Gemini scans Snowflake records to flag patients
    """
    
    snowflake: SnowflakeClient = request.app.state.snowflake
    
    try:
        # Get high-risk patients from Snowflake
        patients = await snowflake.get_high_risk_patients(limit=limit)
        
        # Batch analyze with Gemini
        analyses = await gemini_service.batch_analyze_patients(patients)
        
        # Prepare triage results
        triage_results = {
            "patients": [
                {
                    "patientId": analysis["patient_id"],
                    "patientName": "Patient Name",  # Get from patient data
                    "riskScore": analysis["risk_score"],
                    "riskLevel": analysis["risk_level"],
                    "flaggedConditions": [rf["factor"] for rf in analysis.get("risk_factors", [])[:3]],
                    "lastContact": "Unknown",
                    "recommendedAction": analysis.get("suggested_outreach", {}).get("reason", "Review needed")
                }
                for analysis in analyses
            ],
            "totalHighRisk": len([a for a in analyses if a["risk_level"] == "high"]),
            "totalCritical": len([a for a in analyses if a["risk_level"] == "critical"]),
            "generatedAt": datetime.utcnow().isoformat()
        }
        
        # Log audit trail
        audit_entry = HIPAACompliance.create_audit_log(
            user_id=current_user["sub"],
            action="PREDICTIVE_TRIAGE",
            resource_type="BATCH_ANALYSIS",
            resource_id=f"triage_{int(datetime.utcnow().timestamp())}",
            details={"patients_analyzed": len(patients)}
        )
        await snowflake.log_audit(audit_entry)
        
        return {
            "success": True,
            "data": triage_results,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        error = HIPAACompliance.sanitize_error_message(e)
        raise HTTPException(status_code=500, detail=error)

@router.post("/generate-outreach-script")
async def generate_outreach_script(
    patient_id: str,
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """Generate personalized outreach script for patient"""
    
    snowflake: SnowflakeClient = request.app.state.snowflake
    
    try:
        patient = await snowflake.get_patient(patient_id)
        
        if not patient:
            raise HTTPException(status_code=404, detail="Patient not found")
        
        # Get latest analysis
        analysis = {"risk_level": patient.get("RISK_LEVEL", "medium")}
        
        script = await gemini_service.generate_outreach_script(patient, analysis)
        
        return {
            "success": True,
            "data": {"script": script},
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        error = HIPAACompliance.sanitize_error_message(e)
        raise HTTPException(status_code=500, detail=error)
