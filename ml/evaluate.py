"""evaluate a trained model: accuracy, macro f1, confusion matrix.

usage:
    python ml/evaluate.py --checkpoint models/retra_efficientnet_b0.pth
"""

import argparse

import torch
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--checkpoint", default="models/retra_efficientnet_b0.pth")
    parser.add_argument("--config", default="ml/config.yaml")
    args = parser.parse_args()

    # TODO: load model + held-out val set
    # TODO: run predictions, print accuracy + macro f1 + classification report
    # TODO: save confusion matrix png to docs/
    print("evaluation not implemented yet")


if __name__ == "__main__":
    main()
