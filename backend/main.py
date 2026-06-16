"""retra fastapi backend.

run:
    cd backend && uvicorn main:app --reload
"""

import os
import uuid

from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from model import RetraModel

OUTPUTS_DIR = "outputs"
os.makedirs(OUTPUTS_DIR, exist_ok=True)

app = FastAPI(title="Retra API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/outputs", StaticFiles(directory=OUTPUTS_DIR), name="outputs")

model = RetraModel()


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    image_bytes = await file.read()

    name = f"{uuid.uuid4().hex}.png"
    heatmap_path = os.path.join(OUTPUTS_DIR, name)
    result = model.analyze(image_bytes, heatmap_path)
    result["heatmap_url"] = f"/outputs/{name}"
    return result
