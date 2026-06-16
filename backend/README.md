---
title: Retra Backend
emoji: 🩺
colorFrom: blue
colorTo: indigo
sdk: docker
app_port: 8000
pinned: false
---

# Retra backend

FastAPI service for diabetic retinopathy inference (EfficientNet-B3 with
Grad-CAM), built from this folder's Dockerfile.

Set a Space secret named `RETRA_MODEL_URL` to a public URL for `retra.pth`
(for example a GitHub release asset); the backend downloads it on startup.

Endpoints: `GET /health`, `POST /predict`.

The metadata block above is read by Hugging Face Spaces. It is ignored when the
same Dockerfile is built on Render or run locally.
