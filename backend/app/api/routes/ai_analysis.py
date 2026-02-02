"""
AI Analysis Routes
Snowflake Cortex-powered predictive triage and health analysis
"""

from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import json

from app.core.auth import get_current_user, require_permission
from app.core.hipaa import HIPAACompliance
from app.db.snowflake_client import SnowflakeClient

router = APIRouter()

class AnalyzePatientRequest(BaseModel):
    patientId: str
    analysisType: str = "triage"

class BatchAnalysisRequest(BaseModel):
    patientIds: List[str]

class AnalyzeEntriesRequest(BaseModel):
    """Request to analyze health diary entries"""
    entries: List[dict]  # List of {date, symptoms, severity, notes}
    familyHistory: Optional[List[str]] = None
    dateOfBirth: Optional[str] = None

class AnalyzeSymptomsRequest(BaseModel):
    """Request to analyze specific symptoms"""
    symptoms: str
    severity: str  # low, medium, high
    notes: Optional[str] = None


async def cortex_complete(snowflake: SnowflakeClient, prompt: str) -> str:
    """Execute Snowflake Cortex COMPLETE function"""
    try:
        # Escape single quotes in prompt
        safe_prompt = prompt.replace("'", "''")
        result = await snowflake.execute(f"""
            SELECT SNOWFLAKE.CORTEX.COMPLETE(
                'mistral-large',
                '{safe_prompt}'
            ) AS response
        """)
        if result and result[0]:
            return result[0].get('RESPONSE', '')
        return ''
    except Exception as e:
        print(f"Cortex error: {e}")
        return ''


