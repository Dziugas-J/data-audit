import os

from dotenv import load_dotenv
from groq import Groq

load_dotenv()

LLM_CONFIG = {
    "model": "openai/gpt-oss-120b",
    "api_key": os.getenv("GROQ_API_KEY"),
}

client = Groq(api_key=LLM_CONFIG["api_key"])


def ask_llm(query: str) -> str:
    response = client.chat.completions.create(
        model=LLM_CONFIG["model"],
        messages=[{"role": "user", "content": query}],
    )
    return response.choices[0].message.content
