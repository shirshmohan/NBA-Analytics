import os
import duckdb

# 1) Path to your big parquet file
INPUT_PARQUET = r"C:\Users\KIIT0001\Documents\IM_CRAZY_BRUH\PlayByPlay.parquet"

# 2) Output folder in Documents
OUT_DIR = r"C:\Users\KIIT0001\Documents\pbp_by_game_parquet"
os.makedirs(OUT_DIR, exist_ok=True)

con = duckdb.connect()  # in-memory DB (fast)

# Load once (so we don't scan the big parquet repeatedly)
con.execute("""
    CREATE TEMP TABLE pbp AS
    SELECT
        CAST(gameid AS VARCHAR) AS gameid,
        CAST(actionNumber AS BIGINT) AS actionNumber,
        * EXCLUDE (gameid, actionNumber)
    FROM read_parquet(?)
""", [INPUT_PARQUET])

# Get list of games
game_ids = [row[0] for row in con.execute("SELECT DISTINCT gameid FROM pbp ORDER BY gameid").fetchall()]
print("Total games:", len(game_ids))

# Export one parquet per game, sorted by actionNumber
for gid in game_ids:
    out_file = os.path.join(OUT_DIR, f"{gid}.parquet")

    con.execute(f"""
        COPY (
            SELECT * FROM pbp
            WHERE gameid = ?
            ORDER BY actionNumber ASC
        )
        TO ?
        (FORMAT PARQUET, COMPRESSION ZSTD);
    """, [gid, out_file])

print("Done. Output folder:", OUT_DIR)