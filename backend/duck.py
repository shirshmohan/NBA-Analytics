import duckdb
from pathlib import Path

PARQUET_PATH = r"C:\Users\KIIT0001\Documents\IM_CRAZY_BRUH\PlayByPlay.parquet"         # your big parquet (823MB)
OUT_CSV      = r"C:\Users\KIIT0001\Documents\IM_CRAZY_BRUH\trial_2025.csv" # output sample
N_GAMES      = 25

con = duckdb.connect()

# 1) Pick 25 distinct gameIds from 2025
#    (cast protects you if gameDateTimeEst is a string)
game_ids = con.execute(f"""
    WITH games AS (
      SELECT DISTINCT gameId
      FROM read_parquet('{PARQUET_PATH}')
      WHERE EXTRACT(year FROM CAST(gameDateTimeEst AS TIMESTAMP)) = 2025
    )
    SELECT gameId
    FROM games
    USING SAMPLE {N_GAMES} ROWS
""").fetchall()

game_ids = [g[0] for g in game_ids]
print("Picked gameIds:", game_ids[:5], "... total:", len(game_ids))

# 2) Export all play-by-play rows for those games
#    ORDER BY ensures event sequence is correct
con.execute(f"""
COPY (
  SELECT *
  FROM read_parquet('{PARQUET_PATH}')
  WHERE gameId IN ({",".join(["?"]*len(game_ids))})
  ORDER BY gameId, period, actionNumber, orderNumber
)
TO '{OUT_CSV}' (HEADER, DELIMITER ',');
""", game_ids)

print("Wrote:", OUT_CSV)