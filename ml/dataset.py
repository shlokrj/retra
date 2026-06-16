"""aptos blindness detection dataset loader."""

import os

import pandas as pd
from PIL import Image
from torch.utils.data import Dataset


class APTOSDataset(Dataset):
    """fundus image -> dr severity label (0-4)."""

    def __init__(self, csv_path, images_dir, transform=None, ext="png"):
        self.df = pd.read_csv(csv_path)
        self.images_dir = images_dir
        self.transform = transform
        self.ext = ext

    def __len__(self):
        return len(self.df)

    def __getitem__(self, idx):
        row = self.df.iloc[idx]
        img_path = os.path.join(self.images_dir, f"{row['id_code']}.{self.ext}")
        image = Image.open(img_path).convert("RGB")

        if self.transform:
            image = self.transform(image)

        label = int(row["diagnosis"])
        return image, label

    @property
    def labels(self):
        return self.df["diagnosis"].astype(int).tolist()
