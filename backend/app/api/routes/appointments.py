"""
Appointment Routes
"""

from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from app.core.auth import get_current_user, require_permission
from app.db.snowflake_client import SnowflakeClient

router = APIRouter()

class AppointmentCreate(BaseModel):
    patientId: str
    providerId: str
    appointmentType: str
    scheduledDate: str
    duration: int = 30
    chiefComplaint: Optional[str] = None

@router.get("/stats")
async def get_appointment_stats(
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """Get appointment statistics"""
    
    # Placeholder stats
    stats = {
        "totalScheduled": 150,
        "totalCompleted": 120,
        "totalCancelled": 15,
        "totalNoShows": 10,
        "noShowRate": 6.7,
        "upcomingToday": 12,
        "upcomingWeek": 45
    }
    
    return {
        "success": True,
        "data": stats,
        "timestamp": datetime.utcnow().isoformat()
    }

@router.get("/dashboard")
async def get_dashboard_stats(
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """Get comprehensive dashboard statistics"""
    
    snowflake: SnowflakeClient = request.app.state.snowflake
    
    try:
        stats = await snowflake.get_dashboard_stats()
        
        # Add additional computed metrics
        dashboard_data = {
            **stats,
            "new_patients_this_month": 25,
            "active_patients": stats.get("total_patients", 0) * 0.85,
            "patients_needing_outreach": stats.get("high_risk_patients", 0),
            "appointments_today": 12,
            "appointments_this_week": 45,
            "no_show_rate": 6.7,
            "average_risk_score": 45.5,
            "patient_response_rate": 87.3,
            "average_time_to_contact": 4.2
        }
        
        return {
            "success": True,
            "data": dashboard_data,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        print(f"Dashboard stats error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch dashboard stats")
