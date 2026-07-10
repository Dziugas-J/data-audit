# Data Audit Tool

A backend tool that helps data and AI engineers search for useful datasets, starting with Kaggle.

## Install

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

## Run

```bash
uvicorn backend.main:app --reload
```

## Verify

```
GET http://127.0.0.1:8000/health
```

Returns:

```json
{"status": "ok"}
```
