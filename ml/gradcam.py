"""grad-cam heatmaps for retra predictions.

    input image -> model prediction -> grad-cam -> heatmap overlay

produces a side-by-side panel: original | heatmap | overlay

usage:
    python ml/gradcam.py --image sample_retina.png
"""

import argparse
import os

import cv2
import numpy as np
import torch
from PIL import Image

from device import pick_device
from infer import CLASSES, load_model
from transforms import val_transforms


class GradCAM:
    """class activation map from gradients of a target conv layer."""

    def __init__(self, model, target_layer):
        self.model = model
        self.activations = None
        self.gradients = None
        target_layer.register_forward_hook(self._save_activations)
        target_layer.register_full_backward_hook(self._save_gradients)

    def _save_activations(self, module, inputs, output):
        self.activations = output.detach()

    def _save_gradients(self, module, grad_in, grad_out):
        self.gradients = grad_out[0].detach()

    def generate(self, input_tensor, class_idx=None):
        """returns (cam[H,W] in 0..1, class_idx, confidence)."""
        self.model.eval()
        logits = self.model(input_tensor)
        probs = torch.softmax(logits, dim=1)[0]
        if class_idx is None:
            class_idx = int(probs.argmax())

        self.model.zero_grad()
        logits[0, class_idx].backward()

        # weight each activation channel by its mean gradient, then relu
        weights = self.gradients.mean(dim=(2, 3), keepdim=True)
        cam = torch.relu((weights * self.activations).sum(dim=1)).squeeze(0)
        cam -= cam.min()
        if cam.max() > 0:
            cam /= cam.max()
        return cam.cpu().numpy(), class_idx, float(probs[class_idx].detach())


def overlay_heatmap(image_bgr, cam, alpha=0.4):
    """colormap the cam and blend it over the original image."""
    h, w = image_bgr.shape[:2]
    cam_resized = cv2.resize(cam, (w, h))
    heatmap = cv2.applyColorMap(np.uint8(255 * cam_resized), cv2.COLORMAP_JET)
    overlay = cv2.addWeighted(heatmap, alpha, image_bgr, 1 - alpha, 0)
    return heatmap, overlay


def _label(panel, text, x):
    cv2.putText(panel, text, (x + 8, 22), cv2.FONT_HERSHEY_SIMPLEX, 0.6,
                (255, 255, 255), 1, cv2.LINE_AA)


def run_gradcam(model, image_path, out_path, device, image_size=224, target_layer=None):
    """run grad-cam on one image, write the original|heatmap|overlay panel."""
    target_layer = target_layer or model.conv_head  # last conv in efficientnet-b0
    cam_engine = GradCAM(model, target_layer)

    pil = Image.open(image_path).convert("RGB")
    x = val_transforms(image_size)(pil).unsqueeze(0).to(device)
    disp = cv2.cvtColor(np.array(pil.resize((image_size, image_size))), cv2.COLOR_RGB2BGR)

    cam, class_idx, confidence = cam_engine.generate(x)
    heatmap, overlay = overlay_heatmap(disp, cam)

    panel = np.hstack([disp, heatmap, overlay])
    for i, name in enumerate(["original", "heatmap", "overlay"]):
        _label(panel, name, i * image_size)

    os.makedirs(os.path.dirname(out_path) or ".", exist_ok=True)
    cv2.imwrite(out_path, panel)
    return class_idx, confidence


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--image", required=True)
    parser.add_argument("--checkpoint", default="models/retra_efficientnet_b0.pth")
    parser.add_argument("--out", default="backend/outputs/heatmap.png")
    args = parser.parse_args()

    device = pick_device()
    model = load_model(args.checkpoint, device=device)
    class_idx, confidence = run_gradcam(model, args.image, args.out, device)

    print(f"Prediction: {CLASSES[class_idx]}")
    print(f"Confidence: {confidence * 100:.1f}%")
    print(f"Saved heatmap panel -> {args.out}")


if __name__ == "__main__":
    main()
