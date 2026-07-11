import os

from dotenv import load_dotenv

load_dotenv()

KAGGLE_CONFIG = {
    "api_key": os.getenv("KAGGLE_API_KEY"),
}
