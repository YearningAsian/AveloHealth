"""
Knowledge Base Routes
Create and manage Teli AI knowledge bases with Snowflake data
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, Dict, Any, List

from app.core.auth import get_current_user
from app.services.knowledge_base_service import knowledge_base_service

router = APIRouter()


# ==================== Request Models ====================

class CreateKnowledgeBaseRequest(BaseModel):
    name: str
    query: str
    titleColumn: str
    textColumn: str
    autoRefresh: Optional[bool] = False

class KnowledgeBaseStatusRequest(BaseModel):
    knowledgeBaseId: str


# ==================== Knowledge Base Endpoints ====================

@router.post("/create-from-snowflake")
async def create_knowledge_base_from_snowflake(
    request_data: CreateKnowledgeBaseRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Create a Teli knowledge base from custom Snowflake query
    """
    try:
        result = await knowledge_base_service.create_knowledge_base_from_snowflake(
            kb_name=request_data.name,
            query=request_data.query,
            title_column=request_data.titleColumn,
            text_column=request_data.textColumn,
            auto_refresh=request_data.autoRefresh
        )
        
        return {
            "success": result.get("success", False),
            "data": result
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/create-patients")
async def create_patients_knowledge_base(
    current_user: dict = Depends(get_current_user)
):
    """
    Create a knowledge base with patient information from Snowflake
    """
    try:
        result = await knowledge_base_service.create_patient_kb()
        
        return {
            "success": result.get("success", False),
            "data": result
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/create-appointments")
async def create_appointments_knowledge_base(
    current_user: dict = Depends(get_current_user)
):
    """
    Create a knowledge base with appointment information from Snowflake
    """
    try:
        result = await knowledge_base_service.create_appointments_kb()
        
        return {
            "success": result.get("success", False),
            "data": result
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/create-health-entries")
async def create_health_entries_knowledge_base(
    current_user: dict = Depends(get_current_user)
):
    """
    Create a knowledge base with health entries from Snowflake
    """
    try:
        result = await knowledge_base_service.create_health_entries_kb()
        
        return {
            "success": result.get("success", False),
            "data": result
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/create-comprehensive")
async def create_comprehensive_knowledge_base(
    current_user: dict = Depends(get_current_user)
):
    """
    Create a comprehensive knowledge base with all patient data
    """
    try:
        result = await knowledge_base_service.create_comprehensive_kb()
        
        return {
            "success": result.get("success", False),
            "data": result
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/status")
async def get_knowledge_base_status(
    request_data: KnowledgeBaseStatusRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Check the status of a knowledge base
    """
    try:
        result = await knowledge_base_service.get_knowledge_base_status(
            kb_id=request_data.knowledgeBaseId
        )
        
        return {
            "success": result.get("success", False),
            "data": result
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/presets")
async def get_preset_queries():
    """
    Get preset Snowflake queries for common knowledge base scenarios
    """
    return {
        "success": True,
        "presets": [
            {
                "id": "patients",
                "name": "Patient Information",
                "description": "Basic patient demographics and contact info",
                "query": """
                SELECT 
                    CONCAT('Patient: ', first_name, ' ', last_name) as title,
                    CONCAT(
                        'Patient ID: ', patient_id, '\n',
                        'Name: ', first_name, ' ', last_name, '\n',
                        'Date of Birth: ', date_of_birth, '\n',
                        'Phone: ', phone, '\n',
                        'Email: ', email, '\n',
                        'Emergency Contact: ', emergency_contact_name, ' (', emergency_contact_phone, ')'
                    ) as patient_info
                FROM patients 
                WHERE patient_id IS NOT NULL 
                LIMIT 50;
                """,
                "titleColumn": "TITLE",
                "textColumn": "PATIENT_INFO"
            },
            {
                "id": "appointments",
                "name": "Appointment Data", 
                "description": "Recent appointments with provider and status",
                "query": """
                SELECT 
                    CONCAT('Appt: ', appointment_date, ' - ', patient_id) as title,
                    CONCAT(
                        'Appointment ID: ', appointment_id, '\n',
                        'Patient ID: ', patient_id, '\n',
                        'Date: ', appointment_date, '\n',
                        'Time: ', appointment_time, '\n',
                        'Provider: ', provider_name, '\n',
                        'Type: ', appointment_type, '\n',
                        'Status: ', status, '\n',
                        'Notes: ', COALESCE(notes, 'No notes')
                    ) as appointment_info
                FROM appointments 
                WHERE appointment_id IS NOT NULL 
                ORDER BY appointment_date DESC
                LIMIT 50;
                """,
                "titleColumn": "TITLE",
                "textColumn": "APPOINTMENT_INFO"
            },
            {
                "id": "health_entries",
                "name": "Health Records",
                "description": "Patient health metrics and vitals",
                "query": """
                SELECT 
                    CONCAT('Entry: ', entry_date, ' - ', patient_id) as title,
                    CONCAT(
                        'Entry ID: ', entry_id, '\n',
                        'Patient ID: ', patient_id, '\n',
                        'Date: ', entry_date, '\n',
                        'Blood Pressure: ', blood_pressure_systolic, '/', blood_pressure_diastolic, '\n',
                        'Heart Rate: ', heart_rate, ' bpm\n',
                        'Temperature: ', temperature, '°F\n',
                        'Weight: ', weight, ' lbs\n',
                        'Symptoms: ', COALESCE(symptoms, 'None reported'), '\n',
                        'Medications: ', COALESCE(medications, 'None listed')
                    ) as health_info
                FROM health_entries 
                WHERE entry_id IS NOT NULL 
                ORDER BY entry_date DESC
                LIMIT 50;
                """,
                "titleColumn": "TITLE", 
                "textColumn": "HEALTH_INFO"
            },
            {
                "id": "comprehensive",
                "name": "Complete Patient Profiles",
                "description": "Comprehensive patient data with appointments and health records",
                "query": """
                SELECT 
                    CONCAT('Patient Summary: ', p.first_name, ' ', p.last_name) as title,
                    CONCAT(
                        '=== PATIENT INFORMATION ===\n',
                        'Patient ID: ', p.patient_id, '\n',
                        'Name: ', p.first_name, ' ', p.last_name, '\n',
                        'Date of Birth: ', p.date_of_birth, '\n',
                        'Phone: ', p.phone, '\n',
                        'Email: ', p.email, '\n\n',
                        
                        '=== RECENT APPOINTMENTS ===\n',
                        CASE 
                            WHEN a.appointment_date IS NOT NULL THEN
                                CONCAT('Last Appointment: ', a.appointment_date, ' at ', a.appointment_time, '\n',
                                       'Provider: ', a.provider_name, '\n',
                                       'Status: ', a.status, '\n\n')
                            ELSE 'No recent appointments\n\n'
                        END,
                        
                        '=== LATEST HEALTH METRICS ===\n',
                        CASE 
                            WHEN h.entry_date IS NOT NULL THEN
                                CONCAT('Last Entry: ', h.entry_date, '\n',
                                       'Blood Pressure: ', h.blood_pressure_systolic, '/', h.blood_pressure_diastolic, '\n',
                                       'Heart Rate: ', h.heart_rate, ' bpm\n',
                                       'Symptoms: ', COALESCE(h.symptoms, 'None reported'))
                            ELSE 'No recent health entries'
                        END
                    ) as comprehensive_info
                FROM patients p
                LEFT JOIN appointments a ON p.patient_id = a.patient_id
                LEFT JOIN health_entries h ON p.patient_id = h.patient_id
                WHERE p.patient_id IS NOT NULL
                ORDER BY p.patient_id
                LIMIT 25;
                """,
                "titleColumn": "TITLE",
                "textColumn": "COMPREHENSIVE_INFO"
            }
        ]
    }


@router.get("/status-check")
async def check_knowledge_base_service():
    """
    Check if the knowledge base service is properly configured
    """
    from app.core.config import settings
    
    return {
        "success": True,
        "configured": bool(settings.TELI_API_KEY and settings.TELI_ORG_ID),
        "api_url": settings.TELI_API_URL,
        "organization_id": settings.TELI_ORG_ID,
        "user_id": settings.TELI_USER_ID,
        "snowflake_configured": bool(settings.SNOWFLAKE_USER and settings.SNOWFLAKE_DATABASE)
    }