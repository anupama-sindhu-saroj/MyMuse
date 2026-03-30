from google.cloud import translate_v2 as translate
import os

# Force credentials path
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
    "credentials",
    "translate-key.json"
)

# Create client (IMPORTANT: no manual credentials here)
client = translate.Client()


def translate_text(text: str, target_lang: str):
    try:
        result = client.translate(text, target_language=target_lang)

        print("RAW RESPONSE:", result)

        return result.get("translatedText", text)

    except Exception as e:
        print("❌ ERROR:", e)
        return text