import os, glob, shutil
import pandas as pd
import kagglehub

# 1) Download dataset
path = kagglehub.dataset_download("jordanmccorey/statistical-dataset-of-mvp-recipients-in-the-nba")
print("Downloaded to:", path)

# 2) Choose your local output folder (change this)
OUT_FOLDER = r"C:\Users\KIIT0001\Desktop\NBA_Datasets\MVP"
os.makedirs(OUT_FOLDER, exist_ok=True)

# 3) Find files and convert to CSV into OUT_FOLDER
files = [f for f in glob.glob(os.path.join(path, "**", "*"), recursive=True) if os.path.isfile(f)]

for f in files:
    name, ext = os.path.splitext(os.path.basename(f))
    ext = ext.lower()

    if ext == ".csv":
        # Just copy csv as-is
        dst = os.path.join(OUT_FOLDER, os.path.basename(f))
        shutil.copy2(f, dst)
        print("Copied CSV:", dst)

    elif ext in [".xlsx", ".xls"]:
        xls = pd.ExcelFile(f)
        for sheet in xls.sheet_names:
            df = pd.read_excel(f, sheet_name=sheet)
            out = os.path.join(OUT_FOLDER, f"{name}__{sheet}.csv")
            df.to_csv(out, index=False)
            print("Saved:", out)

    elif ext == ".parquet":
        df = pd.read_parquet(f)
        out = os.path.join(OUT_FOLDER, f"{name}.csv")
        df.to_csv(out, index=False)
        print("Saved:", out)

    elif ext == ".json":
        df = pd.read_json(f)
        out = os.path.join(OUT_FOLDER, f"{name}.csv")
        df.to_csv(out, index=False)
        print("Saved:", out)

    else:
        print("Skipping unsupported:", f)

print("All exported to:", OUT_FOLDER)
