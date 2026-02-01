"""
Dashboard Routes
Patient health diary dashboard data
"""

from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta
import random

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

# Mock data generation for demo
def generate_mock_entries() -> List[dict]:
    """Generate realistic mock diary entries"""
    
    symptoms_by_category = {
        "General": ["Headache, fatigue", "Fatigue and weakness", "General malaise", "Low energy"],
        "Respiratory": ["Mild cough", "Shortness of breath", "Nasal congestion", "Sore throat"],
        "Musculoskeletal": ["Back pain", "Joint stiffness", "Muscle aches", "Neck pain"],
        "Digestive": ["Stomach discomfort", "Nausea", "Acid reflux", "Bloating"],
        "Neurological": ["Dizziness", "Migraine", "Tension headache", "Light sensitivity"],
        "Cardiovascular": ["Chest tightness", "Palpitations", "Elevated heart rate"],
        "Dermatological": ["Skin rash", "Itching", "Dry skin patches"],
    }
    
    entries = []
    today = datetime.utcnow()
    
    # Generate entries over the past 90 days
    for i in range(45):
        days_ago = random.randint(0, 90)
        entry_date = today - timedelta(days=days_ago)
        
        category = random.choice(list(symptoms_by_category.keys()))
        symptoms = random.choice(symptoms_by_category[category])
        severity = random.choices(
            ["high", "medium", "low"],
            weights=[0.2, 0.4, 0.4],  # More medium/low than high
            k=1
        )[0]
        
        entries.append({
            "id": f"entry_{i+1}",
            "date": entry_date.isoformat(),
            "symptoms": symptoms,
            "severity": severity,
            "category": category,
            "notes": None
        })
    
    # Sort by date descending
    entries.sort(key=lambda x: x["date"], reverse=True)
    return entries

@router.get("/", response_model=DashboardResponse)
async def get_dashboard(current_user: dict = Depends(get_current_user)):
    """Get dashboard data for authenticated user"""
    
    # Generate mock entries
    entries = generate_mock_entries()
    
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
    
    # User profile (from token or database)
    user_profile = {
        "id": current_user.get("sub", "user_001"),
        "name": current_user.get("name", "Sarah Johnson"),
        "dateOfBirth": "1985-06-15",
        "phoneNumber": "(555) 123-4567",
        "accountNumber": "AVL123456789"
    }
    
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
    severity: Optional[str] = None,
    category: Optional[str] = None,
    startDate: Optional[str] = None,
    endDate: Optional[str] = None,
    sortBy: str = "newest",
    current_user: dict = Depends(get_current_user)
):
    """Get filtered diary entries"""
    
    entries = generate_mock_entries()
    
    # Apply filters
    if severity and severity != "all":
        entries = [e for e in entries if e["severity"] == severity]
    
    if category and category != "all":
        entries = [e for e in entries if e["category"] == category]
    
    if startDate:
        entries = [e for e in entries if e["date"] >= startDate]
    
    if endDate:
        entries = [e for e in entries if e["date"] <= endDate]
    
    # Sort
    entries.sort(
        key=lambda x: x["date"],
        reverse=(sortBy == "newest")
    )
    
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
    current_user: dict = Depends(get_current_user)
):
    """Create a new diary entry"""
    
    # Validate severity
    if entry.severity not in ["high", "medium", "low"]:
        raise HTTPException(status_code=400, detail="Invalid severity. Must be high, medium, or low")
    
    # In production, save to database
    new_entry = {
        "id": f"entry_{datetime.utcnow().timestamp()}",
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
