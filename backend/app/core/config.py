from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    # App
    APP_NAME: str = "MuseumBot"
    FRONTEND_URL: str = "http://localhost:5173"

    # Database
    MONGO_URI: str
    MONGO_DB_NAME: str = "museumDB"

    # JWT
    JWT_SECRET: str = "secret"
    JWT_REFRESH_SECRET: str = ""
    JWT_EXPIRE_DAYS: int = 7
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # AI
    GEMINI_API_KEY: str = ""
    OPENAI_API_KEY: str = ""

    # Payments
    RAZORPAY_KEY_ID: str = ""
    RAZORPAY_KEY_SECRET: str = ""

    # Email
    SENDGRID_API_KEY: str = ""
    FROM_EMAIL: str = ""
    EMAIL_USER: str = ""
    EMAIL_PASS: str = ""
    ADMIN_SECRET_KEY: str = ""

    # Twilio / WhatsApp
    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_WHATSAPP_NUMBER: str = ""

    # Google OAuth
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""

    # Unsplash
    UNSPLASH_ACCESS_KEY: str = ""

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()