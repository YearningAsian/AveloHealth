"""
HIPAA Compliance Utilities
Security and privacy enforcement
"""

import hashlib
import secrets
from typing import Any, Dict
from datetime import datetime
from Crypto.Cipher import AES
from Crypto.Random import get_random_bytes
from Crypto.Util.Padding import pad, unpad
import base64
import json

from app.core.config import settings

class HIPAACompliance:
    """HIPAA compliance utilities for PHI protection"""
    
    @staticmethod
    def encrypt_phi(data: str) -> str:
        """
        Encrypt Protected Health Information (PHI)
        Uses AES-256 encryption
        """
        key = settings.ENCRYPTION_KEY.encode()[:32]  # Ensure 32 bytes for AES-256
        cipher = AES.new(key, AES.MODE_CBC)
        
        encrypted_data = cipher.encrypt(pad(data.encode(), AES.block_size))
        
        # Combine IV and encrypted data
        result = base64.b64encode(cipher.iv + encrypted_data).decode()
        return result
    
    @staticmethod
    def decrypt_phi(encrypted_data: str) -> str:
        """Decrypt Protected Health Information"""
        key = settings.ENCRYPTION_KEY.encode()[:32]
        encrypted_bytes = base64.b64decode(encrypted_data)
        
        # Extract IV and encrypted data
        iv = encrypted_bytes[:AES.block_size]
        encrypted_content = encrypted_bytes[AES.block_size:]
        
        cipher = AES.new(key, AES.MODE_CBC, iv)
        decrypted_data = unpad(cipher.decrypt(encrypted_content), AES.block_size)
        
        return decrypted_data.decode()
    
    @staticmethod
    def sanitize_error_message(error: Exception) -> Dict[str, Any]:
        """
        Sanitize error messages to prevent PHI leakage
        Returns HIPAA-compliant error response
        """
        error_str = str(error).lower()
        
        # Check for potential PHI in error message
        phi_indicators = ['ssn', 'date of birth', 'phone', 'email', 'address', 'name']
        contains_phi = any(indicator in error_str for indicator in phi_indicators)
        
        if contains_phi:
            return {
                "code": "INTERNAL_ERROR",
                "message": "An error occurred. Please contact support.",
                "details": None,
                "hipaaCompliant": True,
                "timestamp": datetime.utcnow().isoformat()
            }
        
        return {
            "code": "ERROR",
            "message": str(error),
            "details": None,
            "hipaaCompliant": True,
            "timestamp": datetime.utcnow().isoformat()
        }
    
    @staticmethod
    def create_audit_log(
        user_id: str,
        action: str,
        resource_type: str,
        resource_id: str,
        details: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """
        Create HIPAA-compliant audit log entry
        Required for all PHI access
        """
        return {
            "timestamp": datetime.utcnow().isoformat(),
            "user_id": user_id,
            "action": action,  # e.g., 'VIEW', 'CREATE', 'UPDATE', 'DELETE'
            "resource_type": resource_type,  # e.g., 'PATIENT', 'APPOINTMENT'
            "resource_id": resource_id,
            "details": details or {},
            "ip_address": None,  # Should be populated from request
            "session_id": None   # Should be populated from auth
        }
    
    @staticmethod
    def anonymize_patient_data(patient_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Anonymize patient data for analytics
        Removes all direct identifiers
        """
        anonymized = {
            "patient_id_hash": hashlib.sha256(
                patient_data.get("id", "").encode()
            ).hexdigest()[:16],
            "age_range": HIPAACompliance._get_age_range(patient_data.get("dateOfBirth")),
            "risk_level": patient_data.get("riskLevel"),
            "chronic_conditions_count": len(patient_data.get("chronicConditions", [])),
            "last_contact_days_ago": None,  # Calculate from dates
        }
        return anonymized
    
    @staticmethod
    def _get_age_range(date_of_birth: str) -> str:
        """Convert DOB to age range"""
        if not date_of_birth:
            return "unknown"
        
        from datetime import datetime
        dob = datetime.fromisoformat(date_of_birth.replace('Z', '+00:00'))
        age = (datetime.utcnow() - dob).days // 365
        
        if age < 18:
            return "0-17"
        elif age < 35:
            return "18-34"
        elif age < 50:
            return "35-49"
        elif age < 65:
            return "50-64"
        else:
            return "65+"
    
    @staticmethod
    def validate_consent(patient_id: str, consent_type: str) -> bool:
        """
        Validate patient consent for specific data usage
        Should query Snowflake for actual consent records
        """
        # TODO: Implement actual consent checking against Snowflake
        return True  # Placeholder
