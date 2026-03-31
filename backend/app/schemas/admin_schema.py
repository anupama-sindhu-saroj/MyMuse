
from pydantic import BaseModel, EmailStr

class AdminSignupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    secret_key: str        # ← admin must know this to register

class AdminLoginRequest(BaseModel):
    email: EmailStr
    password: str