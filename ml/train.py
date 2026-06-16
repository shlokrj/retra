"""train efficientnet-b0 on aptos for dr severity classification.

usage:
    python ml/train.py --config ml/config.yaml
"""

import argparse
import os
import random

import numpy as np
import timm
import torch
import torch.nn as nn
import yaml
from sklearn.metrics import accuracy_score, f1_score
from sklearn.model_selection import train_test_split
from torch.utils.data import DataLoader, Subset

from dataset import APTOSDataset
from device import pick_device
from transforms import train_transforms, val_transforms


def load_config(path):
    with open(path) as f:
        return yaml.safe_load(f)


def set_seed(seed):
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    torch.cuda.manual_seed_all(seed)


def build_model(name, num_classes, pretrained=True):
    return timm.create_model(name, pretrained=pretrained, num_classes=num_classes)


def class_weights(labels, num_classes, device):
    """balanced inverse-frequency weights for the imbalanced classes."""
    counts = np.bincount(labels, minlength=num_classes).astype(np.float32)
    counts[counts == 0] = 1.0  # guard against missing classes
    weights = len(labels) / (num_classes * counts)
    return torch.tensor(weights, dtype=torch.float32, device=device)


def make_loaders(cfg, seed):
    """stratified train/val split with separate transforms per split."""
    d = cfg["data"]
    img_size = d["image_size"]

    train_full = APTOSDataset(d["train_csv"], d["train_images"], train_transforms(img_size))
    val_full = APTOSDataset(d["train_csv"], d["train_images"], val_transforms(img_size))

    labels = train_full.labels
    idx = list(range(len(labels)))
    train_idx, val_idx = train_test_split(
        idx, test_size=cfg["train"]["val_split"], stratify=labels, random_state=seed
    )

    pin = torch.cuda.is_available()
    batch_size = cfg["train"]["batch_size"]
    train_loader = DataLoader(
        Subset(train_full, train_idx),
        batch_size=batch_size,
        shuffle=True,
        num_workers=2,
        pin_memory=pin,
    )
    val_loader = DataLoader(
        Subset(val_full, val_idx),
        batch_size=batch_size,
        shuffle=False,
        num_workers=2,
        pin_memory=pin,
    )
    train_labels = [labels[i] for i in train_idx]
    return train_loader, val_loader, train_labels


def train_one_epoch(model, loader, criterion, optimizer, device):
    model.train()
    running = 0.0
    for images, targets in loader:
        images, targets = images.to(device), targets.to(device)
        optimizer.zero_grad()
        loss = criterion(model(images), targets)
        loss.backward()
        optimizer.step()
        running += loss.item() * images.size(0)
    return running / len(loader.dataset)


@torch.no_grad()
def evaluate(model, loader, device):
    """return accuracy + macro f1 on the val set."""
    model.eval()
    preds, gts = [], []
    for images, targets in loader:
        images = images.to(device)
        logits = model(images)
        preds.extend(logits.argmax(dim=1).cpu().tolist())
        gts.extend(targets.tolist())
    acc = accuracy_score(gts, preds)
    f1 = f1_score(gts, preds, average="macro")
    return acc, f1


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--config", default="ml/config.yaml")
    args = parser.parse_args()

    cfg = load_config(args.config)
    device = pick_device()
    set_seed(cfg["train"]["seed"])
    print(f"device: {device}")

    train_loader, val_loader, train_labels = make_loaders(cfg, cfg["train"]["seed"])
    print(f"train: {len(train_loader.dataset)}  val: {len(val_loader.dataset)}")

    model = build_model(
        cfg["model"]["name"], cfg["data"]["num_classes"], cfg["model"]["pretrained"]
    ).to(device)

    weight = (
        class_weights(train_labels, cfg["data"]["num_classes"], device)
        if cfg["train"]["weighted_loss"]
        else None
    )
    criterion = nn.CrossEntropyLoss(weight=weight)
    optimizer = torch.optim.AdamW(
        model.parameters(), lr=cfg["train"]["lr"], weight_decay=cfg["train"]["weight_decay"]
    )

    checkpoint = cfg["paths"]["checkpoint"]
    os.makedirs(cfg["paths"]["out_dir"], exist_ok=True)

    best_f1 = 0.0
    for epoch in range(1, cfg["train"]["epochs"] + 1):
        loss = train_one_epoch(model, train_loader, criterion, optimizer, device)
        acc, f1 = evaluate(model, val_loader, device)
        print(f"epoch {epoch:2d}/{cfg['train']['epochs']}  loss {loss:.4f}  acc {acc:.4f}  f1 {f1:.4f}")

        if f1 > best_f1:
            best_f1 = f1
            torch.save(model.state_dict(), checkpoint)
            print(f"  saved best -> {checkpoint} (f1 {f1:.4f})")

    print(f"done. best val f1: {best_f1:.4f}")


if __name__ == "__main__":
    main()
