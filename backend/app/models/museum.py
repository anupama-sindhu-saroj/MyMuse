from pydantic import BaseModel

class Museum(BaseModel):
    title: str
    desc: str
    location: str
    image: str