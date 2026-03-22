from pydantic import BaseModel, EmailStr

class MuseumSignupRequest(BaseModel):
    museumName: str
    email: EmailStr
    phone: str
    location: str
    password: str

class MuseumVerifyOTPRequest(BaseModel):
    museumId: str
    otp: str

class MuseumLoginRequest(BaseModel):
    email: EmailStr
    password: str

class MuseumForgotPasswordRequest(BaseModel):
    email: EmailStr

class MuseumVerifyResetOTPRequest(BaseModel):
    email: EmailStr
    otp: str

class MuseumResetPasswordRequest(BaseModel):
    email: EmailStr
    newPassword: str