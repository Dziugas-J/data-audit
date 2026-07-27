import json
import os

from dotenv import load_dotenv
from groq import Groq

load_dotenv()

MODEL = "openai/gpt-oss-120b"

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def extract_search_terms(instruction: str, fallback: str) -> str:
    try:
        response = client.chat.completions.create(
            model=MODEL,
            temperature=0,
            max_tokens=300,
            response_format={"type": "json_object"},
            messages=[{"role": "user", "content": instruction}],
        )
        search_terms = json.loads(response.choices[0].message.content)["search_terms"].strip()
        if search_terms:
            return search_terms
    except Exception:
        pass

    return fallback.strip()

def refine_query(user_text: str) -> str:
    instruction = (
        "Turn the following project description into a short Kaggle search "
        "phrase (2-5 words). Respond with JSON only, in the "
        'form {"search_terms": "..."}.\n\n'
        f"{user_text}"
    )
    return extract_search_terms(instruction, user_text)

def broaden_query(user_text: str) -> str:
    instruction = (
        "The following project description did not match any datasets on "
        "Kaggle. Suggest a broader, more general Kaggle search phrase "
        '(2-4 words) covering a related topic. Respond with JSON only, in '
        'the form {"search_terms": "..."}.\n\n'
        f"{user_text}"
    )
    return extract_search_terms(instruction, user_text)
