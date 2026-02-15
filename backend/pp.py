import os
import pyarrow.parquet as pq

parquet_path = r"C:\Users\KIIT0001\Documents\IM_CRAZY_BRUH\playbyplay.parquet"  # <-- put actual file name here
print("Rows:", pq.ParquetFile(parquet_path).metadata.num_rows)


