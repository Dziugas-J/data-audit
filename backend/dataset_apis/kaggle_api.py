import json
import os
import re
import tempfile
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

KAGGLE_CONFIG = {
    "api_key": os.getenv("KAGGLE_API_KEY"),
}

os.environ.setdefault("KAGGLE_API_TOKEN", KAGGLE_CONFIG["api_key"] or "")

from kaggle.api.kaggle_api_extended import KaggleApi  # noqa: E402

IMAGE_EXTENSIONS = {"jpg", "jpeg", "png", "gif", "bmp", "tiff"}
VIDEO_EXTENSIONS = {"mp4", "avi", "mov", "mkv", "webm"}

def classify_files(file_names):
    extensions = {name.rsplit(".", 1)[-1].lower() for name in file_names if "." in name}
    if extensions & VIDEO_EXTENSIONS:
        return "Videos"
    if extensions & IMAGE_EXTENSIONS:
        return "Images"
    if extensions:
        return "Structured data"
    return "Other"

def search_kaggle(query):
    api = KaggleApi()
    api.authenticate()

    results = []
    for dataset in api.dataset_list(search=query):
        file_names = [f.name for f in api.dataset_list_files(dataset.ref).files]

        results.append({
            "title": dataset.title,
            "description": dataset.subtitle,
            "file_type": classify_files(file_names),
            "license": dataset.license_name,
            "url": dataset.url,
        })

    return results

def extract_dataset_ref(url):
    match = re.search(r"kaggle\.com/datasets/([\w-]+/[\w-]+)", url)
    if not match:
        raise ValueError(f"Not a Kaggle dataset URL: {url}")
    return match.group(1)


def get_dataset_by_url(url):
    ref = extract_dataset_ref(url)
    api = KaggleApi()
    api.authenticate()

    with tempfile.TemporaryDirectory() as tmp_dir:
        metadata_path = api.dataset_metadata(ref, tmp_dir)
        metadata = json.loads(Path(metadata_path).read_text(encoding="utf-8"))["info"]

    file_names = [f.name for f in api.dataset_list_files(ref).files]
    licenses = metadata.get("licenses") or []

    return {
        "title": metadata["title"],
        "description": metadata["description"],
        "file_type": classify_files(file_names),
        "license": licenses[0]["name"] if licenses else None,
        "url": f"https://www.kaggle.com/datasets/{ref}",
    }
