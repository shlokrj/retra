"""run a trained retra model on a single fundus image.

usage:
    python ml/infer.py --image sample_retina.png

output:
    Prediction: Moderate DR
    Confidence: 91.4%
"""

import argparse

import timm
import torch
import torch.nn.functional as F
from PIL import Image

from device import pick_device
from transforms import val_transforms

CLASSES = {
    0: "No DR",
    1: "Mild DR",
    2: "Moderate DR",
    3: "Severe DR",
    4: "Proliferative DR",
}


def load_model(checkpoint, device="cpu"):
    """load a self-describing checkpoint; returns (model, image_size)."""
    ckpt = torch.load(checkpoint, map_location=device)
    if isinstance(ckpt, dict) and "state_dict" in ckpt:
        name = ckpt.get("model_name", "efficientnet_b3")
        num_classes = ckpt.get("num_classes", 5)
        image_size = ckpt.get("image_size", 300)
        state = ckpt["state_dict"]
    else:  # legacy: raw state_dict from the old b0 baseline
        name, num_classes, image_size, state = "efficientnet_b0", 5, 224, ckpt

    model = timm.create_model(name, pretrained=False, num_classes=num_classes)
    model.load_state_dict(state)
    model.eval().to(device)
    return model, image_size


def predict(model, image_path, image_size, device="cpu", tta=True):
    """predict with optional test-time augmentation (orig + h/v flips)."""
    image = Image.open(image_path).convert("RGB")
    x = val_transforms(image_size)(image).unsqueeze(0).to(device)
    views = [x, torch.flip(x, dims=[3]), torch.flip(x, dims=[2])] if tta else [x]

    with torch.no_grad():
        probs = torch.stack([F.softmax(model(v), dim=1)[0] for v in views]).mean(0)

    class_id = int(probs.argmax())
    return class_id, float(probs[class_id]), probs.tolist()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--image", required=True)
    parser.add_argument("--checkpoint", default="models/retra.pth")
    parser.add_argument("--no-tta", action="store_true")
    args = parser.parse_args()

    device = pick_device()
    model, image_size = load_model(args.checkpoint, device=device)
    class_id, confidence, _ = predict(
        model, args.image, image_size, device=device, tta=not args.no_tta
    )

    print(f"Prediction: {CLASSES[class_id]}")
    print(f"Confidence: {confidence * 100:.1f}%")


if __name__ == "__main__":
    main()
