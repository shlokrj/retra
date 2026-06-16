"""download + unzip the aptos 2019 dataset via the kaggle api.

prereqs:
    - accept the competition rules once at
      https://www.kaggle.com/competitions/aptos2019-blindness-detection/data
    - kaggle credentials at ~/.kaggle/kaggle.json (chmod 600)
    - pip install kaggle

usage:
    python ml/download_data.py
"""

import os
import subprocess
import zipfile

COMPETITION = "aptos2019-blindness-detection"
OUT_DIR = "data"


def main():
    os.makedirs(OUT_DIR, exist_ok=True)

    subprocess.run(
        ["kaggle", "competitions", "download", "-c", COMPETITION, "-p", OUT_DIR],
        check=True,
    )

    zip_path = os.path.join(OUT_DIR, f"{COMPETITION}.zip")
    print(f"extracting {zip_path} ...")
    with zipfile.ZipFile(zip_path) as z:
        z.extractall(OUT_DIR)

    print(f"done. dataset extracted under {OUT_DIR}/")


if __name__ == "__main__":
    main()
