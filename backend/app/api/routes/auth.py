"""
Authentication Routes
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from datetime import timedelta

from app.core.auth import AuthService, get_current_user
from app.core.config import settings

router = APIRouter()

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class LoginResponse(BaseModel):
    success: bool
    token: str
    user: dict

@router.post("/login", response_model=LoginResponse)
async def login(credentials: LoginRequest):
    """Authenticate user and return JWT token"""
    
    # TODO: Verify against Snowflake user database
    # This is a simplified example
    
    # Placeholder validation
    if credentials.email == "demo@avelohealth.com" and credentials.password == "demo123":
        user_data = {
            "id": "user_001",
            "email": credentials.email,
            "firstName": "Demo",
            "lastName": "User",
            "role": "care-coordinator",
            "permissions": [
                "view:patients",
                "edit:patients",
                "view:appointments",
                "edit:appointments",
                "view:ai-analysis",
                "trigger:ai-analysis",
                "view:teli-calls",
                "schedule:teli-calls"
            ]
        }
        
        token_data = {
            "sub": user_data["id"],
            "email": user_data["email"],
            "role": user_data["role"],
            "permissions": user_data["permissions"]
        }
        
        token = AuthService.create_access_token(
            data=token_data,
            expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        )
        
        return LoginResponse(
            success=True,
            token=token,
            user=user_data
        )
    else:
        raise HTTPException(status_code=401, detail="Invalid credentials")

@router.get("/me")
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """Get current authenticated user information"""
    return current_user
