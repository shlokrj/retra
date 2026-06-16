"""download the aptos 2019 dataset via kagglehub and link it into data/.

prereqs:
    pip install kagglehub
    (kagglehub uses your kaggle credentials; accept the competition rules once at
     https://www.kaggle.com/competitions/aptos2019-blindness-detection/data)

usage:
    python ml/download_data.py
"""

import os

import kagglehub

COMPETITION = "aptos2019-blindness-detection"
DATA_DIR = "data"
ITEMS = ["train.csv", "train_images", "test.csv", "test_images"]


def main():
    src = kagglehub.competition_download(COMPETITION)
    print(f"downloaded to: {src}")

    os.makedirs(DATA_DIR, exist_ok=True)
    for name in ITEMS:
        target = os.path.join(src, name)
        link = os.path.join(DATA_DIR, name)
        if os.path.exists(target) and not os.path.exists(link):
            os.symlink(target, link)
            print(f"linked {link} -> {target}")

    print(f"done. {DATA_DIR}/ now points at the dataset.")


if __name__ == "__main__":
    main()
