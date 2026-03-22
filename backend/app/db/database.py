from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

client = AsyncIOMotorClient(settings.MONGO_URI)
db = client[settings.MONGO_DB_NAME]

async def connect_db():
    global client, db
    client = AsyncIOMotorClient(settings.MONGO_URI)
    db = client[settings.MONGO_DB_NAME]
    print(f"✅ Connected to MongoDB: {settings.MONGO_DB_NAME}")

async def close_db():
    global client
    if client:
        client.close()

def get_db():
    return db
