"""
Auth0 Service
Handles Auth0 authentication and token validation
"""

import httpx
from jose import jwt, JWTError
from jose.exceptions import ExpiredSignatureError
from typing import Optional, Dict, Any
from functools import lru_cache
from app.core.config import settings

class Auth0Service:
    def __init__(self):
        self.domain = settings.AUTH0_DOMAIN
        self.client_id = settings.AUTH0_CLIENT_ID
        self.client_secret = settings.AUTH0_CLIENT_SECRET
        self.audience = settings.AUTH0_AUDIENCE or f"https://{self.domain}/api/v2/"
        self.algorithms = ["RS256"]
        self._jwks = None
    
    def _is_configured(self) -> bool:
        """Check if Auth0 is properly configured"""
        return bool(self.domain and self.client_id)
    
    @property
    def issuer(self) -> str:
        return f"https://{self.domain}/"
    
    @property
    def jwks_url(self) -> str:
        return f"https://{self.domain}/.well-known/jwks.json"
    
    async def get_jwks(self) -> dict:
        """Fetch JSON Web Key Set from Auth0"""
        if self._jwks is None:
            async with httpx.AsyncClient() as client:
                response = await client.get(self.jwks_url)
                response.raise_for_status()
                self._jwks = response.json()
        return self._jwks
    
    def _get_signing_key(self, jwks: dict, kid: str) -> Optional[dict]:
        """Get the signing key from JWKS by key ID"""
        for key in jwks.get("keys", []):
            if key.get("kid") == kid:
                return key
        return None
    
    async def verify_token(self, token: str) -> Dict[str, Any]:
        """
        Verify an Auth0 JWT token
        
        Args:
            token: The JWT token to verify
            
        Returns:
            The decoded token payload
            
        Raises:
            Exception if token is invalid
        """
        if not self._is_configured():
            raise Exception("Auth0 is not configured")
        
        try:
            # Get the key ID from the token header
            unverified_header = jwt.get_unverified_header(token)
            kid = unverified_header.get("kid")
            
            if not kid:
                raise Exception("Token missing key ID")
            
            # Fetch JWKS and find matching key
            jwks = await self.get_jwks()
            signing_key = self._get_signing_key(jwks, kid)
            
            if not signing_key:
                raise Exception("Unable to find signing key")
            
            # Verify and decode the token
            payload = jwt.decode(
                token,
                signing_key,
                algorithms=self.algorithms,
                audience=self.audience,
                issuer=self.issuer
            )
            
            return payload
            
        except ExpiredSignatureError:
            raise Exception("Token has expired")
        except JWTError as e:
            raise Exception(f"Token validation failed: {str(e)}")
    
    async def get_user_info(self, access_token: str) -> Dict[str, Any]:
        """
        Get user info from Auth0 using access token
        
        Args:
            access_token: The Auth0 access token
            
        Returns:
            User info from Auth0
        """
        if not self._is_configured():
            raise Exception("Auth0 is not configured")
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://{self.domain}/userinfo",
                headers={"Authorization": f"Bearer {access_token}"}
            )
            response.raise_for_status()
            return response.json()
    
    async def exchange_code_for_tokens(
        self, 
        code: str, 
        redirect_uri: str
    ) -> Dict[str, Any]:
        """
        Exchange authorization code for tokens (OAuth2 code flow)
        
        Args:
            code: The authorization code
            redirect_uri: The redirect URI used in the authorization request
            
        Returns:
            Token response containing access_token, id_token, etc.
        """
        if not self._is_configured():
            raise Exception("Auth0 is not configured")
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"https://{self.domain}/oauth/token",
                json={
                    "grant_type": "authorization_code",
                    "client_id": self.client_id,
                    "client_secret": self.client_secret,
                    "code": code,
                    "redirect_uri": redirect_uri
                }
            )
            response.raise_for_status()
            return response.json()
    
    def get_authorization_url(
        self, 
        redirect_uri: str, 
        state: Optional[str] = None,
        scope: str = "openid profile email"
    ) -> str:
        """
        Generate Auth0 authorization URL for login
        
        Args:
            redirect_uri: Where to redirect after login
            state: Optional state parameter for CSRF protection
            scope: OAuth scopes to request
            
        Returns:
            The authorization URL
        """
        if not self._is_configured():
            raise Exception("Auth0 is not configured")
        
        params = {
            "response_type": "code",
            "client_id": self.client_id,
            "redirect_uri": redirect_uri,
            "scope": scope,
            "audience": self.audience
        }
        
        if state:
            params["state"] = state
        
        query = "&".join(f"{k}={v}" for k, v in params.items())
        return f"https://{self.domain}/authorize?{query}"
    
    async def get_management_token(self) -> str:
        """
        Get a management API token for Auth0 Admin operations
        
        Returns:
            Management API access token
        """
        if not self._is_configured() or not self.client_secret:
            raise Exception("Auth0 management API requires client secret")
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"https://{self.domain}/oauth/token",
                json={
                    "grant_type": "client_credentials",
                    "client_id": self.client_id,
                    "client_secret": self.client_secret,
                    "audience": f"https://{self.domain}/api/v2/"
                }
            )
            response.raise_for_status()
            return response.json().get("access_token")


# Singleton instance
auth0_service = Auth0Service()
