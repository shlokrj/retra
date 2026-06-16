"""retra fastapi backend.

run:
    uvicorn main:app --reload
"""

from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from model import RetraModel

app = FastAPI(title="Retra API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/outputs", StaticFiles(directory="outputs"), name="outputs")

model = RetraModel()


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    image_bytes = await file.read()
    result = model.predict(image_bytes)

    # TODO: generate grad-cam heatmap, save under outputs/, set real heatmap_url
    result["heatmap_url"] = "/outputs/example_heatmap.png"
    return result
