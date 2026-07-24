import os

from dotenv import load_dotenv
from groq import Groq

load_dotenv()

MODEL = "openai/gpt-oss-120b"

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def ask_llm(query: str) -> str:
    response = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": query}],
    )
    return response.choices[0].message.content

def refine_query(user_text: str) -> str:
    instruction = (
        "Turn the following project description into a single short Kaggle search "
        "phrase (2-5 words, no punctuation, no explanation, no alternatives, "
        "just the phrase itself):\n\n"
        f"{user_text}"
    )
    keywords = ask_llm(instruction).strip()
    return keywords.split(",")[0].strip()
