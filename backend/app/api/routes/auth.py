"""
Authentication Routes - Patient Signup & Login
"""

from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel
from typing import Optional
from datetime import timedelta, datetime
import random
import string
import bcrypt

from app.core.auth import AuthService, get_current_user
from app.core.config import settings

router = APIRouter()

# In-memory storage for verification codes (use Redis in production)
verification_codes = {}

class LoginRequest(BaseModel):
    email: str  # Can be email or phone number
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
