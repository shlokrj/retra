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

from transforms import val_transforms

CLASSES = {
    0: "No DR",
    1: "Mild DR",
    2: "Moderate DR",
    3: "Severe DR",
    4: "Proliferative DR",
}


def load_model(checkpoint, name="efficientnet_b0", num_classes=5, device="cpu"):
    model = timm.create_model(name, pretrained=False, num_classes=num_classes)
    state = torch.load(checkpoint, map_location=device)
    model.load_state_dict(state)
    model.eval().to(device)
    return model


def predict(model, image_path, image_size=224, device="cpu"):
    image = Image.open(image_path).convert("RGB")
    x = val_transforms(image_size)(image).unsqueeze(0).to(device)

    with torch.no_grad():
        probs = F.softmax(model(x), dim=1)[0]

    class_id = int(probs.argmax())
    return class_id, float(probs[class_id]), probs.tolist()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--image", required=True)
    parser.add_argument("--checkpoint", default="models/retra_efficientnet_b0.pth")
    args = parser.parse_args()

    device = "cuda" if torch.cuda.is_available() else "cpu"
    model = load_model(args.checkpoint, device=device)
    class_id, confidence, _ = predict(model, args.image, device=device)

    print(f"Prediction: {CLASSES[class_id]}")
    print(f"Confidence: {confidence * 100:.1f}%")


if __name__ == "__main__":
    main()
