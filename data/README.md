# data

This folder is ignored by git. Download the
[Kaggle APTOS 2019 Blindness Detection](https://www.kaggle.com/c/aptos2019-blindness-detection)
dataset and lay it out like this:

```text
data/
├── train_images/      # fundus images (id_code.png)
└── train.csv          # id_code, diagnosis (0-4)
```

Labels:

```text
0 = No DR
1 = Mild
2 = Moderate
3 = Severe
4 = Proliferative DR
```
