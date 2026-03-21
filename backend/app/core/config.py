from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "MuseumBot"
    FRONTEND_URL: str = "http://localhost:3000"

    MONGO_URI: str
    MONGO_DB_NAME: str

    JWT_SECRET: str
    JWT_EXPIRE_DAYS: int = 7

    GEMINI_API_KEY: str

    RAZORPAY_KEY_ID: str
    RAZORPAY_KEY_SECRET: str

    SENDGRID_API_KEY: str
    FROM_EMAIL: str

    TWILIO_ACCOUNT_SID: str
    TWILIO_AUTH_TOKEN: str
    TWILIO_WHATSAPP_NUMBER: str

    GOOGLE_CLIENT_ID: str
    GOOGLE_CLIENT_SECRET: str

    class Config:
        env_file = ".env"

settings = Settings()