from openai import OpenAI
from app.config.settings import settings

client = OpenAI(api_key=settings.OPENAI_API_KEY)

def get_ai_response(message: str, lang: str):
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": f"You are a helpful museum guide. Always reply in {lang} language."
                },
                {
                    "role": "user",
                    "content": message
                }
            ],
            temperature=0.7
        )

        return response.choices[0].message.content

    except Exception as e:
        print("AI Error:", e)
        return "Something went wrong"