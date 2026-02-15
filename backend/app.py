from fastapi import FastAPI, Query, HTTPException
from sqlalchemy import text
from database import engine

app = FastAPI(title="NBA Stats API")

PPG_QUERY = text("""
SELECT 
    p.first_name, 
    p.last_name,
    COUNT(pgs.game_id) as games_played,
    ROUND(AVG(pgs.points), 2) as ppg_average
FROM player_game_stats pgs
JOIN players p ON pgs.person_id = p.person_id
JOIN games g ON pgs.game_id = g.game_id
WHERE p.first_name = :first_name
  AND p.last_name  = :last_name
  AND g.game_type  = :game_type
  AND pgs.num_minutes > 0
  AND g.game_datetime >= :start_date
  AND g.game_datetime <= :end_date
GROUP BY p.first_name, p.last_name;
""")

@app.get("/players/ppg")
def get_player_ppg(
    first_name: str = Query(
        ...,
        examples={"default": {"value": "Stephen"}}
    ),
    last_name: str = Query(
        ...,
        examples={"default": {"value": "Curry"}}
    ),
    start_date: str = Query(
        ...,
        examples={"default": {"value": "2022-10-18"}}
    ),
    end_date: str = Query(
        ...,
        examples={"default": {"value": "2023-04-10"}}
    ),
    game_type: str = Query(
        "Regular Season",
        examples={"default": {"value": "Regular Season"}}
    )
):
    try:
        with engine.connect() as connection:
            result = connection.execute(
                PPG_QUERY,
                {
                    "first_name": first_name,
                    "last_name": last_name,
                    "game_type": game_type,
                    "start_date": start_date,
                    "end_date": end_date,
                }
            ).mappings().first()  # mappings() gives dict-like rows

        if not result:
            raise HTTPException(status_code=404, detail="No data found for that query.")

        # Return JSON (React-friendly)
        return {
            "player": f"{result['first_name']} {result['last_name']}",
            "first_name": result["first_name"],
            "last_name": result["last_name"],
            "games_played": int(result["games_played"]),
            "ppg_average": float(result["ppg_average"]),
            "filters": {
                "game_type": game_type,
                "start_date": start_date,
                "end_date": end_date,
            },
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Query failed: {str(e)}")
