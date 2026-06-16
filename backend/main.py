"""retra fastapi backend."""

import asyncio
import uuid
from pathlib import Path

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from PIL import UnidentifiedImageError

from model import RetraModel

OUTPUTS_DIR = Path(__file__).resolve().parent / "outputs"
MAX_UPLOAD_BYTES = 10 * 1024 * 1024
OUTPUTS_DIR.mkdir(exist_ok=True)

app = FastAPI(title="Retra API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

app.mount("/outputs", StaticFiles(directory=str(OUTPUTS_DIR)), name="outputs")

model = RetraModel()
model_lock = asyncio.Lock()


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if file.content_type and not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="upload must be an image")

    image_bytes = await file.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="upload cannot be empty")
    if len(image_bytes) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="image must be under 10 MB")

    name = f"{uuid.uuid4().hex}.png"
    heatmap_path = OUTPUTS_DIR / name

    try:
        async with model_lock:
            result = model.analyze(image_bytes, str(heatmap_path))
    except (UnidentifiedImageError, OSError) as exc:
        if heatmap_path.exists():
            heatmap_path.unlink()
        raise HTTPException(
            status_code=400,
            detail="upload must be a readable image",
        ) from exc

    result["heatmap_url"] = f"/outputs/{name}"
    return result
