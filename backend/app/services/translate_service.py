from google.cloud import translate_v2 as translate
from app.config.settings import settings

translate_client = translate.Client()

# Simple in-memory cache
cache = {}

def translate_text(text: str, target_lang: str):
    if not text or target_lang == "en":
        return text

    key = f"{text}-{target_lang}"
    if key in cache:
        return cache[key]

    try:
        result = translate_client.translate(
            text,
            target_language=target_lang
        )
        translated = result["translatedText"]

        cache[key] = translated
        return translated

    except Exception as e:
        print("Translation Error:", e)
        return text