from cryptography.fernet import Fernet
from app.core.config import settings

fernet = Fernet(settings.ENCRYPTION_KEY.encode())

def encrypt(text: str) -> str:
    if not text:
        return ""
    return fernet.encrypt(text.encode()).decode()

def decrypt(text: str) -> str:
    if not text:
        return ""
    return fernet.decrypt(text.encode()).decode()