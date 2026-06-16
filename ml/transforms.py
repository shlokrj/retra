"""fundus preprocessing + augmentation for retra.

ben-graham style preprocessing: crop to the fundus circle, resize, then enhance
local contrast (subtract a gaussian blur). this is the single biggest win on
aptos-style retinopathy data; it makes microaneurysms / haemorrhages pop.
"""

import cv2
import numpy as np
import torchvision.transforms as T
from PIL import Image

IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD = [0.229, 0.224, 0.225]


def crop_to_circle(img):
    """trim the black border around the circular fundus. img is uint8 RGB."""
    gray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)
    mask = gray > 7
    coords = np.argwhere(mask)
    if coords.size == 0:
        return img
    y0, x0 = coords.min(axis=0)
    y1, x1 = coords.max(axis=0) + 1
    return img[y0:y1, x0:x1]


def ben_graham(img, size, sigma_frac=30.0):
    """crop + resize + local-contrast enhance. img is uint8 RGB, returns RGB."""
    img = crop_to_circle(img)
    img = cv2.resize(img, (size, size))
    blur = cv2.GaussianBlur(img, (0, 0), size / sigma_frac)
    img = cv2.addWeighted(img, 4, blur, -4, 128)
    return img


class FundusPreprocess:
    """ben-graham preprocessing as a torchvision-compatible transform."""

    def __init__(self, size):
        self.size = size

    def __call__(self, pil_img):
        arr = np.array(pil_img.convert("RGB"))
        return Image.fromarray(ben_graham(arr, self.size))


def train_transforms(image_size=300):
    return T.Compose([
        FundusPreprocess(image_size),
        T.RandomResizedCrop(image_size, scale=(0.85, 1.0), ratio=(0.9, 1.1)),
        T.RandomHorizontalFlip(),
        T.RandomVerticalFlip(),
        T.RandomRotation(30),
        T.ColorJitter(brightness=0.1, contrast=0.1),
        T.ToTensor(),
        T.Normalize(IMAGENET_MEAN, IMAGENET_STD),
        T.RandomErasing(p=0.25),
    ])


def val_transforms(image_size=300):
    return T.Compose([
        FundusPreprocess(image_size),
        T.ToTensor(),
        T.Normalize(IMAGENET_MEAN, IMAGENET_STD),
    ])


def preprocess_display(pil_img, image_size):
    """processed image as BGR uint8, keeps grad-cam overlay aligned with input."""
    arr = np.array(pil_img.convert("RGB"))
    return cv2.cvtColor(ben_graham(arr, image_size), cv2.COLOR_RGB2BGR)
