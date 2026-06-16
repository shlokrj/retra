# data

This folder is ignored by git. It holds the
[Kaggle APTOS 2019 Blindness Detection](https://www.kaggle.com/competitions/aptos2019-blindness-detection/data)
dataset, laid out like this:

```text
data/
├── train_images/      # fundus images (id_code.png)
├── train.csv          # id_code, diagnosis (0-4)
├── test_images/       # (unused for training)
└── test.csv
```

## Download

1. Accept the competition rules on the
   [APTOS data page](https://www.kaggle.com/competitions/aptos2019-blindness-detection/data)
   (required, one-time, while signed in to Kaggle).
2. Fetch the dataset and link it into `data/`:

   ```bash
   pip install kagglehub
   python ml/download_data.py
   ```

   This downloads via `kagglehub` (using your Kaggle credentials) and symlinks
   `train_images/`, `train.csv`, etc. into `data/`.

## Labels

```text
0 = No DR
1 = Mild
2 = Moderate
3 = Severe
4 = Proliferative DR
```
