"""
Authentication Routes - Patient Signup & Login
With Twilio Verify for phone/email verification
"""

from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel
from typing import Optional
from datetime import timedelta, datetime
import bcrypt

from app.core.auth import AuthService, get_current_user
from app.core.config import settings
from app.services.twilio_verify_service import twilio_verify

router = APIRouter()

class LoginRequest(BaseModel):
    email: str  # Can be email or phone number
    password: str

class LoginResponse(BaseModel):
    success: bool
    token: str
    user: dict

class SendVerificationRequest(BaseModel):
    phoneNumber: Optional[str] = None
    email: Optional[str] = None
    channel: Optional[str] = "sms"  # "sms", "email", or "call"

class VerifyCodeRequest(BaseModel):
    phoneNumber: Optional[str] = None
    email: Optional[str] = None
    code: str

class SignUpRequest(BaseModel):
    phoneNumber: str = ""
    accountNumber: str
    name: str
    dateOfBirth: str
    password: str
    email: Optional[str] = None

class SignUpResponse(BaseModel):
    success: bool
    token: str
    user: dict

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def hash_password(password: str) -> str:
    """Hash a password"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

@router.post("/login", response_model=LoginResponse)
async def login(credentials: LoginRequest, request: Request):
    """Authenticate user and return JWT token"""
    
    db = request.app.state.snowflake
    
    # Try to find user by email or phone number
    user = await db.execute("""
        SELECT * FROM users 
        WHERE email = %(identifier)s OR phone_number = %(identifier)s
    """, {"identifier": credentials.email})
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    user = user[0]
    
    # Verify password
    if not verify_password(credentials.password, user.get('PASSWORD_HASH', '')):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Build user data response
    user_data = {
        "id": user.get('USER_ID'),
        "email": user.get('EMAIL'),
        "name": user.get('NAME'),
        "dateOfBirth": str(user.get('DATE_OF_BIRTH', '')),
        "phoneNumber": user.get('PHONE_NUMBER'),
        "accountNumber": user.get('ACCOUNT_NUMBER'),
        "role": user.get('ROLE', 'patient'),
        "permissions": [
            "view:own-data",
            "edit:own-data",
            "view:dashboard"
        ]
    }
    
    # Add admin permissions if role is admin/provider
    if user.get('ROLE') in ['admin', 'provider']:
        user_data["permissions"].extend([
            "view:all-patients",
            "view:analytics",
            "manage:appointments"
        ])
    
    token_data = {
        "sub": user_data["id"],
        "email": user_data.get("email"),
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

@router.post("/send-verification")
async def send_verification_code(request: SendVerificationRequest):
    """
    Send verification code via Twilio Verify
    Supports SMS, email, and voice call
    """
    
    if not request.phoneNumber and not request.email:
        raise HTTPException(
            status_code=400, 
            detail="Either phoneNumber or email is required"
        )
    
    try:
        if request.email and request.channel == "email":
            # Send email verification
            result = await twilio_verify.send_email_verification(request.email)
        elif request.phoneNumber:
            # Send SMS or voice verification
            if request.channel == "call":
                result = await twilio_verify.send_verification(
                    request.phoneNumber, "call"
                )
            else:
                result = await twilio_verify.send_phone_verification(request.phoneNumber)
        else:
            raise HTTPException(
                status_code=400,
                detail="Invalid verification request"
            )
        
        if not result.get("success"):
            raise HTTPException(
                status_code=400,
                detail=result.get("error", "Failed to send verification")
            )
        
        return {
            "success": True,
            "message": f"Verification code sent via {request.channel or 'sms'}",
            "channel": result.get("channel"),
            "debug_mode": result.get("debug_mode", False)
        }
        
    except Exception as e:
        print(f"Verification error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/verify-phone")
async def verify_phone(request: VerifyCodeRequest):
    """
    Verify phone number or email with code via Twilio Verify
    """
    
    if not request.phoneNumber and not request.email:
        raise HTTPException(
            status_code=400,
            detail="Either phoneNumber or email is required"
        )
    
    try:
        if request.email:
            result = await twilio_verify.verify_email(request.email, request.code)
        else:
            result = await twilio_verify.verify_phone(request.phoneNumber, request.code)
        
        if not result.get("success"):
            raise HTTPException(
                status_code=400,
                detail=result.get("error", "Invalid verification code")
            )
        
        return {
            "success": True,
            "message": "Verification successful",
            "status": result.get("status")
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Verification check error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/verify-email")
async def verify_email(request: VerifyCodeRequest):
    """
    Verify email address with code via Twilio Verify
    Alias endpoint for email verification
    """
    if not request.email:
        raise HTTPException(status_code=400, detail="Email is required")
    
    return await verify_phone(request)

@router.post("/signup", response_model=SignUpResponse)
async def signup(request: SignUpRequest, req: Request):
    """Register new patient account"""
    
    db = req.app.state.snowflake
    
    # Validate account number (no spaces, max 15 chars)
    if " " in request.accountNumber or len(request.accountNumber) > 15:
        raise HTTPException(status_code=400, detail="Invalid account number format")
    
    # Check if user already exists by phone or email
    if request.phoneNumber:
        existing = await db.execute(
            "SELECT user_id FROM users WHERE phone_number = %(phone)s",
            {"phone": request.phoneNumber}
        )
        if existing:
            raise HTTPException(status_code=400, detail="User with this phone number already exists")
    
    if request.email:
        existing = await db.execute(
            "SELECT user_id FROM users WHERE email = %(email)s",
            {"email": request.email}
        )
        if existing:
            raise HTTPException(status_code=400, detail="User with this email already exists")
    
    # Create user in database
    import uuid
    user_id = str(uuid.uuid4())
    password_hash = hash_password(request.password) if request.password else hash_password("changeme123")
    
    await db.execute("""
        INSERT INTO users (user_id, name, email, phone_number, account_number, date_of_birth, password_hash, role)
        VALUES (%(user_id)s, %(name)s, %(email)s, %(phone)s, %(account)s, %(dob)s, %(password_hash)s, 'patient')
    """, {
        "user_id": user_id,
        "name": request.name,
        "email": request.email or None,
        "phone": request.phoneNumber or None,
        "account": request.accountNumber,
        "dob": request.dateOfBirth,
        "password_hash": password_hash
    })
    
    user_data = {
        "id": user_id,
        "name": request.name,
        "email": request.email,
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
        "email": user_data.get("email"),
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
