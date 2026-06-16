"""model loading + grad-cam inference for the retra api.

self-contained so the backend can build/run on its own (the Dockerfile only
copies ./backend, so it must not import from ml/).
"""

import io
import os

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


def _pick_device():
    if torch.cuda.is_available():
        return "cuda"
    if torch.backends.mps.is_available():
        return "mps"
    return "cpu"


def _transform(image_size=224):
    return T.Compose([
        T.Resize((image_size, image_size)),
        T.ToTensor(),
        T.Normalize(_IMAGENET_MEAN, _IMAGENET_STD),
    ])


def _resolve_checkpoint(path):
    """find the weights whether we're run from backend/, repo root, or docker."""
    for cand in [os.environ.get("RETRA_CHECKPOINT"), path, os.path.join("..", path)]:
        if cand and os.path.exists(cand):
            return cand
    return path


class RetraModel:
    """efficientnet-b0 classifier with built-in grad-cam (not concurrency-safe)."""

    def __init__(self, checkpoint="models/retra_efficientnet_b0.pth", device=None, image_size=224):
        self.device = device or _pick_device()
        self.image_size = image_size
        self.model = timm.create_model("efficientnet_b0", pretrained=False, num_classes=5)

        ckpt = _resolve_checkpoint(checkpoint)
        if os.path.exists(ckpt):
            self.model.load_state_dict(torch.load(ckpt, map_location=self.device))
            print(f"loaded checkpoint: {ckpt}")
        else:
            print(f"warning: no checkpoint at {checkpoint} — using untrained weights")

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

    def analyze(self, image_bytes: bytes, heatmap_path: str) -> dict:
        """classify + write a grad-cam overlay, return prediction details."""
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        x = _transform(self.image_size)(image).unsqueeze(0).to(self.device)

        logits = self.model(x)
        probs = torch.softmax(logits, dim=1)[0]
        class_id = int(probs.argmax())

        self.model.zero_grad()
        logits[0, class_id].backward()
        cam = self._cam()

        # overlay the heatmap on the (resized) original and save it
        disp = cv2.cvtColor(
            np.array(image.resize((self.image_size, self.image_size))), cv2.COLOR_RGB2BGR
        )
        cam_resized = cv2.resize(cam, (self.image_size, self.image_size))
        heat = cv2.applyColorMap(np.uint8(255 * cam_resized), cv2.COLORMAP_JET)
        overlay = cv2.addWeighted(heat, 0.4, disp, 0.6, 0)

        os.makedirs(os.path.dirname(heatmap_path) or ".", exist_ok=True)
        cv2.imwrite(heatmap_path, overlay)

        return {
            "class_id": class_id,
            "prediction": CLASSES[class_id],
            "confidence": float(probs[class_id].detach()),
            "probabilities": {CLASSES[i]: float(p.detach()) for i, p in enumerate(probs)},
        }
