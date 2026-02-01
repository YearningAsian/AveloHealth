"""
Dashboard Routes
Patient health diary dashboard data
"""

from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta

from app.core.auth import get_current_user

router = APIRouter()

class DiaryEntry(BaseModel):
    id: str
    date: str
    symptoms: str
    severity: str  # high, medium, low
    category: str
    notes: Optional[str] = None

class UserProfile(BaseModel):
    id: str
    name: str
    dateOfBirth: str
    phoneNumber: str
    accountNumber: str

class DashboardStats(BaseModel):
    totalEntries: int
    entriesByCategory: List[dict]
    entriesBySeverity: List[dict]
    entriesOverTime: List[dict]

class DashboardResponse(BaseModel):
    user: UserProfile
    recentEntries: List[DiaryEntry]
    stats: DashboardStats

@router.get("/", response_model=DashboardResponse)
async def get_dashboard(request: Request, current_user: dict = Depends(get_current_user)):
    """Get dashboard data for authenticated user"""
    
    db = request.app.state.snowflake
    user_id = current_user.get("sub")
    
    # Get user profile from database
    user_result = await db.execute(
        "SELECT * FROM users WHERE user_id = %(user_id)s",
        {"user_id": user_id}
    )
    
    if user_result:
        user = user_result[0]
        user_profile = {
            "id": user.get('USER_ID'),
            "name": user.get('NAME', current_user.get("name", "Unknown")),
            "email": user.get('EMAIL', current_user.get("email", "")),
            "dateOfBirth": str(user.get('DATE_OF_BIRTH', '')),
            "phoneNumber": user.get('PHONE_NUMBER', ''),
            "accountNumber": user.get('ACCOUNT_NUMBER', '')
        }
    else:
        user_profile = {
            "id": user_id,
            "name": current_user.get("name", "Unknown"),
            "email": current_user.get("email", ""),
            "dateOfBirth": "",
            "phoneNumber": "",
            "accountNumber": ""
        }
    
    # Get diary entries from database
    entries_result = await db.execute("""
        SELECT entry_id, entry_date, symptoms, severity, category, notes
        FROM diary_entries 
        WHERE user_id = %(user_id)s
        ORDER BY entry_date DESC
        LIMIT 100
    """, {"user_id": user_id})
    
    entries = []
    for e in entries_result:
        entries.append({
            "id": e.get('ENTRY_ID'),
            "date": str(e.get('ENTRY_DATE', '')),
            "symptoms": e.get('SYMPTOMS', ''),
            "severity": e.get('SEVERITY', 'low'),
            "category": e.get('CATEGORY', 'General'),
            "notes": e.get('NOTES')
        })
    
    # Calculate statistics
    total_entries = len(entries)
    
    # Entries by category
    category_counts = {}
    for entry in entries:
        cat = entry["category"]
        category_counts[cat] = category_counts.get(cat, 0) + 1
    
    entries_by_category = [
        {"category": cat, "count": count}
        for cat, count in category_counts.items()
    ]
    
    # Entries by severity
    severity_counts = {"High": 0, "Medium": 0, "Low": 0}
    for entry in entries:
        sev = entry["severity"].capitalize()
        severity_counts[sev] = severity_counts.get(sev, 0) + 1
    
    entries_by_severity = [
        {"severity": sev, "count": count}
        for sev, count in severity_counts.items()
    ]
    
    # Entries over time (last 30 days)
    today = datetime.utcnow()
    entries_over_time = []
    for i in range(30, -1, -1):
        date = today - timedelta(days=i)
        date_str = date.strftime("%Y-%m-%d")
        
        day_entries = [e for e in entries if e["date"].startswith(date_str)]
        entries_over_time.append({
            "date": date_str,
            "count": len(day_entries),
            "highCount": len([e for e in day_entries if e["severity"] == "high"]),
            "mediumCount": len([e for e in day_entries if e["severity"] == "medium"]),
            "lowCount": len([e for e in day_entries if e["severity"] == "low"]),
        })
    
    return {
        "user": user_profile,
        "recentEntries": entries,
        "stats": {
            "totalEntries": total_entries,
            "entriesByCategory": entries_by_category,
            "entriesBySeverity": entries_by_severity,
            "entriesOverTime": entries_over_time
        }
    }

