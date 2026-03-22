from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.logger import get_logger
from app.db.database import connect_db, close_db
from app.api import auth, museum_auth
from app.api.chat import router as chat_router
from app.api.booking import router as booking_router
from app.api.museums import router as museums_router

logger = get_logger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    logger.info(f"{settings.APP_NAME} ready")
    yield
    await close_db()

app = FastAPI(title=settings.APP_NAME, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        settings.FRONTEND_URL,
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
app.include_router(chat_router)
app.include_router(booking_router)
app.include_router(museums_router)
if has_payment:
    app.include_router(payment_router)

@app.get("/")
async def root():
    return {"message": f"{settings.APP_NAME} is running"}