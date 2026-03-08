from fastapi import APIRouter
from duck import get_game_file, run_query

router = APIRouter(prefix="/player", tags=["Player Statistics"])

@router.get("/{game_id}/{player_id}/timeline")
async def get_player_game_timeline(game_id: str, player_id: int):
    file_path = get_game_file(game_id)
    query = f"""
        SELECT
            period, clock, actionNumber, teamId,
            CASE 
                WHEN actionType = '2pt' AND shotResult = 'Made' AND personId = ? THEN '2pt Made'
                WHEN actionType = '3pt' AND shotResult = 'Made' AND personId = ? THEN '3pt Made'
                WHEN actionType IN ('2pt', '3pt') AND shotResult = 'Made' AND assistPersonId = ? THEN 'Assist'
                WHEN actionType = 'rebound' AND personId = ? THEN 'Rebound'
                WHEN actionType = 'turnover' AND personId = ? THEN 'Turnover'
                WHEN actionType = 'steal' AND stealPersonId = ? THEN 'Steal'
                WHEN actionType = 'block' AND blockPersonId = ? THEN 'Block'
                WHEN actionType = '2pt' AND shotResult = 'Missed' AND personId = ? THEN '2pt Miss'
                WHEN actionType = '3pt' AND shotResult = 'Missed' AND personId = ? THEN '3pt Miss'
                ELSE 'Other' 
            END AS statType
        FROM read_parquet('{file_path}')
        WHERE (personId = ? OR assistPersonId = ? OR stealPersonId = ? OR blockPersonId = ?)
        ORDER BY period ASC, clock DESC, actionNumber ASC;
    """
    # DuckDB parameters mapping
    params = [player_id] * 13 
    return run_query(query, params)

@router.get("/{game_id}/{player_id}/shot-zones")
async def get_player_shot_zones(game_id: str, player_id: int):
    file_path = get_game_file(game_id)
    query = f"""
        WITH categorized_shots AS (
            SELECT
                personId, shotResult,
                CASE
                    WHEN actionType = '3pt' THEN '3-Pointer'
                    WHEN shotDistance BETWEEN 0 AND 4 THEN 'Rim'
                    WHEN shotDistance BETWEEN 5 AND 14 THEN 'Short Mid'
                    WHEN shotDistance BETWEEN 15 AND 19 THEN 'Long Mid'
                    ELSE 'Long 2PT' 
                END AS shotRange,
                CASE
                    WHEN actionType = '3pt' THEN 5
                    WHEN shotDistance BETWEEN 0 AND 4 THEN 1
                    WHEN shotDistance BETWEEN 5 AND 14 THEN 2
                    WHEN shotDistance BETWEEN 15 AND 19 THEN 3
                    ELSE 4 
                END AS rangeSort
            FROM read_parquet('{file_path}')
            WHERE isFieldGoal = TRUE AND personId = ?
        )
        SELECT
            shotRange,
            COUNT(*) AS attempts,
            SUM(CASE WHEN shotResult = 'Made' THEN 1 ELSE 0 END) AS makes
        FROM categorized_shots
        GROUP BY ALL
        ORDER BY MIN(rangeSort);
    """
    return run_query(query, [player_id])