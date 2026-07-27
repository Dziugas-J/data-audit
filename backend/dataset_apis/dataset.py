from functools import lru_cache
from typing import Any

import requests
from sentence_transformers import SentenceTransformer, util

from backend.dataset_apis.classify import classify_license
from backend.dataset_apis.kaggle_api import get_dataset_by_url, search_kaggle


MODEL_NAME = "all-MiniLM-L6-v2"
THRESHOLD = 0.3


@lru_cache(maxsize=1)
def get_embedding_model() -> SentenceTransformer:
    return SentenceTransformer(MODEL_NAME)


def rank_by_relevance(
    results: list[dict[str, Any]],
    query: str,
) -> list[dict[str, Any]]:
    if not results or not query.strip():
        return results

    texts = [
        " ".join(
            part
            for part in (
                str(result.get("title") or ""),
                str(result.get("subtitle") or ""),
            )
            if part
        )
        for result in results
    ]

    model = get_embedding_model()

    query_embedding = model.encode(
        query,
        convert_to_tensor=True,
        normalize_embeddings=True,
    )
    result_embeddings = model.encode(
        texts,
        convert_to_tensor=True,
        normalize_embeddings=True,
    )

    scores = util.dot_score(query_embedding, result_embeddings)[0].tolist()

    scored_results = sorted(
        zip(results, scores),
        key=lambda pair: pair[1],
        reverse=True,
    )

    return [
        result
        for result, score in scored_results
        if score >= THRESHOLD
    ]


def search_datasets(
    query: str,
    file_type: str | None = None,
    license_class: str | None = None,
) -> dict[str, Any]:
    results = rank_by_relevance(search_kaggle(query), query)
    unmet_filters: list[str] = []

    normalized_file_type = file_type.strip().lower() if file_type else None
    normalized_license_class = (
        license_class.strip().lower() if license_class else None
    )

    if normalized_file_type and normalized_file_type != "any":
        matching_results = [
            result
            for result in results
            if str(result.get("file_type") or "").strip().lower()
            == normalized_file_type
        ]

        if matching_results:
            results = matching_results
        else:
            unmet_filters.append(f'file type "{file_type}"')

    if normalized_license_class and normalized_license_class != "any":
        matching_results = [
            result
            for result in results
            if classify_license(result.get("license"))
            == normalized_license_class
        ]

        if matching_results:
            results = matching_results
        else:
            unmet_filters.append(f'license class "{license_class}"')

    message = None
    if unmet_filters:
        constraints = " and ".join(unmet_filters)
        message = (
            f"No results matched {constraints}. "
            "Showing the closest available results."
        )

    return {
        "message": message,
        "results": results,
    }


def get_dataset(url: str) -> dict[str, Any]:
    try:
        dataset = get_dataset_by_url(url)
    except requests.exceptions.HTTPError:
        return {
            "message": "Dataset not found.",
            "results": [],
        }

    return {
        "message": None,
        "results": [dataset],
    }