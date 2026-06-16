"""train an efficientnet on aptos for dr severity classification.

strong recipe: ben-graham preprocessing, class-weighted + label-smoothed loss,
cosine lr with warmup, EMA weights, and model selection on quadratic weighted
kappa (the actual DR metric) with early stopping.

usage:
    python ml/train.py --config ml/config.yaml
"""

import argparse
import copy
import os
import random

import numpy as np
import timm
import torch
import torch.nn as nn
import yaml
from sklearn.metrics import accuracy_score, cohen_kappa_score, f1_score
from sklearn.model_selection import train_test_split
from torch.optim.lr_scheduler import CosineAnnealingLR, LinearLR, SequentialLR
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


def class_weights(labels, num_classes, device, power=1.0):
    """inverse-frequency weights, raised to `power` (lower = softer)."""
    counts = np.bincount(labels, minlength=num_classes).astype(np.float32)
    counts[counts == 0] = 1.0
    weights = (len(labels) / (num_classes * counts)) ** power
    return torch.tensor(weights, dtype=torch.float32, device=device)


class EMA:
    """exponential moving average of model weights (version-independent)."""

    def __init__(self, model, decay):
        self.decay = decay
        self.shadow = {k: v.detach().clone() for k, v in model.state_dict().items()}

    @torch.no_grad()
    def update(self, model):
        for k, v in model.state_dict().items():
            if v.dtype.is_floating_point:
                self.shadow[k].mul_(self.decay).add_(v.detach(), alpha=1 - self.decay)
            else:
                self.shadow[k] = v.detach().clone()

    def copy_to(self, model):
        model.load_state_dict(self.shadow, strict=True)


def make_loaders(cfg, seed):
    """stratified train/val split with separate transforms per split."""
    d = cfg["data"]
    size = d["image_size"]

    train_full = APTOSDataset(d["train_csv"], d["train_images"], train_transforms(size))
    val_full = APTOSDataset(d["train_csv"], d["train_images"], val_transforms(size))

    labels = train_full.labels
    idx = list(range(len(labels)))
    train_idx, val_idx = train_test_split(
        idx, test_size=cfg["train"]["val_split"], stratify=labels, random_state=seed
    )

    pin = torch.cuda.is_available()
    bs = cfg["train"]["batch_size"]
    train_loader = DataLoader(
        Subset(train_full, train_idx), batch_size=bs, shuffle=True,
        num_workers=4, pin_memory=pin, drop_last=True,
    )
    val_loader = DataLoader(
        Subset(val_full, val_idx), batch_size=bs, shuffle=False,
        num_workers=4, pin_memory=pin,
    )
    return train_loader, val_loader, [labels[i] for i in train_idx]


def build_scheduler(optimizer, epochs, warmup_epochs):
    warmup = LinearLR(optimizer, start_factor=0.1, total_iters=warmup_epochs)
    cosine = CosineAnnealingLR(optimizer, T_max=max(1, epochs - warmup_epochs))
    return SequentialLR(optimizer, [warmup, cosine], milestones=[warmup_epochs])


def train_one_epoch(model, loader, criterion, optimizer, ema, device):
    model.train()
    running = 0.0
    for images, targets in loader:
        images, targets = images.to(device), targets.to(device)
        optimizer.zero_grad()
        loss = criterion(model(images), targets)
        loss.backward()
        optimizer.step()
        ema.update(model)
        running += loss.item() * images.size(0)
    return running / len(loader.dataset)


@torch.no_grad()
def evaluate(model, loader, device):
    """return accuracy, macro f1, and quadratic weighted kappa."""
    model.eval()
    preds, gts = [], []
    for images, targets in loader:
        logits = model(images.to(device))
        preds.extend(logits.argmax(dim=1).cpu().tolist())
        gts.extend(targets.tolist())
    acc = accuracy_score(gts, preds)
    f1 = f1_score(gts, preds, average="macro")
    qwk = cohen_kappa_score(gts, preds, weights="quadratic")
    return acc, f1, qwk


