import traceback
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, HTTPException
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.logger import get_logger
from app.db.database import connect_db, close_db
from app.api import auth, museum_auth,admin_auth

logger = get_logger(__name__)

# ✅ Import all routers
from app.api import auth, museum_auth
from app.api.chat import router as chat_router
from app.api.booking import router as booking_router
from app.api.museums import router as museums_router
from app.api.onboarding_routes import router as onboarding_router
from app.api.dashboard import router as dashboard_router
from app.services.translate_service import translate_text

# ✅ Payment router — logs the real error instead of silently dropping it
has_payment = False
payment_router = None

try:
    from app.api.payment import router as payment_router
    has_payment = True
    logger.info("✅ Payment router loaded successfully")
except ImportError as e:
    logger.warning(f"⚠️  Payment router not loaded (ImportError): {e}")
    traceback.print_exc()
except Exception as e:
    logger.error(f"❌ Payment router failed to load: {e}")
    traceback.print_exc()


# ✅ DB lifecycle
@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    logger.info(f"🚀 {settings.APP_NAME} is ready")
    yield
    await close_db()


# ✅ Create app
app = FastAPI(title=settings.APP_NAME, lifespan=lifespan)


# ✅ CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ✅ Include routers
app.include_router(auth.router, prefix="/api/users", tags=["User Auth"])
app.include_router(museum_auth.router, prefix="/api/museums", tags=["Museum Auth"])
app.include_router(onboarding_router)
app.include_router(chat_router, prefix="/api", tags=["Chat"])
app.include_router(booking_router, prefix="/api/bookings", tags=["Booking"])
app.include_router(museums_router, prefix="/api/museums", tags=["Museums"])
app.include_router(dashboard_router)

if has_payment and payment_router:
    app.include_router(payment_router, prefix="/api/payment", tags=["Payment"])
    logger.info("✅ Payment routes registered at /api/payment")
else:
    logger.warning("⚠️  Payment routes are NOT registered — fix the import error above")


# ✅ Global exception handlers
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

app.include_router(auth.router,        prefix="/api/users",   tags=["User Auth"])
app.include_router(museum_auth.router, prefix="/api/museums", tags=["Museum Auth"])
app.include_router(admin_auth.router,  prefix="/api/admin",   tags=["Admin Auth"])  


# ✅ Translation route
@app.get("/api/translate")
def translate_api(text: str, lang: str):
    translated = translate_text(text, lang)
    return {
        "original": text,
        "translated": translated,
        "target_language": lang,
    }


# ✅ Health check
@app.get("/")
async def root():
    return {"message": f"{settings.APP_NAME} is running ✅"}


@app.get("/api/health")
async def health():
    return {"status": "ok", "app": settings.APP_NAME}