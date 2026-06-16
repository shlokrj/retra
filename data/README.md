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
2. Create an API token: Kaggle → Account → "Create New API Token". Save the
   downloaded `kaggle.json` to `~/.kaggle/kaggle.json` and lock it down:

   ```bash
   mkdir -p ~/.kaggle && mv ~/Downloads/kaggle.json ~/.kaggle/
   chmod 600 ~/.kaggle/kaggle.json
   ```
3. Fetch + unzip everything into `data/`:

   ```bash
   pip install kaggle
   python ml/download_data.py
   ```

   (or manually: `kaggle competitions download -c aptos2019-blindness-detection -p data/` then unzip.)

## Labels

```text
0 = No DR
1 = Mild
2 = Moderate
3 = Severe
4 = Proliferative DR
```
