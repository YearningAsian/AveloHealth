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


# ============ PATIENT-FACING HEALTH DIARY ANALYSIS ============

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


@router.post("/analyze-entries")
async def analyze_health_entries(
    request_data: AnalyzeEntriesRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Analyze user's health diary entries using Gemini AI
    Returns insights, patterns, and recommendations
    """
    
    if not gemini_service.model:
        return {
            "success": True,
            "data": {
                "insights": ["AI analysis is currently unavailable. Please try again later."],
                "patterns": [],
                "recommendations": ["Continue tracking your symptoms and consult your healthcare provider for personalized advice."],
                "riskLevel": "unknown"
            },
            "timestamp": datetime.utcnow().isoformat()
        }
    
    try:
        # Build analysis prompt
        entries_text = "\n".join([
            f"- {e.get('date', 'Unknown date')}: {e.get('symptoms', 'No symptoms')} (Severity: {e.get('severity', 'unknown')}){' - Note: ' + e.get('notes', '') if e.get('notes') else ''}"
            for e in request_data.entries[-20:]  # Last 20 entries
        ])
        
        family_history = ", ".join(request_data.familyHistory) if request_data.familyHistory else "None provided"
        
        prompt = f"""You are a health insights AI assistant for a personal health diary app. Analyze the following health diary entries and provide helpful insights.

HEALTH DIARY ENTRIES (most recent):
{entries_text}

FAMILY HEALTH HISTORY: {family_history}

Please provide:
1. **Key Insights** (2-4 observations about their health patterns)
2. **Patterns Detected** (recurring symptoms, timing patterns, severity trends)
3. **Recommendations** (actionable health tips, when to see a doctor)
4. **Overall Risk Assessment** (low, moderate, high - based on symptoms and patterns)

IMPORTANT: 
- Be supportive and empathetic
- Do not diagnose specific conditions
- Always recommend consulting healthcare providers for serious concerns
- Focus on actionable wellness advice

Format your response as JSON with keys: insights (array), patterns (array), recommendations (array), riskLevel (string)"""

        response = gemini_service.model.generate_content(prompt)
        
        # Parse response
        try:
            import json
            # Try to extract JSON from response
            response_text = response.text
            # Find JSON in response
            start = response_text.find('{')
            end = response_text.rfind('}') + 1
            if start >= 0 and end > start:
                analysis = json.loads(response_text[start:end])
            else:
                analysis = {
                    "insights": [response_text[:500]],
                    "patterns": [],
                    "recommendations": ["Continue tracking your symptoms regularly."],
                    "riskLevel": "unknown"
                }
        except json.JSONDecodeError:
            analysis = {
                "insights": [response.text[:500] if response.text else "Unable to analyze entries."],
                "patterns": [],
                "recommendations": ["Continue tracking your symptoms regularly."],
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
    current_user: dict = Depends(get_current_user)
):
    """
    Quick analysis of a specific symptom
    Returns possible causes and recommendations
    """
    
    if not gemini_service.model:
        return {
            "success": True,
            "data": {
                "possibleCauses": ["Unable to analyze - AI service unavailable"],
                "urgency": "unknown",
                "selfCare": ["Rest and monitor your symptoms"],
                "seekHelp": False,
                "seekHelpReason": None
            },
            "timestamp": datetime.utcnow().isoformat()
        }
    
    try:
        prompt = f"""You are a health assistant. A user logged the following symptom in their health diary:

SYMPTOM: {request_data.symptoms}
SEVERITY: {request_data.severity}
ADDITIONAL NOTES: {request_data.notes or 'None'}

Provide a brief, helpful response with:
1. **Possible Causes** (2-3 common, non-alarming possibilities)
2. **Urgency Level** (low, moderate, high)
3. **Self-Care Tips** (2-3 practical suggestions)
4. **Seek Medical Help** (true/false - should they see a doctor soon?)
5. **Seek Help Reason** (if true, brief explanation why)

IMPORTANT: Be reassuring but responsible. Don't diagnose. Recommend professional help for concerning symptoms.

Format as JSON with keys: possibleCauses (array), urgency (string), selfCare (array), seekHelp (boolean), seekHelpReason (string or null)"""

        response = gemini_service.model.generate_content(prompt)
        
        try:
            import json
            response_text = response.text
            start = response_text.find('{')
            end = response_text.rfind('}') + 1
            if start >= 0 and end > start:
                analysis = json.loads(response_text[start:end])
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
