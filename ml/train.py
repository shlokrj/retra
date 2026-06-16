"""train efficientnet-b0 on aptos for dr severity classification.

usage:
    python ml/train.py --config ml/config.yaml
"""

import argparse

import timm
import torch
import torch.nn as nn
import yaml
from torch.utils.data import DataLoader, random_split

from dataset import APTOSDataset
from transforms import train_transforms, val_transforms


def load_config(path):
    with open(path) as f:
        return yaml.safe_load(f)


def build_model(name, num_classes, pretrained=True):
    return timm.create_model(name, pretrained=pretrained, num_classes=num_classes)


def class_weights(labels, num_classes):
    """inverse-frequency weights for the imbalanced classes."""
    # TODO: count per-class frequency and return a weight tensor
    ...


def train_one_epoch(model, loader, criterion, optimizer, device):
    # TODO: standard training loop, return avg loss
    ...


def evaluate(model, loader, device):
    # TODO: return accuracy + macro f1 on the val set
    ...


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--config", default="ml/config.yaml")
    args = parser.parse_args()

    cfg = load_config(args.config)
    device = "cuda" if torch.cuda.is_available() else "cpu"

    # TODO: build dataset + train/val split + loaders
    # TODO: build model, weighted CrossEntropyLoss, optimizer
    # TODO: train loop tracking accuracy + f1, save best checkpoint
    print("training not implemented yet")


if __name__ == "__main__":
    main()
