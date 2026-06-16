"""grad-cam heatmaps for retra predictions.

    input image -> model prediction -> grad-cam -> heatmap overlay

produces a side-by-side panel: original | heatmap | overlay

usage:
    python ml/gradcam.py --image sample_retina.png
"""

import argparse

import cv2
import numpy as np
import torch


class GradCAM:
    """class activation map from gradients of the last conv block."""

    def __init__(self, model, target_layer):
        self.model = model
        self.target_layer = target_layer
        self.activations = None
        self.gradients = None
        # TODO: register forward + backward hooks on target_layer

    def generate(self, input_tensor, class_idx=None):
        # TODO: forward, backprop target class, pool gradients, weight activations
        ...


def overlay_heatmap(image, cam, alpha=0.4):
    """colormap the cam and blend it over the original image."""
    # TODO: resize cam, apply COLORMAP_JET, blend with image
    ...


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--image", required=True)
    parser.add_argument("--checkpoint", default="models/retra_efficientnet_b0.pth")
    parser.add_argument("--out", default="backend/outputs/heatmap.png")
    args = parser.parse_args()

    # TODO: load model, run gradcam, write original|heatmap|overlay panel to --out
    print("grad-cam not implemented yet")


if __name__ == "__main__":
    main()
