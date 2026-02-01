"""
Twilio Verify Service
Handles phone and email verification via Twilio Verify API
"""

from twilio.rest import Client
from twilio.base.exceptions import TwilioRestException
from app.core.config import settings
from typing import Literal

class TwilioVerifyService:
    def __init__(self):
        self.client = None
        self.verify_service_sid = settings.TWILIO_VERIFY_SERVICE_SID
        
        if settings.TWILIO_ACCOUNT_SID and settings.TWILIO_AUTH_TOKEN:
            self.client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
    
    def _is_configured(self) -> bool:
        """Check if Twilio is properly configured"""
        return self.client is not None and bool(self.verify_service_sid)
    
    async def send_verification(
        self, 
        to: str, 
        channel: Literal["sms", "email", "call"] = "sms"
    ) -> dict:
        """
        Send a verification code via SMS, email, or voice call
        
        Args:
            to: Phone number (E.164 format) or email address
            channel: 'sms', 'email', or 'call'
        
        Returns:
            dict with status and verification SID
        """
        if not self._is_configured():
            # Fallback to mock verification in dev mode
            if settings.DEBUG:
                print(f"📱 [DEV MODE] Verification would be sent to {to} via {channel}")
                return {
                    "success": True,
                    "status": "pending",
                    "sid": "dev-mode-sid",
                    "to": to,
                    "channel": channel,
                    "debug_mode": True
                }
            raise Exception("Twilio is not configured. Set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN.")
        
        try:
            verification = self.client.verify.v2.services(
                self.verify_service_sid
            ).verifications.create(
                to=to,
                channel=channel
            )
            
            print(f"✅ Verification sent to {to} via {channel}, SID: {verification.sid}")
            
            return {
                "success": True,
                "status": verification.status,
                "sid": verification.sid,
                "to": to,
                "channel": channel
            }
            
        except TwilioRestException as e:
            print(f"❌ Twilio error: {e.msg}")
            return {
                "success": False,
                "error": e.msg,
                "code": e.code
            }
    
    async def check_verification(self, to: str, code: str) -> dict:
        """
        Check a verification code
        
        Args:
            to: Phone number (E.164 format) or email address
            code: The verification code entered by user
        
        Returns:
            dict with verification status
        """
        if not self._is_configured():
            # Fallback for dev mode - accept any 6-digit code or "123456"
            if settings.DEBUG:
                is_valid = len(code) == 6 and code.isdigit()
                print(f"📱 [DEV MODE] Verification check for {to}: {'approved' if is_valid else 'denied'}")
                return {
                    "success": is_valid,
                    "status": "approved" if is_valid else "denied",
                    "to": to,
                    "debug_mode": True
                }
            raise Exception("Twilio is not configured")
        
        try:
            verification_check = self.client.verify.v2.services(
                self.verify_service_sid
            ).verification_checks.create(
                to=to,
                code=code
            )
            
            is_approved = verification_check.status == "approved"
            print(f"{'✅' if is_approved else '❌'} Verification for {to}: {verification_check.status}")
            
            return {
                "success": is_approved,
                "status": verification_check.status,
                "to": to
            }
            
        except TwilioRestException as e:
            print(f"❌ Twilio verification error: {e.msg}")
            return {
                "success": False,
                "status": "failed",
                "error": e.msg,
                "code": e.code
            }
    
    async def send_phone_verification(self, phone_number: str) -> dict:
        """Convenience method to send SMS verification"""
        # Ensure phone is in E.164 format
        phone = phone_number.strip()
        if not phone.startswith("+"):
            phone = f"+1{phone.replace('-', '').replace(' ', '').replace('(', '').replace(')', '')}"
        
        return await self.send_verification(phone, "sms")
    
    async def send_email_verification(self, email: str) -> dict:
        """Convenience method to send email verification"""
        return await self.send_verification(email.strip().lower(), "email")
    
    async def verify_phone(self, phone_number: str, code: str) -> dict:
        """Convenience method to verify phone code"""
        phone = phone_number.strip()
        if not phone.startswith("+"):
            phone = f"+1{phone.replace('-', '').replace(' ', '').replace('(', '').replace(')', '')}"
        
        return await self.check_verification(phone, code)
    
    async def verify_email(self, email: str, code: str) -> dict:
        """Convenience method to verify email code"""
        return await self.check_verification(email.strip().lower(), code)


# Singleton instance
twilio_verify = TwilioVerifyService()
