"""
Authentication Routes - Patient Signup & Login
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from datetime import timedelta, datetime
import random
import string

from app.core.auth import AuthService, get_current_user
from app.core.config import settings

router = APIRouter()

# In-memory storage for verification codes (use Redis in production)
verification_codes = {}

class LoginRequest(BaseModel):
    email: str
    password: str

class LoginResponse(BaseModel):
    success: bool
    token: str
    user: dict

class SendVerificationRequest(BaseModel):
    phoneNumber: str

class VerifyPhoneRequest(BaseModel):
    phoneNumber: str
    code: str

class SignUpRequest(BaseModel):
    phoneNumber: str
    accountNumber: str
    name: str
    dateOfBirth: str

class SignUpResponse(BaseModel):
    success: bool
    token: str
    user: dict

@router.post("/login", response_model=LoginResponse)
async def login(credentials: LoginRequest):
    """Authenticate user and return JWT token"""
    
    # Demo validation
    if credentials.email == "demo@avelohealth.com" and credentials.password == "demo123":
        user_data = {
            "id": "user_001",
            "email": credentials.email,
            "name": "Sarah Johnson",
            "dateOfBirth": "1985-06-15",
            "phoneNumber": "(555) 123-4567",
            "accountNumber": "AVL123456789",
            "role": "patient",
            "permissions": [
                "view:own-data",
                "edit:own-data",
                "view:dashboard"
            ]
        }
        
        token_data = {
            "sub": user_data["id"],
            "email": user_data["email"],
            "name": user_data["name"],
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

@router.post("/send-verification")
async def send_verification_code(request: SendVerificationRequest):
    """Send phone verification code"""
    
    # Generate 6-digit code
    code = ''.join(random.choices(string.digits, k=6))
    
    # Store code (expires in 10 minutes)
    phone_clean = request.phoneNumber.replace(" ", "").replace("-", "").replace("(", "").replace(")", "")
    verification_codes[phone_clean] = {
        "code": code,
        "expires": datetime.utcnow().timestamp() + 600  # 10 minutes
    }
    
    # In production, send SMS via Twilio/similar
    print(f"📱 Verification code for {phone_clean}: {code}")
    
    return {
        "success": True,
        "message": "Verification code sent",
        # Include code in dev mode for testing
        "debug_code": code if settings.DEBUG else None
    }

@router.post("/verify-phone")
async def verify_phone(request: VerifyPhoneRequest):
    """Verify phone number with code"""
    
    phone_clean = request.phoneNumber.replace(" ", "").replace("-", "").replace("(", "").replace(")", "")
    
    stored = verification_codes.get(phone_clean)
    
    if not stored:
        raise HTTPException(status_code=400, detail="No verification code found. Please request a new code.")
    
    if datetime.utcnow().timestamp() > stored["expires"]:
        del verification_codes[phone_clean]
        raise HTTPException(status_code=400, detail="Verification code expired. Please request a new code.")
    
    if stored["code"] != request.code:
        raise HTTPException(status_code=400, detail="Invalid verification code")
    
    # Clean up
    del verification_codes[phone_clean]
    
    return {
        "success": True,
        "message": "Phone number verified"
    }

@router.post("/signup", response_model=SignUpResponse)
async def signup(request: SignUpRequest):
    """Register new patient account"""
    
    # Validate account number (no spaces, max 15 chars)
    if " " in request.accountNumber or len(request.accountNumber) > 15:
        raise HTTPException(status_code=400, detail="Invalid account number format")
    
    # Create user (in production, save to database)
    user_id = f"user_{abs(hash(request.phoneNumber))}"
    
    user_data = {
        "id": user_id,
        "name": request.name,
        "dateOfBirth": request.dateOfBirth,
        "phoneNumber": request.phoneNumber,
        "accountNumber": request.accountNumber,
        "role": "patient",
        "permissions": [
            "view:own-data",
            "edit:own-data",
            "view:dashboard"
        ],
        "createdAt": datetime.utcnow().isoformat()
    }
    
    token_data = {
        "sub": user_data["id"],
        "name": user_data["name"],
        "role": user_data["role"],
        "permissions": user_data["permissions"]
    }
    
    token = AuthService.create_access_token(
        data=token_data,
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    return SignUpResponse(
        success=True,
        token=token,
        user=user_data
    )

@router.get("/me")
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """Get current authenticated user information"""
    return current_user