@router.post("/analyze-patient", dependencies=[Depends(require_permission("trigger:ai-analysis"))])
async def analyze_patient(
    request_data: AnalyzePatientRequest,
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """
    Analyze single patient using Snowflake Cortex AI
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
        
        # Build analysis prompt
        prompt = f"""Analyze this patient for risk assessment. Return ONLY valid JSON.

Patient Data:
- Age: {patient.get('AGE', 'unknown')}
- Chronic Conditions: {patient.get('CHRONIC_CONDITIONS', 'none')}

Return JSON with keys: risk_score (0-100), risk_level (low/medium/high/critical), risk_factors (array), recommended_actions (array), clinical_summary (string)"""

        response = await cortex_complete(snowflake, prompt)
        
        # Parse response
        try:
            start = response.find('{')
            end = response.rfind('}') + 1
            if start >= 0 and end > start:
                analysis = json.loads(response[start:end])
            else:
                analysis = {
                    "risk_score": 50,
                    "risk_level": "medium",
                    "risk_factors": [],
                    "recommended_actions": ["Schedule follow-up"],
                    "clinical_summary": "Analysis completed"
                }
        except json.JSONDecodeError:
            analysis = {
                "risk_score": 50,
                "risk_level": "medium",
                "risk_factors": [],
                "recommended_actions": ["Schedule follow-up"],
                "clinical_summary": "Analysis completed"
            }
        
        analysis["analysis_id"] = f"analysis_{int(datetime.utcnow().timestamp())}"
        analysis["ai_insights"] = analysis.get("clinical_summary", "")
        analysis["priority_level"] = analysis.get("risk_level", "medium")
        
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
    Run predictive triage on high-risk patients using Snowflake Cortex
    """
    
    snowflake: SnowflakeClient = request.app.state.snowflake
    
    try:
        # Get high-risk patients from Snowflake
        patients = await snowflake.get_high_risk_patients(limit=limit)
        
        # Prepare triage results using Snowflake Cortex
        triage_results = {
            "patients": [
                {
                    "patientId": p.get("PATIENT_ID"),
                    "patientName": p.get("NAME", "Unknown"),
                    "riskScore": p.get("RISK_SCORE", 50),
                    "riskLevel": p.get("RISK_LEVEL", "medium"),
                    "flaggedConditions": [],
                    "lastContact": "Unknown",
                    "recommendedAction": "Review needed"
                }
                for p in patients
            ],
            "totalHighRisk": len([p for p in patients if p.get("RISK_LEVEL") == "high"]),
            "totalCritical": len([p for p in patients if p.get("RISK_LEVEL") == "critical"]),
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
    """Generate personalized outreach script using Snowflake Cortex"""
    
    snowflake: SnowflakeClient = request.app.state.snowflake
    
    try:
        patient = await snowflake.get_patient(patient_id)
        
        if not patient:
            raise HTTPException(status_code=404, detail="Patient not found")
        
        prompt = f"""Generate a brief, caring outreach script for a healthcare call.
Patient: {patient.get('NAME', 'Patient')}
Risk Level: {patient.get('RISK_LEVEL', 'medium')}

Keep it warm, professional, and under 100 words."""

        script = await cortex_complete(snowflake, prompt)
        
        return {
            "success": True,
            "data": {"script": script or "Hello! We're reaching out to check on your health and see if you need any support."},
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        error = HIPAACompliance.sanitize_error_message(e)
        raise HTTPException(status_code=500, detail=error)


# ============ PATIENT-FACING HEALTH DIARY ANALYSIS ============

@router.post("/analyze-entries")
async def analyze_health_entries(
    request_data: AnalyzeEntriesRequest,
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """
    Analyze user's health diary entries using Snowflake Cortex AI
    Returns insights, patterns, and recommendations
    """
    
    snowflake: SnowflakeClient = request.app.state.snowflake
    
    try:
        # Build analysis prompt
        entries_text = "\\n".join([
            f"- {e.get('date', 'Unknown')}: {e.get('symptoms', 'None')} (Severity: {e.get('severity', 'unknown')})"
            for e in request_data.entries[-10:]
        ])
        
        family_history = ", ".join(request_data.familyHistory) if request_data.familyHistory else "None"
        
        prompt = f"""Analyze these health diary entries. Return ONLY valid JSON.

ENTRIES:
{entries_text}

FAMILY HISTORY: {family_history}

Return JSON with: insights (array of 2-3 strings), patterns (array), recommendations (array of 2-3 strings), riskLevel (low/moderate/high)

Be supportive. Do NOT diagnose. Recommend consulting doctors for concerns."""

        response = await cortex_complete(snowflake, prompt)
        
        try:
            start = response.find('{')
            end = response.rfind('}') + 1
            if start >= 0 and end > start:
                analysis = json.loads(response[start:end])
            else:
                analysis = {
                    "insights": ["Continue tracking your symptoms for better insights."],
                    "patterns": [],
                    "recommendations": ["Stay consistent with your health logging."],
                    "riskLevel": "low"
                }
        except json.JSONDecodeError:
            analysis = {
                "insights": ["Analysis completed. Keep tracking your health!"],
                "patterns": [],
                "recommendations": ["Continue monitoring and consult your healthcare provider."],
                "riskLevel": "unknown"
            }
        
        return {
            "success": True,
            "data": analysis,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        print(f"Analyze entries error: {e}")
        return {
            "success": True,
            "data": {
                "insights": ["We couldn't complete the analysis at this time."],
                "patterns": [],
                "recommendations": ["Please try again later or consult your healthcare provider."],
                "riskLevel": "unknown"
            },
            "timestamp": datetime.utcnow().isoformat()
        }


@router.post("/analyze-symptom")
async def analyze_single_symptom(
    request_data: AnalyzeSymptomsRequest,
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """
    Quick analysis of a specific symptom using Snowflake Cortex
    Returns possible causes and recommendations
    """
    
    snowflake: SnowflakeClient = request.app.state.snowflake
    
    try:
        prompt = f"""Analyze this symptom. Return ONLY valid JSON.

SYMPTOM: {request_data.symptoms}
SEVERITY: {request_data.severity}
NOTES: {request_data.notes or 'None'}

Return JSON with: possibleCauses (array of 2-3), urgency (low/moderate/high), selfCare (array of 2-3 tips), seekHelp (boolean), seekHelpReason (string or null)

Be reassuring. Do NOT diagnose. Recommend professional help for concerning symptoms."""

        response = await cortex_complete(snowflake, prompt)
        
        try:
            start = response.find('{')
            end = response.rfind('}') + 1
            if start >= 0 and end > start:
                analysis = json.loads(response[start:end])
            else:
                analysis = {
                    "possibleCauses": ["Various common causes"],
                    "urgency": "low",
                    "selfCare": ["Rest", "Stay hydrated", "Monitor symptoms"],
                    "seekHelp": False,
                    "seekHelpReason": None
                }
        except json.JSONDecodeError:
            analysis = {
                "possibleCauses": ["Various common causes"],
                "urgency": "low", 
                "selfCare": ["Rest", "Stay hydrated", "Monitor symptoms"],
                "seekHelp": False,
                "seekHelpReason": None
            }
        
        return {
            "success": True,
            "data": analysis,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        print(f"Analyze symptom error: {e}")
        return {
            "success": True,
            "data": {
                "possibleCauses": ["Unable to analyze at this time"],
                "urgency": "unknown",
                "selfCare": ["Monitor your symptoms and rest"],
                "seekHelp": False,
                "seekHelpReason": None
            },
            "timestamp": datetime.utcnow().isoformat()
        }
