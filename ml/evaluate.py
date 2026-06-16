"""evaluate a trained model: accuracy, macro f1, confusion matrix.

reconstructs the same stratified val split used in training (same seed).

usage:
    python ml/evaluate.py --checkpoint models/retra_efficientnet_b0.pth
"""

import argparse
import os

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt  # noqa: E402
import numpy as np  # noqa: E402
import timm  # noqa: E402
import torch  # noqa: E402
from sklearn.metrics import (  # noqa: E402
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
)

from device import pick_device  # noqa: E402
from train import load_config, make_loaders  # noqa: E402

CLASS_NAMES = ["No DR", "Mild", "Moderate", "Severe", "Proliferative"]


@torch.no_grad()
def collect_preds(model, loader, device):
    model.eval()
    preds, gts = [], []
    for images, targets in loader:
        logits = model(images.to(device))
        preds.extend(logits.argmax(1).cpu().tolist())
        gts.extend(targets.tolist())
    return np.array(gts), np.array(preds)


def save_confusion_matrix(cm, out_path):
    fig, ax = plt.subplots(figsize=(5, 4.5))
    im = ax.imshow(cm, cmap="Blues")
    ax.set_xticks(range(5), CLASS_NAMES, rotation=45, ha="right")
    ax.set_yticks(range(5), CLASS_NAMES)
    ax.set_xlabel("predicted")
    ax.set_ylabel("true")
    ax.set_title("Retra — confusion matrix (val)")
    thresh = cm.max() / 2
    for i in range(5):
        for j in range(5):
            ax.text(j, i, cm[i, j], ha="center", va="center",
                    color="white" if cm[i, j] > thresh else "black")
    fig.colorbar(im)
    fig.tight_layout()
    os.makedirs(os.path.dirname(out_path) or ".", exist_ok=True)
    fig.savefig(out_path, dpi=120)
    print(f"saved confusion matrix -> {out_path}")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--checkpoint", default="models/retra_efficientnet_b0.pth")
    parser.add_argument("--config", default="ml/config.yaml")
    parser.add_argument("--cm-out", default="docs/confusion_matrix.png")
    args = parser.parse_args()

    cfg = load_config(args.config)
    device = pick_device()

    _, val_loader, _ = make_loaders(cfg, cfg["train"]["seed"])
    model = timm.create_model(
        cfg["model"]["name"], pretrained=False, num_classes=cfg["data"]["num_classes"]
    )
    model.load_state_dict(torch.load(args.checkpoint, map_location=device))
    model.to(device)

    gts, preds = collect_preds(model, val_loader, device)
    print(f"accuracy: {accuracy_score(gts, preds):.4f}")
    print(f"macro f1: {f1_score(gts, preds, average='macro'):.4f}")
    print(classification_report(gts, preds, target_names=CLASS_NAMES, digits=3))

    save_confusion_matrix(confusion_matrix(gts, preds), args.cm_out)


if __name__ == "__main__":
    main()
