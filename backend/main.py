from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from backend.dataset_apis.dataset import get_dataset, search_datasets
from backend.llm import refine_query

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class QueryRequest(BaseModel):
    query: str
    file_type: str | None = None
    license_class: str | None = None

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/query")
def query(request: QueryRequest):

    if "kaggle.com/datasets/" in request.query:
        return get_dataset(request.query)

    search_terms = refine_query(request.query)
    return search_datasets(search_terms, request.file_type, request.license_class)
