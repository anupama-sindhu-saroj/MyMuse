from fastapi import HTTPException, Header
from typing import Optional
from jose import jwt, JWTError
import os

JWT_SECRET = os.getenv("JWT_SECRET", "supersecretkey")

async def get_current_user(authorization: Optional[str] = Header(None)) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    token = authorization.split(" ")[1]
    
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        
        # Handle different token structures
        user_id = (
            payload.get("id") or 
            payload.get("user_id") or 
            payload.get("sub") or 
            payload.get("_id") or ""
        )
        
        return {
            "id": str(user_id),
            "email": payload.get("email", ""),
            "name": payload.get("name", "")
        }
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
