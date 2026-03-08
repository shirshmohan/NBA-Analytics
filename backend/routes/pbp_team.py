from fastapi import APIRouter, HTTPException
from duck import get_game_file, run_query
import os

router = APIRouter(prefix="/game", tags=["Game Statistics"])

@router.get("/{game_id}/pbp-sequence")
async def get_pbp_sequence(game_id: str):
    file_path = get_game_file(game_id)
    query = f"""
        SELECT DISTINCT
            "period",
            "actionNumber",
            "clock",
            "scoreHome",
            "scoreAway"
        FROM read_parquet('{file_path}')
        WHERE "scoreHome" IS NOT NULL 
          AND LOWER("shotResult") = 'made'
        ORDER BY "actionNumber";
    """
    return run_query(query)

@router.get("/{game_id}/shot-distribution")
async def get_shot_distribution(game_id: str):
    file_path = get_game_file(game_id)
    # Combining 2A and 2B into one informative response
    query = f"""
        SELECT
        "playerteamName",
        "area",
        COUNT(*) AS attempts,
        SUM(CASE WHEN LOWER("shotResult") = 'made' THEN 1 ELSE 0 END) AS makes
    FROM read_parquet('{file_path}')
    WHERE "shotResult" IS NOT NULL 
      AND "area" IS NOT NULL 
      AND "area" <> ''
    GROUP BY "playerteamName", "area"
    ORDER BY 3 DESC;
    """
    return run_query(query)

@router.get("/{game_id}/team-efficiency")
async def get_team_efficiency(game_id: str):
    file_path = get_game_file(game_id)
    query = f"""
        SELECT
            "playerteamName",
            CASE 
                WHEN LOWER("actionType") LIKE '%3pt%' OR LOWER("description") LIKE '%3pt%' THEN '3pt'
                WHEN LOWER("actionType") LIKE '%free%throw%' OR LOWER("description") LIKE '%free throw%' THEN 'freethrow'
                WHEN (LOWER("actionType") LIKE '%shot%' OR LOWER("actionType") LIKE '%layup%' OR LOWER("actionType") LIKE '%dunk%') 
                     AND (LOWER("description") NOT LIKE '%3pt%') THEN '2pt'
                ELSE 'other'
            END AS "actionType",
            COUNT(*) AS attempts,
            SUM(CASE WHEN LOWER("shotResult") = 'made' THEN 1 ELSE 0 END) AS makes,
            ROUND(SUM(CASE WHEN LOWER("shotResult") = 'made' THEN 1.0 ELSE 0.0 END) / NULLIF(COUNT(*), 0), 3) AS "fgPercentage"
        FROM read_parquet('{file_path}')
        GROUP BY 1, 2
        HAVING "actionType" != 'other'
        ORDER BY 1, 2;
    """
    return run_query(query)

@router.get("/{game_id}/key-events")
async def get_key_events(game_id: str):
    file_path = get_game_file(game_id)
    query = f"""
        SELECT
        "period",
        "clock",
        "actionNumber",
        "teamId",
        CASE 
            -- Assist Check: Made shot + valid assist ID
            WHEN (LOWER("actionType") LIKE '%pt%' OR LOWER("description") LIKE '%pt%') 
                 AND LOWER("shotResult") = 'made' 
                 AND "assistPersonId" IS NOT NULL 
                 AND CAST("assistPersonId" AS INT) <> 0 THEN 'Assist'
            
            -- Defensive/Other Stats
            WHEN LOWER("actionType") LIKE '%rebound%' THEN 'Rebound'
            WHEN LOWER("actionType") LIKE '%steal%' THEN 'Steal'
            WHEN LOWER("actionType") LIKE '%turnover%' THEN 'Turnover'
            WHEN LOWER("actionType") LIKE '%block%' THEN 'Block'
            ELSE NULL 
        END AS "statType"
    FROM read_parquet('{file_path}')
    WHERE "statType" IS NOT NULL
    ORDER BY "period" ASC, "clock" DESC, "actionNumber" ASC;
    """
    return run_query(query)

@router.get("/{game_id}/scoring-runs")
async def get_scoring_runs(game_id: str):
    file_path = get_game_file(game_id)
    query = f"""
    WITH base AS (
      SELECT
        "actionNumber", "period", "teamTricode",
        CAST("scoreHome" AS INT) AS "scoreHome",
        CAST("scoreAway" AS INT) AS "scoreAway"
      FROM read_parquet('{file_path}')
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
    return run_query(query)