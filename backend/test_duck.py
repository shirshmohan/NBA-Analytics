import duckdb
import os

con = duckdb.connect(database=':memory:')

def get_game_file(game_id):
    # Your local path
    return rf"C:\Users\KIIT0001\Documents\pbp_by_game_parquet\{game_id}.parquet"

def run_test(game_id, query_name, query_sql):
    file_path = get_game_file(game_id)
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        return

    print(f"\n--- TESTING: {query_name} ---")
    try:
        df = con.execute(query_sql).df()
        if df.empty:
            print(f"Query ran but returned 0 results. Check filters (e.g., 'Made' vs 'made').")
        else:
            print(df.head(20))
    except Exception as e:
        print(f"❌ Error in {query_name}: {e}")

if __name__ == "__main__":
    TARGET_GAME = "20600365"
    FILE_PATH = get_game_file(TARGET_GAME)

# --- QUERY 2: SHOT DISTRIBUTION ---
# Testing for: 'playerteamName' (lowercase t) and 'area' content
# --- QUERY 3: TEAM EFFICIENCY (Normalized for all Eras) ---
# --- QUERY 3: TEAM EFFICIENCY (With Description Fallback) ---
# --- QUERY 3: TEAM EFFICIENCY (Refined Fallback) ---
# --- QUERY 4: KEY EVENTS (Stats Tracker) ---
# --- QUERY 5: SCORING RUNS ---
scoring_runs_sql = f"""
    WITH base AS (
      SELECT
        "actionNumber", "period", "teamTricode",
        CAST("scoreHome" AS INT) AS "scoreHome",
        CAST("scoreAway" AS INT) AS "scoreAway"
      FROM read_parquet('{FILE_PATH}')
      WHERE "scoreHome" IS NOT NULL AND "scoreAway" IS NOT NULL
    ),
    scoring AS (
      SELECT *,
        ("scoreHome" + "scoreAway") - COALESCE(LAG("scoreHome" + "scoreAway") OVER (ORDER BY "actionNumber"), 0) AS "ptsScored",
        LAG("scoreHome") OVER (ORDER BY "actionNumber") AS "prevScoreHome",
        LAG("scoreAway") OVER (ORDER BY "actionNumber") AS "prevScoreAway"
      FROM base
    ),
    tagged AS (
      SELECT *,
        CASE WHEN "teamTricode" != COALESCE(LAG("teamTricode") OVER (ORDER BY "actionNumber"), 'START') 
             THEN 1 ELSE 0 END AS "isNewRun"
      FROM scoring 
      WHERE "ptsScored" > 0
    ),
    id_gen AS (
      SELECT *,
        SUM("isNewRun") OVER (ORDER BY "actionNumber") AS "runId"
      FROM tagged
    ),
    final_runs AS (
      SELECT *,
        FIRST_VALUE("prevScoreHome") OVER (PARTITION BY "runId" ORDER BY "actionNumber") AS "startScoreHome",
        FIRST_VALUE("prevScoreAway") OVER (PARTITION BY "runId" ORDER BY "actionNumber") AS "startScoreAway"
      FROM id_gen
    )
    SELECT
      "runId", 
      "teamTricode", 
      SUM("ptsScored") AS "runPoints", 
      COUNT(*) AS "scoringEvents",
      MIN("startScoreHome") AS "scoreBeforeHome", 
      MIN("startScoreAway") AS "scoreBeforeAway",
      MAX("scoreHome") AS "scoreAfterHome", 
      MAX("scoreAway") AS "scoreAfterAway",
      MIN("period") AS "periodStart"
    FROM final_runs
    GROUP BY ALL
    HAVING SUM("ptsScored") >= 8
    ORDER BY "periodStart", MIN("actionNumber");
"""

run_test(TARGET_GAME, "SCORING RUNS", scoring_runs_sql)