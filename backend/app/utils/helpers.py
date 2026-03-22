import random
import smtplib
from email.mime.text import MIMEText
from app.core.config import settings
from app.core.logger import get_logger

logger = get_logger(__name__)

def generate_otp(length: int = 6) -> str:
    return "".join([str(random.randint(0, 9)) for _ in range(length)])


async def send_otp_email(email: str, otp: str):
    try:
        msg = MIMEText(f"Your verification OTP is: {otp}\n\nIt expires in 5 minutes.")
        msg["Subject"] = "Your OTP Code — Museum Portal"
        msg["From"] = settings.EMAIL_USER
        msg["To"] = email

        # ← Changed: port 587 with STARTTLS instead of SSL 465
        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.login(settings.EMAIL_USER, settings.EMAIL_PASS)
            server.sendmail(settings.EMAIL_USER, email, msg.as_string())

        logger.info(f"OTP email sent to {email}")

    except Exception as e:
        logger.error(f"Email send failed: {e}")
        raise