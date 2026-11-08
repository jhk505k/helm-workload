from fastapi import HTTPException, status, Request, Depends
from fastapi.security import HTTPBearer
from fastapi.security.http import HTTPAuthorizationCredentials
from typing import Optional
import jwt
import os
from functools import wraps


# JWT Configuration (compatible with GSLAB)
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key-here')  # Same as GSLAB
JWT_ALGORITHM = os.environ.get('JWT_ALGORITHM', 'HS256')

security = HTTPBearer(auto_error=False)


class CurrentUser:
    """User context extracted from JWT token"""
    def __init__(self, user_id: str, email: str, name: str = None, role: str = None):
        self.user_id = user_id
        self.email = email
        self.name = name
        self.role = role


async def get_current_user(request: Request, credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> CurrentUser:
    """
    Extract and validate JWT token from:
    1. Authorization header (Bearer token)
    2. Cookie (for GSLAB cookie-based auth)
    
    Compatible with GSLAB's authentication system.
    """
    token = None
    
    # Try Authorization header first
    if credentials:
        token = credentials.credentials
    
    # Try cookie (GSLAB uses JWT cookies)
    if not token and 'access_token' in request.cookies:
        token = request.cookies.get('access_token')
    
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    try:
        # Decode JWT token (same algorithm as GSLAB)
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        
        # Extract user info (GSLAB token structure)
        user_id = payload.get('sub') or payload.get('user_id')
        email = payload.get('email')
        name = payload.get('name')
        role = payload.get('role')
        
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: missing user_id"
            )
        
        return CurrentUser(user_id=user_id, email=email, name=name, role=role)
    
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    except jwt.InvalidTokenError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}"
        )


def require_auth(func):
    """Decorator to require authentication on route handlers"""
    @wraps(func)
    async def wrapper(*args, current_user: CurrentUser = Depends(get_current_user), **kwargs):
        return await func(*args, current_user=current_user, **kwargs)
    return wrapper


def optional_auth(request: Request, credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> Optional[CurrentUser]:
    """Optional authentication - returns None if not authenticated"""
    try:
        return get_current_user(request, credentials)
    except HTTPException:
        return None
