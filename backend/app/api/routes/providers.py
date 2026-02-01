"""
Provider Routes
Healthcare provider management
"""

from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

from app.core.auth import get_current_user
from app.db.snowflake_client import SnowflakeClient

router = APIRouter()

# ============ REQUEST MODELS ============

class ProviderCreate(BaseModel):
    name: str
    specialty: Optional[str] = None
    phoneNumber: str
    location: Optional[str] = None
    address: Optional[str] = None
    acceptsTeliCalls: bool = True

class ProviderUpdate(BaseModel):
    name: Optional[str] = None
    specialty: Optional[str] = None
    phoneNumber: Optional[str] = None
    location: Optional[str] = None
    address: Optional[str] = None
    acceptsTeliCalls: Optional[bool] = None

# ============ HELPER FUNCTIONS ============

def format_provider_response(provider: dict) -> dict:
    """Transform DB record to API response format"""
    return {
        "id": provider.get("PROVIDER_ID") or provider.get("provider_id"),
        "name": provider.get("NAME") or provider.get("name"),
        "specialty": provider.get("SPECIALTY") or provider.get("specialty"),
        "phoneNumber": provider.get("PHONE_NUMBER") or provider.get("phone_number"),
        "location": provider.get("LOCATION") or provider.get("location"),
        "address": provider.get("ADDRESS") or provider.get("address"),
        "acceptsTeliCalls": provider.get("ACCEPTS_TELI_CALLS") or provider.get("accepts_teli_calls", True),
        "createdAt": str(provider.get("CREATED_AT") or provider.get("created_at", "")),
    }

# ============ ROUTES ============

@router.get("")
async def list_providers(
    request: Request,
    specialty: Optional[str] = None,
    limit: int = 50,
    current_user: dict = Depends(get_current_user)
):
    """
    List all providers
    Optional filter by specialty
    """
    
    snowflake: SnowflakeClient = request.app.state.snowflake
    
    try:
        providers = await snowflake.get_providers(limit=limit)
        
        # Filter by specialty if provided
        if specialty:
            providers = [
                p for p in providers 
                if (p.get("SPECIALTY") or p.get("specialty", "")).lower() == specialty.lower()
            ]
        
        formatted = [format_provider_response(p) for p in providers]
        
        return {
            "success": True,
            "data": formatted,
            "count": len(formatted),
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        print(f"List providers error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch providers")


@router.get("/{provider_id}")
async def get_provider(
    provider_id: str,
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """Get a single provider by ID"""
    
    snowflake: SnowflakeClient = request.app.state.snowflake
    
    try:
        provider = await snowflake.get_provider_by_id(provider_id)
        
        if not provider:
            raise HTTPException(status_code=404, detail="Provider not found")
        
        return {
            "success": True,
            "data": format_provider_response(provider),
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Get provider error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch provider")


@router.post("")
async def create_provider(
    provider_data: ProviderCreate,
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """Create a new provider"""
    
    snowflake: SnowflakeClient = request.app.state.snowflake
    
    try:
        result = await snowflake.create_provider({
            "name": provider_data.name,
            "specialty": provider_data.specialty,
            "phone_number": provider_data.phoneNumber,
            "location": provider_data.location,
            "address": provider_data.address,
            "accepts_teli_calls": provider_data.acceptsTeliCalls
        })
        
        # Fetch the created provider
        created = await snowflake.get_provider_by_id(result["provider_id"])
        
        return {
            "success": True,
            "data": format_provider_response(created) if created else result,
            "message": "Provider created successfully",
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        print(f"Create provider error: {e}")
        raise HTTPException(status_code=500, detail="Failed to create provider")


@router.get("/search/by-name")
async def search_providers_by_name(
    request: Request,
    q: str,
    limit: int = 20,
    current_user: dict = Depends(get_current_user)
):
    """Search providers by name"""
    
    snowflake: SnowflakeClient = request.app.state.snowflake
    
    try:
        # Get all providers and filter (for simplicity, could be SQL LIKE query)
        providers = await snowflake.get_providers(limit=100)
        
        # Filter by name match (case-insensitive)
        search_lower = q.lower()
        matched = [
            p for p in providers
            if search_lower in (p.get("NAME") or p.get("name", "")).lower()
        ][:limit]
        
        formatted = [format_provider_response(p) for p in matched]
        
        return {
            "success": True,
            "data": formatted,
            "count": len(formatted),
            "query": q,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        print(f"Search providers error: {e}")
        raise HTTPException(status_code=500, detail="Failed to search providers")
