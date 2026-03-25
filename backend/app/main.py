from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.logger import get_logger
from app.db.database import connect_db, close_db

logger = get_logger(__name__)

# ✅ IMPORT ROUTERS
from app.api import auth, museum_auth
from app.api.chat import router as chat_router
from app.api.booking import router as booking_router
from app.api.museums import router as museums_router
from app.api.onboarding_routes import router as onboarding_router
from app.services.translate_service import translate_text

# ✅ OPTIONAL PAYMENT ROUTER
try:
    from app.api.payment import router as payment_router
    has_payment = True
except ImportError:
    has_payment = False

@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    logger.info(f"{settings.APP_NAME} ready")
    yield
    await close_db()

# ✅ SINGLE APP INSTANCE
app = FastAPI(title=settings.APP_NAME, lifespan=lifespan)

# ✅ CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "*",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ EXCEPTION HANDLERS
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"message": exc.detail},
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = exc.errors()
    first_error = errors[0] if errors else {}
    message = first_error.get("msg", "Invalid request data")
    return JSONResponse(
        status_code=400,
        content={"message": message},
    )

# ✅ AUTH ROUTES
app.include_router(auth.router, prefix="/api/users", tags=["User Auth"])
app.include_router(museum_auth.router, prefix="/api/museums", tags=["Museum Auth"])

# ✅ OTHER ROUTES
app.include_router(onboarding_router)
app.include_router(chat_router, prefix="/api")
app.include_router(booking_router, prefix="", tags=["Booking"])
app.include_router(museums_router, prefix="/api/museums", tags=["Museums"])

# ✅ PAYMENT ROUTE
if has_payment:
    app.include_router(payment_router, prefix="/api/payment", tags=["Payment"])

# ✅ TRANSLATION ROUTE
@app.get("/api/translate")
def translate_api(text: str, lang: str):
    translated = translate_text(text, lang)
    return {
        "original": text,
        "translated": translated,
        "target_language": lang
    }

# ✅ ROOT
@app.get("/")
async def root():
    return {"message": f"{settings.APP_NAME} is running ✅"}