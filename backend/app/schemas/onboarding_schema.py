from pydantic import BaseModel, Field

class MuseumOnboardingRequest(BaseModel):
    license: str = Field(..., min_length=3)
    accountHolder: str = Field(..., min_length=3)
    routingNumber: str = Field(..., min_length=4)
    accountNumber: str = Field(..., min_length=6)