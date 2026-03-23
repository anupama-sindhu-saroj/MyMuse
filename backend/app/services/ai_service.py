from openai import OpenAI
from app.core.config import settings
from google.cloud import translate_v2 as translate

client = OpenAI(api_key=settings.OPENAI_API_KEY)

# ✅ Initialize translator
translator = translate.Client()

def translate_text(text, target_lang):
    if target_lang == "en":
        return text

    result = translator.translate(text, target_language=target_lang)
    return result["translatedText"]


def get_ai_response(message: str, lang: str):
    try:
        # 1️⃣ Always generate AI in English
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful museum guide. Always reply in English."
                },
                {
                    "role": "user",
                    "content": message
                }
            ],
            temperature=0.7
        )

        ai_reply = response.choices[0].message.content

        # 2️⃣ Translate using Google API
        translated_reply = translate_text(ai_reply, lang)

        return translated_reply

    except Exception as e:
        print("AI Error:", e)
        return "Something went wrong"