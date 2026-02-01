"""
Appointment Routes
Full CRUD + Teli AI Integration for Cancel/Reschedule
"""

from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, date, time
from enum import Enum

from app.core.auth import get_current_user, require_permission
from app.core.hipaa import HIPAACompliance
from app.db.snowflake_client import SnowflakeClient
from app.services.teli_service import TeliAIService

router = APIRouter()
teli_service = TeliAIService()

# ============ ENUMS ============

class AppointmentStatus(str, Enum):
    UPCOMING = "upcoming"
    DONE = "done"
    CANCELLED = "cancelled"
    CANCELLATION_IN_PROGRESS = "cancellation_in_progress"
    CANCELLATION_FAILED = "cancellation_failed"
    RESCHEDULING_IN_PROGRESS = "rescheduling_in_progress"
    RESCHEDULING_FAILED = "rescheduling_failed"
    RESCHEDULED = "rescheduled"

class ActionType(str, Enum):
    CANCEL = "cancel"
    RESCHEDULE = "reschedule"

# ============ REQUEST MODELS ============

class AppointmentCreate(BaseModel):
    providerId: str
    title: str
    appointmentDate: str  # YYYY-MM-DD
    appointmentTime: str  # HH:MM
    location: Optional[str] = None
    reminderEnabled: bool = True
    notes: Optional[str] = None

class AppointmentUpdate(BaseModel):
    title: Optional[str] = None
    appointmentDate: Optional[str] = None
    appointmentTime: Optional[str] = None
    location: Optional[str] = None
    reminderEnabled: Optional[bool] = None
    notes: Optional[str] = None

class CancelAppointmentRequest(BaseModel):
    reason: Optional[str] = None
    preferredCallHour: int = Field(ge=0, le=23, default=10)  # 0-23 hour to call

class RescheduleAppointmentRequest(BaseModel):
    newDate: str  # YYYY-MM-DD
    newTime: str  # HH:MM
    reason: Optional[str] = None
    preferredCallHour: int = Field(ge=0, le=23, default=10)

class ReminderToggleRequest(BaseModel):
    enabled: bool

# ============ RESPONSE MODELS ============

class AppointmentResponse(BaseModel):
    id: str
    title: str
    providerName: str
    providerPhone: str
    location: Optional[str]
    date: str
    time: str
    status: str
    previousStatus: Optional[str]
    reminderEnabled: bool
    canUndo: bool

# ============ HELPER FUNCTIONS ============

def format_appointment_response(apt: dict) -> dict:
    """Transform DB record to API response format"""
    return {
        "id": apt.get("APPOINTMENT_ID") or apt.get("appointment_id"),
        "title": apt.get("TITLE") or apt.get("title"),
        "providerName": apt.get("PROVIDER_NAME") or apt.get("provider_name"),
        "providerPhone": apt.get("PROVIDER_PHONE") or apt.get("provider_phone"),
        "providerSpecialty": apt.get("SPECIALTY") or apt.get("specialty"),
        "location": apt.get("LOCATION") or apt.get("location"),
        "date": str(apt.get("APPOINTMENT_DATE") or apt.get("appointment_date")),
        "time": str(apt.get("APPOINTMENT_TIME") or apt.get("appointment_time")),
        "status": apt.get("STATUS") or apt.get("status"),
        "previousStatus": apt.get("PREVIOUS_STATUS") or apt.get("previous_status"),
        "reminderEnabled": apt.get("REMINDER_ENABLED") or apt.get("reminder_enabled", True),
        "canUndo": (apt.get("STATUS") or apt.get("status")) in [
            "cancellation_in_progress", "rescheduling_in_progress",
            "cancellation_failed", "rescheduling_failed"
        ],
        "notes": apt.get("NOTES") or apt.get("notes"),
        "createdAt": str(apt.get("CREATED_AT") or apt.get("created_at", "")),
    }

# ============ ROUTES ============

