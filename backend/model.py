"""model loading + grad-cam inference for the retra api.

self-contained so the backend can build/run on its own (the Dockerfile only
copies ./backend, so it must not import from ml/). the ben-graham preprocessing
here mirrors ml/transforms.py; keep the two in sync.
"""

import io
import os
import urllib.request

import cv2
import numpy as np
import timm
import torch
import torchvision.transforms as T
from PIL import Image

CLASSES = {
    0: "No DR",
    1: "Mild DR",
    2: "Moderate DR",
    3: "Severe DR",
    4: "Proliferative DR",
}

_IMAGENET_MEAN = [0.485, 0.456, 0.406]
_IMAGENET_STD = [0.229, 0.224, 0.225]
_NORMALIZE = T.Compose([T.ToTensor(), T.Normalize(_IMAGENET_MEAN, _IMAGENET_STD)])


def _pick_device():
    if torch.cuda.is_available():
        return "cuda"
    if torch.backends.mps.is_available():
        return "mps"
    return "cpu"


def _crop_to_circle(img):
    gray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)
    coords = np.argwhere(gray > 7)
    if coords.size == 0:
        return img
    y0, x0 = coords.min(axis=0)
    y1, x1 = coords.max(axis=0) + 1
    return img[y0:y1, x0:x1]


def _ben_graham(pil_img, size, sigma_frac=30.0):
    """crop + resize + local-contrast enhance; returns uint8 RGB size×size."""
    img = _crop_to_circle(np.array(pil_img.convert("RGB")))
    img = cv2.resize(img, (size, size))
    blur = cv2.GaussianBlur(img, (0, 0), size / sigma_frac)
    return cv2.addWeighted(img, 4, blur, -4, 128)


def _resolve_checkpoint(path):
    """find the weights whether we're run from backend/, repo root, or docker."""
    for cand in [os.environ.get("RETRA_CHECKPOINT"), path, os.path.join("..", path)]:
        if cand and os.path.exists(cand):
            return cand
    return path


def _ensure_checkpoint(path):
    """resolve the weights locally, or download them from RETRA_MODEL_URL.

    lets a container host fetch the git-ignored checkpoint at startup.
    """
    resolved = _resolve_checkpoint(path)
    if os.path.exists(resolved):
        return resolved
    url = os.environ.get("RETRA_MODEL_URL")
    if url:
        os.makedirs(os.path.dirname(path) or ".", exist_ok=True)
        print(f"downloading model from {url} ...")
        urllib.request.urlretrieve(url, path)
        return path
    return resolved


class RetraModel:
    """efficientnet classifier with ben-graham preprocessing, TTA, and grad-cam.

    not concurrency-safe (grad-cam hooks store per-call state).
    """

    def __init__(self, checkpoint="models/retra.pth", device=None):
        self.device = device or _pick_device()
        ckpt_path = _ensure_checkpoint(checkpoint)

        if os.path.exists(ckpt_path):
            ckpt = torch.load(ckpt_path, map_location=self.device)
            if isinstance(ckpt, dict) and "state_dict" in ckpt:
                name = ckpt.get("model_name", "efficientnet_b3")
                self.image_size = ckpt.get("image_size", 300)
                num_classes = ckpt.get("num_classes", 5)
                state = ckpt["state_dict"]
            else:  # legacy raw state_dict
                name, self.image_size, num_classes, state = "efficientnet_b0", 224, 5, ckpt
            self.model = timm.create_model(name, pretrained=False, num_classes=num_classes)
            self.model.load_state_dict(state)
            print(f"loaded checkpoint: {ckpt_path} ({name} @ {self.image_size})")
        else:
            name, self.image_size = "efficientnet_b3", 300
            self.model = timm.create_model(name, pretrained=False, num_classes=5)
            print(f"warning: no checkpoint at {checkpoint}, using untrained weights")

        self.model.eval().to(self.device)

        # grad-cam hooks on the last conv layer
        self._activations = None
        self._gradients = None
        self.model.conv_head.register_forward_hook(self._save_activations)
        self.model.conv_head.register_full_backward_hook(self._save_gradients)

    def _save_activations(self, module, inputs, output):
        self._activations = output.detach()

    def _save_gradients(self, module, grad_in, grad_out):
        self._gradients = grad_out[0].detach()

    def _cam(self):
        weights = self._gradients.mean(dim=(2, 3), keepdim=True)
        cam = torch.relu((weights * self._activations).sum(dim=1)).squeeze(0)
        cam -= cam.min()
        if cam.max() > 0:
            cam /= cam.max()
        return cam.cpu().numpy()

    def analyze(self, image_bytes: bytes, heatmap_path: str, tta: bool = True) -> dict:
        """classify (with TTA) + write a grad-cam overlay, return details."""
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        proc_rgb = _ben_graham(image, self.image_size)
        x = _NORMALIZE(Image.fromarray(proc_rgb)).unsqueeze(0).to(self.device)

        # prediction with test-time augmentation (no grad)
        with torch.no_grad():
            views = [x, torch.flip(x, [3]), torch.flip(x, [2])] if tta else [x]
            probs = torch.stack([torch.softmax(self.model(v), 1)[0] for v in views]).mean(0)
        class_id = int(probs.argmax())

        # grad-cam for the predicted class (single view, needs grad)
        logits = self.model(x)
        self.model.zero_grad()
        logits[0, class_id].backward()
        cam = self._cam()

        disp = cv2.cvtColor(proc_rgb, cv2.COLOR_RGB2BGR)
        cam_resized = cv2.resize(cam, (self.image_size, self.image_size))
        heat = cv2.applyColorMap(np.uint8(255 * cam_resized), cv2.COLORMAP_JET)
        overlay = cv2.addWeighted(heat, 0.4, disp, 0.6, 0)

        os.makedirs(os.path.dirname(heatmap_path) or ".", exist_ok=True)
        cv2.imwrite(heatmap_path, overlay)

        return {
            "class_id": class_id,
            "prediction": CLASSES[class_id],
            "confidence": float(probs[class_id]),
            "probabilities": {CLASSES[i]: float(p) for i, p in enumerate(probs)},
        }
