from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.db.database import connect_db, close_db
from app.api.chat import router as chat_router

try:
    from app.api.payment import router as payment_router
    has_payment = True
except ImportError:
    has_payment = False

@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    print("🚀 Server ready at http://localhost:8000")
    yield
    await close_db()

app = FastAPI(title=settings.APP_NAME, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        settings.FRONTEND_URL
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router)

if has_payment:
    app.include_router(payment_router)

@app.get("/")
async def root():
    return {"message": "Museum Bot API is running ✅"}