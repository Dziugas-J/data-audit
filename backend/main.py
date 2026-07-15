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

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/query")
def query(request: QueryRequest):
    print(f"Received query: {request.query}")

    if "kaggle.com/datasets/" in request.query:
        return get_dataset(request.query)

    search_terms = refine_query(request.query)
    print(f"Refined search terms: {search_terms}")

    return search_datasets(search_terms)
