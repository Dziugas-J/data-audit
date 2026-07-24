from backend.dataset_apis.classify import classify_license
from backend.dataset_apis.kaggle_api import get_dataset_by_url, search_kaggle

def search_datasets(query, file_type=None, license_class=None):
    results = search_kaggle(query)
    unmet = []

    if file_type and file_type != "Any":
        matching = [r for r in results if r["file_type"] == file_type]
        if matching:
            results = matching
        else:
            unmet.append(f'no "{file_type}" datasets')

    if license_class and license_class != "any":
        matching = [r for r in results if classify_license(r["license"]) == license_class]
        if matching:
            results = matching
        else:
            unmet.append("no datasets matching that license")

    message = None
    if unmet:
        message = f"Found {' and '.join(unmet)} for this search. Showing similar results instead."

    return {"message": message, "results": results}

def get_dataset(url):
    return {"message": None, "results": [get_dataset_by_url(url)]}
