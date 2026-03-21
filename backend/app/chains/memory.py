from langchain_community.chat_message_histories import ChatMessageHistory
from langchain_core.chat_history import BaseChatMessageHistory

# One memory store per user session — keyed by user_id
memory_store: dict = {}

def get_memory(user_id: str) -> BaseChatMessageHistory:
    if user_id not in memory_store:
        memory_store[user_id] = ChatMessageHistory()
    return memory_store[user_id]

def clear_memory(user_id: str):
    if user_id in memory_store:
        del memory_store[user_id]