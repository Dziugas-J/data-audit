from backend.dataset_apis.kaggle_api import get_dataset_by_url, search_kaggle

def search_datasets(query):
    return search_kaggle(query)

def get_dataset(url):
    return get_dataset_by_url(url)
