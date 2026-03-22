from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class MuseumDocument(BaseModel):
    museumName: str
    email: EmailStr
    phone: str
    location: str
    password: Optional[str] = None
    is_verified: bool = False
    otp: Optional[str] = None
    otp_expiry: Optional[datetime] = None
    reset_otp: Optional[str] = None
    reset_otp_expiry: Optional[datetime] = None
    reset_verified: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)