@router.get("/stats")
async def get_appointment_stats(
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """Get appointment statistics"""
    
    snowflake: SnowflakeClient = request.app.state.snowflake
    user_id = current_user.get("sub")
    
    try:
        stats = await snowflake.get_appointment_stats(user_id=user_id)
        
        return {
            "success": True,
            "data": stats,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        print(f"Appointment stats error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch appointment stats")

@router.get("/dashboard")
async def get_dashboard_stats(
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """Get comprehensive dashboard statistics"""
    
    snowflake: SnowflakeClient = request.app.state.snowflake
    
    try:
        dashboard_data = await snowflake.get_comprehensive_dashboard_stats()
        
        return {
            "success": True,
            "data": dashboard_data,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        print(f"Dashboard stats error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch dashboard stats")


# ============ APPOINTMENT CRUD ============

@router.get("")
async def list_appointments(
    request: Request,
    status: Optional[str] = None,
    limit: int = 50,
    current_user: dict = Depends(get_current_user)
):
    """
    List all appointments for the current user
    Optional filter by status: upcoming, done, cancelled, etc.
    """
    
    snowflake: SnowflakeClient = request.app.state.snowflake
    user_id = current_user.get("sub")
    
    try:
        appointments = await snowflake.get_appointments_by_user(
            user_id=user_id,
            status=status,
            limit=limit
        )
        
        formatted = [format_appointment_response(apt) for apt in appointments]
        
        return {
            "success": True,
            "data": formatted,
            "count": len(formatted),
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        print(f"List appointments error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch appointments")


@router.get("/{appointment_id}")
async def get_appointment(
    appointment_id: str,
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """Get a single appointment by ID"""
    
    snowflake: SnowflakeClient = request.app.state.snowflake
    user_id = current_user.get("sub")
    
    try:
        appointment = await snowflake.get_appointment_by_id(appointment_id)
        
        if not appointment:
            raise HTTPException(status_code=404, detail="Appointment not found")
        
        # Verify ownership
        apt_user_id = appointment.get("USER_ID") or appointment.get("user_id")
        if apt_user_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to view this appointment")
        
        return {
            "success": True,
            "data": format_appointment_response(appointment),
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Get appointment error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch appointment")


@router.post("")
async def create_appointment(
    appointment_data: AppointmentCreate,
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """Create a new appointment"""
    
    snowflake: SnowflakeClient = request.app.state.snowflake
    user_id = current_user.get("sub")
    
    try:
        # Verify provider exists
        provider = await snowflake.get_provider_by_id(appointment_data.providerId)
        if not provider:
            raise HTTPException(status_code=404, detail="Provider not found")
        
        # Create appointment
        result = await snowflake.create_appointment({
            "user_id": user_id,
            "provider_id": appointment_data.providerId,
            "title": appointment_data.title,
            "appointment_date": appointment_data.appointmentDate,
            "appointment_time": appointment_data.appointmentTime,
            "location": appointment_data.location or provider.get("LOCATION") or provider.get("location"),
            "status": "upcoming",
            "reminder_enabled": appointment_data.reminderEnabled,
            "notes": appointment_data.notes
        })
        
        # Fetch the created appointment with provider details
        created = await snowflake.get_appointment_by_id(result["appointment_id"])
        
        # Log audit
        await snowflake.log_audit({
            "user_id": user_id,
            "action": "CREATE",
            "resource_type": "appointment",
            "resource_id": result["appointment_id"],
            "details": {"provider_id": appointment_data.providerId}
        })
        
        return {
            "success": True,
            "data": format_appointment_response(created) if created else result,
            "message": "Appointment created successfully",
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Create appointment error: {e}")
        raise HTTPException(status_code=500, detail="Failed to create appointment")


@router.put("/{appointment_id}")
async def update_appointment(
    appointment_id: str,
    update_data: AppointmentUpdate,
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """Update an existing appointment"""
    
    snowflake: SnowflakeClient = request.app.state.snowflake
    user_id = current_user.get("sub")
    
    try:
        # Verify appointment exists and user owns it
        appointment = await snowflake.get_appointment_by_id(appointment_id)
        if not appointment:
            raise HTTPException(status_code=404, detail="Appointment not found")
        
        apt_user_id = appointment.get("USER_ID") or appointment.get("user_id")
        if apt_user_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to update this appointment")
        
        # Build update data (only include non-None fields)
        updates = {}
        if update_data.title is not None:
            updates["title"] = update_data.title
        if update_data.appointmentDate is not None:
            updates["appointment_date"] = update_data.appointmentDate
        if update_data.appointmentTime is not None:
            updates["appointment_time"] = update_data.appointmentTime
        if update_data.location is not None:
            updates["location"] = update_data.location
        if update_data.reminderEnabled is not None:
            updates["reminder_enabled"] = update_data.reminderEnabled
        if update_data.notes is not None:
            updates["notes"] = update_data.notes
        
        if updates:
            await snowflake.update_appointment(appointment_id, updates)
        
        # Fetch updated appointment
        updated = await snowflake.get_appointment_by_id(appointment_id)
        
        return {
            "success": True,
            "data": format_appointment_response(updated),
            "message": "Appointment updated successfully",
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Update appointment error: {e}")
        raise HTTPException(status_code=500, detail="Failed to update appointment")


@router.delete("/{appointment_id}")
async def delete_appointment(
    appointment_id: str,
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """Delete an appointment"""
    
    snowflake: SnowflakeClient = request.app.state.snowflake
    user_id = current_user.get("sub")
    
    try:
        # Verify appointment exists and user owns it
        appointment = await snowflake.get_appointment_by_id(appointment_id)
        if not appointment:
            raise HTTPException(status_code=404, detail="Appointment not found")
        
        apt_user_id = appointment.get("USER_ID") or appointment.get("user_id")
        if apt_user_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to delete this appointment")
        
        await snowflake.delete_appointment(appointment_id)
        
        # Log audit
        await snowflake.log_audit({
            "user_id": user_id,
            "action": "DELETE",
            "resource_type": "appointment",
            "resource_id": appointment_id
        })
        
        return {
            "success": True,
            "message": "Appointment deleted successfully",
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Delete appointment error: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete appointment")


# ============ TELI AI INTEGRATION - CANCEL ============

@router.post("/{appointment_id}/cancel")
async def cancel_appointment(
    appointment_id: str,
    cancel_data: CancelAppointmentRequest,
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """
    Initiate appointment cancellation via Teli AI
    Teli AI will call the provider to cancel on behalf of the patient
    """
    
    snowflake: SnowflakeClient = request.app.state.snowflake
    user_id = current_user.get("sub")
    
    try:
        # Get appointment with provider details
        appointment = await snowflake.get_appointment_by_id(appointment_id)
        if not appointment:
            raise HTTPException(status_code=404, detail="Appointment not found")
        
        apt_user_id = appointment.get("USER_ID") or appointment.get("user_id")
        if apt_user_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized")
        
        current_status = appointment.get("STATUS") or appointment.get("status")
        if current_status != "upcoming":
            raise HTTPException(status_code=400, detail="Can only cancel upcoming appointments")
        
        # Update appointment status
        await snowflake.update_appointment(appointment_id, {
            "status": "cancellation_in_progress",
            "previous_status": current_status
        })
        
        # Create action record
        action = await snowflake.create_appointment_action({
            "appointment_id": appointment_id,
            "action_type": "cancel",
            "status": "pending",
            "reason": cancel_data.reason,
            "preferred_call_hour": cancel_data.preferredCallHour
        })
        
        # Get provider phone
        provider_phone = appointment.get("PROVIDER_PHONE") or appointment.get("provider_phone")
        provider_name = appointment.get("PROVIDER_NAME") or appointment.get("provider_name")
        apt_date = appointment.get("APPOINTMENT_DATE") or appointment.get("appointment_date")
        apt_time = appointment.get("APPOINTMENT_TIME") or appointment.get("appointment_time")
        
        # Build cancellation script for Teli AI
        script = f"""
        Hello, I'm calling on behalf of a patient to cancel an appointment.
        
        Patient details are on file with your office.
        The appointment is scheduled for {apt_date} at {apt_time}.
        
        Could you please confirm the cancellation?
        
        If asked for reason: {cancel_data.reason or 'Personal scheduling conflict'}
        
        Thank you for your assistance.
        """
        
        # Create Teli call record
        teli_call = await snowflake.create_teli_call({
            "action_id": action["action_id"],
            "user_id": user_id,
            "provider_id": appointment.get("PROVIDER_ID") or appointment.get("provider_id"),
            "call_type": "appointment_cancel",
            "phone_number_called": provider_phone,
            "status": "pending"
        })
        
        # Initiate Teli AI call (schedule for preferred hour)
        call_result = await teli_service.initiate_call(
            patient_data={
                "id": user_id,
                "phone": provider_phone,
                "appointment_id": appointment_id
            },
            call_type="appointment_cancel",
            script=script
        )
        
        # Update call with Teli response
        if call_result.get("call_id"):
            await snowflake.update_teli_call(teli_call["call_id"], {
                "status": "in_progress",
                "started_at": datetime.utcnow().isoformat()
            })
        
        # Log audit
        await snowflake.log_audit({
            "user_id": user_id,
            "action": "CANCEL_INITIATED",
            "resource_type": "appointment",
            "resource_id": appointment_id,
            "details": {
                "action_id": action["action_id"],
                "teli_call_id": teli_call["call_id"]
            }
        })
        
        return {
            "success": True,
            "data": {
                "appointmentId": appointment_id,
                "actionId": action["action_id"],
                "teliCallId": teli_call["call_id"],
                "status": "cancellation_in_progress",
                "message": f"Teli AI is calling {provider_name} to cancel your appointment"
            },
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Cancel appointment error: {e}")
        raise HTTPException(status_code=500, detail="Failed to initiate cancellation")


# ============ TELI AI INTEGRATION - RESCHEDULE ============

@router.post("/{appointment_id}/reschedule")
async def reschedule_appointment(
    appointment_id: str,
    reschedule_data: RescheduleAppointmentRequest,
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """
    Initiate appointment reschedule via Teli AI
    Teli AI will call the provider to reschedule on behalf of the patient
    """
    
    snowflake: SnowflakeClient = request.app.state.snowflake
    user_id = current_user.get("sub")
    
    try:
        # Get appointment
        appointment = await snowflake.get_appointment_by_id(appointment_id)
        if not appointment:
            raise HTTPException(status_code=404, detail="Appointment not found")
        
        apt_user_id = appointment.get("USER_ID") or appointment.get("user_id")
        if apt_user_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized")
        
        current_status = appointment.get("STATUS") or appointment.get("status")
        if current_status not in ["upcoming", "rescheduling_failed"]:
            raise HTTPException(status_code=400, detail="Cannot reschedule this appointment")
        
        # Update appointment status
        await snowflake.update_appointment(appointment_id, {
            "status": "rescheduling_in_progress",
            "previous_status": current_status
        })
        
        # Create action record
        action = await snowflake.create_appointment_action({
            "appointment_id": appointment_id,
            "action_type": "reschedule",
            "status": "pending",
            "requested_new_date": reschedule_data.newDate,
            "requested_new_time": reschedule_data.newTime,
            "reason": reschedule_data.reason,
            "preferred_call_hour": reschedule_data.preferredCallHour
        })
        
        # Get provider details
        provider_phone = appointment.get("PROVIDER_PHONE") or appointment.get("provider_phone")
        provider_name = appointment.get("PROVIDER_NAME") or appointment.get("provider_name")
        old_date = appointment.get("APPOINTMENT_DATE") or appointment.get("appointment_date")
        old_time = appointment.get("APPOINTMENT_TIME") or appointment.get("appointment_time")
        
        # Build reschedule script for Teli AI
        script = f"""
        Hello, I'm calling on behalf of a patient to reschedule an appointment.
        
        Patient details are on file with your office.
        The current appointment is scheduled for {old_date} at {old_time}.
        
        The patient would like to reschedule to {reschedule_data.newDate} at {reschedule_data.newTime}.
        
        Is that time available? If not, what times are available on that date or nearby dates?
        
        If asked for reason: {reschedule_data.reason or 'Scheduling conflict'}
        
        Thank you for your assistance.
        """
        
        # Create Teli call record
        teli_call = await snowflake.create_teli_call({
            "action_id": action["action_id"],
            "user_id": user_id,
            "provider_id": appointment.get("PROVIDER_ID") or appointment.get("provider_id"),
            "call_type": "appointment_reschedule",
            "phone_number_called": provider_phone,
            "status": "pending"
        })
        
        # Initiate Teli AI call
        call_result = await teli_service.initiate_call(
            patient_data={
                "id": user_id,
                "phone": provider_phone,
                "appointment_id": appointment_id
            },
            call_type="appointment_reschedule",
            script=script
        )
        
        # Update call status
        if call_result.get("call_id"):
            await snowflake.update_teli_call(teli_call["call_id"], {
                "status": "in_progress",
                "started_at": datetime.utcnow().isoformat()
            })
        
        # Log audit
        await snowflake.log_audit({
            "user_id": user_id,
            "action": "RESCHEDULE_INITIATED",
            "resource_type": "appointment",
            "resource_id": appointment_id,
            "details": {
                "action_id": action["action_id"],
                "new_date": reschedule_data.newDate,
                "new_time": reschedule_data.newTime
            }
        })
        
        return {
            "success": True,
            "data": {
                "appointmentId": appointment_id,
                "actionId": action["action_id"],
                "teliCallId": teli_call["call_id"],
                "status": "rescheduling_in_progress",
                "requestedDate": reschedule_data.newDate,
                "requestedTime": reschedule_data.newTime,
                "message": f"Teli AI is calling {provider_name} to reschedule your appointment"
            },
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Reschedule appointment error: {e}")
        raise HTTPException(status_code=500, detail="Failed to initiate reschedule")


# ============ UNDO ACTION ============

@router.post("/{appointment_id}/undo")
async def undo_appointment_action(
    appointment_id: str,
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """
    Undo a cancel/reschedule action if it hasn't completed yet
    Reverts appointment to previous status
    """
    
    snowflake: SnowflakeClient = request.app.state.snowflake
    user_id = current_user.get("sub")
    
    try:
        # Get appointment
        appointment = await snowflake.get_appointment_by_id(appointment_id)
        if not appointment:
            raise HTTPException(status_code=404, detail="Appointment not found")
        
        apt_user_id = appointment.get("USER_ID") or appointment.get("user_id")
        if apt_user_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized")
        
        current_status = appointment.get("STATUS") or appointment.get("status")
        previous_status = appointment.get("PREVIOUS_STATUS") or appointment.get("previous_status")
        
        # Only allow undo for in-progress or failed actions
        undoable_statuses = [
            "cancellation_in_progress", "cancellation_failed",
            "rescheduling_in_progress", "rescheduling_failed"
        ]
        
        if current_status not in undoable_statuses:
            raise HTTPException(status_code=400, detail="Cannot undo this action")
        
        # Revert to previous status
        await snowflake.update_appointment(appointment_id, {
            "status": previous_status or "upcoming",
            "previous_status": None
        })
        
        # Log audit
        await snowflake.log_audit({
            "user_id": user_id,
            "action": "UNDO_ACTION",
            "resource_type": "appointment",
            "resource_id": appointment_id,
            "details": {"reverted_from": current_status, "reverted_to": previous_status or "upcoming"}
        })
        
        return {
            "success": True,
            "data": {
                "appointmentId": appointment_id,
                "status": previous_status or "upcoming",
                "message": "Action undone successfully"
            },
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Undo action error: {e}")
        raise HTTPException(status_code=500, detail="Failed to undo action")


# ============ TOGGLE REMINDER ============

@router.patch("/{appointment_id}/reminder")
async def toggle_appointment_reminder(
    appointment_id: str,
    reminder_data: ReminderToggleRequest,
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """Toggle reminder on/off for an appointment"""
    
    snowflake: SnowflakeClient = request.app.state.snowflake
    user_id = current_user.get("sub")
    
    try:
        # Get appointment
        appointment = await snowflake.get_appointment_by_id(appointment_id)
        if not appointment:
            raise HTTPException(status_code=404, detail="Appointment not found")
        
        apt_user_id = appointment.get("USER_ID") or appointment.get("user_id")
        if apt_user_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized")
        
        # Update reminder setting
        await snowflake.update_appointment(appointment_id, {
            "reminder_enabled": reminder_data.enabled
        })
        
        return {
            "success": True,
            "data": {
                "appointmentId": appointment_id,
                "reminderEnabled": reminder_data.enabled
            },
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Toggle reminder error: {e}")
        raise HTTPException(status_code=500, detail="Failed to toggle reminder")


# ============ GET NEXT APPOINTMENT ============

@router.get("/next/upcoming")
async def get_next_appointment(
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """Get the user's next upcoming appointment"""
    
    snowflake: SnowflakeClient = request.app.state.snowflake
    user_id = current_user.get("sub")
    
    try:
        # Get upcoming appointments sorted by date
        appointments = await snowflake.get_appointments_by_user(
            user_id=user_id,
            status="upcoming",
            limit=1
        )
        
        if not appointments:
            return {
                "success": True,
                "data": None,
                "message": "No upcoming appointments",
                "timestamp": datetime.utcnow().isoformat()
            }
        
        return {
            "success": True,
            "data": format_appointment_response(appointments[0]),
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        print(f"Get next appointment error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch next appointment")
