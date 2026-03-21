from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    APP_NAME: str = "MuseumBot"
    FRONTEND_URL: str = "http://localhost:5173"

    MONGO_URI: str
    MONGO_DB_NAME: str = "museumDB"

    JWT_SECRET: str = "secret"
    JWT_EXPIRE_DAYS: int = 7

    GEMINI_API_KEY: str = ""
    OPENAI_API_KEY: str = ""

    RAZORPAY_KEY_ID: str = ""
    RAZORPAY_KEY_SECRET: str = ""

    SENDGRID_API_KEY: str = ""
    FROM_EMAIL: str = ""

    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_WHATSAPP_NUMBER: str = ""

    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()