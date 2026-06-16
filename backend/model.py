"""model loading + inference helpers for the retra api.

kept standalone from ml/ so the backend can run on its own.
"""

import io

import timm
import torch
import torch.nn.functional as F
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


def _transform(image_size=224):
    return T.Compose([
        T.Resize((image_size, image_size)),
        T.ToTensor(),
        T.Normalize(_IMAGENET_MEAN, _IMAGENET_STD),
    ])


class RetraModel:
    def __init__(self, checkpoint="models/retra_efficientnet_b0.pth", device=None):
        self.device = device or ("cuda" if torch.cuda.is_available() else "cpu")
        self.model = timm.create_model(
            "efficientnet_b0", pretrained=False, num_classes=5
        )
        # TODO: load_state_dict from checkpoint once a trained model exists
        self.model.eval().to(self.device)

    def predict(self, image_bytes: bytes) -> dict:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        x = _transform()(image).unsqueeze(0).to(self.device)

        with torch.no_grad():
            probs = F.softmax(self.model(x), dim=1)[0]

        class_id = int(probs.argmax())
        return {
            "class_id": class_id,
            "prediction": CLASSES[class_id],
            "confidence": float(probs[class_id]),
            "probabilities": {CLASSES[i]: float(p) for i, p in enumerate(probs)},
        }
