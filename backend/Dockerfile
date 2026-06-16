FROM python:3.11-slim

WORKDIR /app

# install cpu-only torch first; the default wheel pulls ~4 GB of CUDA libs we
# do not need for inference. requirements.txt then sees torch already satisfied.
RUN pip install --no-cache-dir torch torchvision \
    --index-url https://download.pytorch.org/whl/cpu

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# container hosts (Render, Railway, Fly) inject $PORT
EXPOSE 8000
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
