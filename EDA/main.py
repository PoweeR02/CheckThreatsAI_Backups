import pandas as pd
from sklearn.utils import resample

df = pd.read_csv("../Datasets/Csv/Windows_Malware_Detection_Dataset.csv", sep=",")

print(df.shape)
print(df.columns)
print(df.info)
print(df.describe())
print(df.nunique())
print(df.isnull().sum())
print(df.dropna())
print(df.dropna(axis='columns'))

df_benign = df[df["Type"] == 0]
df_snake = df[df["Type"] == 5]
df_spyware = df[df["Type"] == 6]

df_benign_duplicated = pd.concat([df_benign , df_benign], ignore_index=True)
df_benign_duplicated_resampled = resample(df_benign_duplicated, replace=True, n_samples=4600, random_state=42)
df_snake_resampled = resample(df_snake , replace=True, n_samples=4600, random_state=42)
df_spyware_resampled = resample(df_spyware , replace=True, n_samples=4600, random_state=42)

df_filtered = df[~df["Type"].isin([0, 5, 6])]

df_balanced = pd.concat([df_benign_duplicated_resampled, df_filtered , df_snake_resampled , df_spyware_resampled])

for column in df_balanced.columns[1:]:
    print(df_balanced[column].value_counts())

columns_to_drop = []

for column in df_balanced.columns[2:]:
    count_0 = (df_balanced[column] == 0).sum()
    if count_0 == len(df_balanced) or count_0 == 0:
        columns_to_drop.append(column)

df_cleaned = df_balanced.drop(columns=columns_to_drop)

df_cleaned.to_excel("Windows_Malware_Detection_Balanced_&_Cleaned_v2.0.xlsx", index=False)