import os
import duckdb
import os

PARQUET_PATH = "C:/Users/KIIT0001/Documents/pbp_by_game_parquet"

def get_game_file(game_id: str):
    # Add the .parquet extension here
    path = os.path.join(PARQUET_PATH, f"{game_id}.parquet")
    # Replace backslashes with forward slashes for DuckDB
    return path.replace("\\", "/")

def run_query(query: str, params: list = None):
    # DuckDB's execute can take params as a list for '?' placeholders
    return duckdb.execute(query, params).df().to_dict(orient="records")