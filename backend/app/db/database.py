from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings
from app.core.logger import get_logger

logger = get_logger(__name__)

client: AsyncIOMotorClient = None
db = None

async def connect_db():
    global client, db
    client = AsyncIOMotorClient(settings.MONGO_URI)
    db = client[settings.MONGO_DB_NAME]
    logger.info(f"MongoDB connected: {settings.MONGO_DB_NAME}")

async def close_db():
    global client
    if client:
        client.close()
        logger.info("MongoDB disconnected")

def get_db():
    return db