@router.get("/entries")
async def get_entries(
    request: Request,
    severity: Optional[str] = None,
    category: Optional[str] = None,
    startDate: Optional[str] = None,
    endDate: Optional[str] = None,
    sortBy: str = "newest",
    current_user: dict = Depends(get_current_user)
):
    """Get filtered diary entries"""
    
    db = request.app.state.snowflake
    user_id = current_user.get("sub")
    
    # Build query with filters
    query = "SELECT * FROM diary_entries WHERE user_id = %(user_id)s"
    params = {"user_id": user_id}
    
    if severity and severity != "all":
        query += " AND severity = %(severity)s"
        params["severity"] = severity
    
    if category and category != "all":
        query += " AND category = %(category)s"
        params["category"] = category
    
    if startDate:
        query += " AND entry_date >= %(start_date)s"
        params["start_date"] = startDate
    
    if endDate:
        query += " AND entry_date <= %(end_date)s"
        params["end_date"] = endDate
    
    # Sort
    if sortBy == "newest":
        query += " ORDER BY entry_date DESC"
    else:
        query += " ORDER BY entry_date ASC"
    
    query += " LIMIT 100"
    
    entries_result = await db.execute(query, params)
    
    entries = []
    for e in entries_result:
        entries.append({
            "id": e.get('ENTRY_ID'),
            "date": str(e.get('ENTRY_DATE', '')),
            "symptoms": e.get('SYMPTOMS', ''),
            "severity": e.get('SEVERITY', 'low'),
            "category": e.get('CATEGORY', 'General'),
            "notes": e.get('NOTES')
        })
    
    return {
        "success": True,
        "data": entries,
        "count": len(entries)
    }

class CreateEntryRequest(BaseModel):
    date: str
    symptoms: str
    severity: str
    category: str
    notes: Optional[str] = None

@router.post("/entries")
async def create_entry(
    entry: CreateEntryRequest,
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """Create a new diary entry"""
    
    db = request.app.state.snowflake
    user_id = current_user.get("sub")
    
    # Validate severity
    if entry.severity not in ["high", "medium", "low"]:
        raise HTTPException(status_code=400, detail="Invalid severity. Must be high, medium, or low")
    
    # Save to database
    import uuid
    entry_id = str(uuid.uuid4())
    
    await db.execute("""
        INSERT INTO diary_entries (entry_id, user_id, entry_date, symptoms, severity, category, notes)
        VALUES (%(entry_id)s, %(user_id)s, %(entry_date)s, %(symptoms)s, %(severity)s, %(category)s, %(notes)s)
    """, {
        "entry_id": entry_id,
        "user_id": user_id,
        "entry_date": entry.date,
        "symptoms": entry.symptoms,
        "severity": entry.severity,
        "category": entry.category,
        "notes": entry.notes
    })
    
    new_entry = {
        "id": entry_id,
        "date": entry.date,
        "symptoms": entry.symptoms,
        "severity": entry.severity,
        "category": entry.category,
        "notes": entry.notes,
        "createdAt": datetime.utcnow().isoformat()
    }
    
    return {
        "success": True,
        "data": new_entry,
        "message": "Entry created successfully"
    }

class UpdateProfileRequest(BaseModel):
    familyHistory: Optional[List[str]] = None
    profileImage: Optional[str] = None

@router.patch("/profile")
async def update_profile(
    profile: UpdateProfileRequest,
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """Update user profile (family history, profile image)"""
    
    db = request.app.state.snowflake
    user_id = current_user.get("sub")
    
    # For now, store in local user state (could add to users table as JSON columns later)
    # In production, you'd want to add columns like family_history JSON and profile_image_url to the users table
    
    update_fields = []
    params = {"user_id": user_id}
    
    # This is a simplified version - in production you'd update actual DB columns
    # For now we just return success since the frontend stores it in state
    
    return {
        "success": True,
        "message": "Profile updated successfully",
        "data": {
            "familyHistory": profile.familyHistory,
            "profileImage": profile.profileImage
        }
    }