def save_resume(path, model, ema, optimizer, scheduler, epoch, best_qwk, meta):
    """full training state so a run can continue exactly where it stopped."""
    torch.save({
        **meta,
        "state_dict": model.state_dict(),
        "ema_shadow": ema.shadow,
        "optim_state": optimizer.state_dict(),
        "sched_state": scheduler.state_dict(),
        "epoch": epoch,
        "best_qwk": best_qwk,
    }, path)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--config", default="ml/config.yaml")
    parser.add_argument("--resume", default=None,
                        help="checkpoint to continue from (weights-only or a *_last full state)")
    args = parser.parse_args()

    cfg = load_config(args.config)
    tcfg = cfg["train"]
    device = pick_device()
    set_seed(tcfg["seed"])
    print(f"device: {device}  model: {cfg['model']['name']}  size: {cfg['data']['image_size']}")

    train_loader, val_loader, train_labels = make_loaders(cfg, tcfg["seed"])
    print(f"train: {len(train_loader.dataset)}  val: {len(val_loader.dataset)}")

    model = timm.create_model(
        cfg["model"]["name"], pretrained=cfg["model"]["pretrained"],
        num_classes=cfg["data"]["num_classes"],
    ).to(device)

    weight = (
        class_weights(train_labels, cfg["data"]["num_classes"], device,
                      power=tcfg.get("weight_power", 1.0))
        if tcfg["weighted_loss"] else None
    )
    criterion = nn.CrossEntropyLoss(weight=weight, label_smoothing=tcfg["label_smoothing"])
    optimizer = torch.optim.AdamW(model.parameters(), lr=tcfg["lr"], weight_decay=tcfg["weight_decay"])
    scheduler = build_scheduler(optimizer, tcfg["epochs"], tcfg["warmup_epochs"])

    meta = {
        "model_name": cfg["model"]["name"],
        "image_size": cfg["data"]["image_size"],
        "num_classes": cfg["data"]["num_classes"],
    }
    checkpoint = cfg["paths"]["checkpoint"]
    base, ext = os.path.splitext(checkpoint)
    resume_path = base + "_last" + ext
    os.makedirs(cfg["paths"]["out_dir"], exist_ok=True)

    start_epoch, best_qwk, exact = 1, -1.0, False
    if args.resume and os.path.exists(args.resume):
        ck = torch.load(args.resume, map_location=device)
        model.load_state_dict(ck["state_dict"])
        ema = EMA(model, tcfg["ema_decay"])
        if "ema_shadow" in ck:
            ema.shadow = {k: v.to(device) for k, v in ck["ema_shadow"].items()}
        if "optim_state" in ck:  # exact resume from a *_last full-state checkpoint
            optimizer.load_state_dict(ck["optim_state"])
            scheduler.load_state_dict(ck["sched_state"])
            start_epoch = ck.get("epoch", 0) + 1
            best_qwk = ck.get("best_qwk", -1.0)
            exact = True
            print(f"resumed exactly from epoch {start_epoch - 1} (best qwk {best_qwk:.4f})")
    else:
        ema = EMA(model, tcfg["ema_decay"])

    ema_model = copy.deepcopy(model)
    ema.copy_to(ema_model)

    if args.resume and os.path.exists(args.resume) and not exact:
        # warm-start: floor best_qwk at the loaded model so we never regress the saved best
        _, _, best_qwk = evaluate(ema_model, val_loader, device)
        print(f"warm-start from weights; current val qwk {best_qwk:.4f}")

    bad_epochs = 0
    for epoch in range(start_epoch, tcfg["epochs"] + 1):
        loss = train_one_epoch(model, train_loader, criterion, optimizer, ema, device)
        ema.copy_to(ema_model)
        acc, f1, qwk = evaluate(ema_model, val_loader, device)
        lr = optimizer.param_groups[0]["lr"]
        scheduler.step()
        print(f"epoch {epoch:2d}/{tcfg['epochs']}  loss {loss:.4f}  acc {acc:.4f}  "
              f"f1 {f1:.4f}  qwk {qwk:.4f}  lr {lr:.2e}")

        improved = qwk > best_qwk
        if improved:
            best_qwk, bad_epochs = qwk, 0
            torch.save({**meta, "state_dict": ema_model.state_dict()}, checkpoint)
            print(f"  saved best -> {checkpoint} (qwk {qwk:.4f})")
        else:
            bad_epochs += 1

        save_resume(resume_path, model, ema, optimizer, scheduler, epoch, best_qwk, meta)

        if not improved and bad_epochs >= tcfg["patience"]:
            print(f"early stop: no qwk gain for {tcfg['patience']} epochs")
            break

    print(f"done. best val qwk: {best_qwk:.4f}")


if __name__ == "__main__":
    main()
