from fastapi import APIRouter, Query, HTTPException
from sqlalchemy import text
from database import engine
router = APIRouter(prefix="/games", tags=["Game Search"])


# -------------------------
# SQL: Team resol   ver
# -------------------------
TEAM_RESOLVE_EXACT = text("""
SELECT team_id, team_city, team_name, team_abbrev
FROM teams
WHERE
  LOWER(team_abbrev) = LOWER(:q)
  OR LOWER(team_city) = LOWER(:q)
  OR LOWER(team_name) = LOWER(:q)
  OR LOWER(team_city || ' ' || team_name) = LOWER(:q)
LIMIT 1;
""")

TEAM_RESOLVE_FUZZY = text("""
SELECT team_id, team_city, team_name, team_abbrev
FROM teams
WHERE
  LOWER(team_abbrev) = LOWER(:q)
  OR team_city ILIKE '%' || :q || '%'
  OR team_name ILIKE '%' || :q || '%'
  OR (team_city || ' ' || team_name) ILIKE '%' || :q || '%'
ORDER BY
  CASE
    WHEN LOWER(team_abbrev) = LOWER(:q) THEN 1
    WHEN LOWER(team_city || ' ' || team_name) = LOWER(:q) THEN 2
    WHEN LOWER(team_city) = LOWER(:q) THEN 3
    WHEN LOWER(team_name) = LOWER(:q) THEN 4
    ELSE 5
  END
LIMIT 1;
""")

SEASON_EXISTS = text("""
SELECT 1
FROM season_calendar
WHERE season = :season
LIMIT 1;
""")

# -------------------------
# SQL: Finder (team1 required; team2 optional; season optional; type/label optional)
# Note: game_sub_label is OUTPUT ONLY (no filter)
# -------------------------
GAMES_FINDER = text("""
SELECT
  g.game_id,
  g.game_datetime,

  ht.team_id AS home_team_id,
  ht.team_abbrev AS home_team_abbrev,
  (ht.team_city || ' ' || ht.team_name) AS home_team_full_name,

  at.team_id AS away_team_id,
  at.team_abbrev AS away_team_abbrev,
  (at.team_city || ' ' || at.team_name) AS away_team_full_name,

  g.home_score,
  g.away_score,

  wt.team_abbrev AS winner_abbrev,

  g.game_type,
  g.game_label,
  g.game_sub_label,
  g.series_game_number

FROM games g
JOIN teams ht ON ht.team_id = g.home_team_id
JOIN teams at ON at.team_id = g.away_team_id
LEFT JOIN teams wt ON wt.team_id = g.winner

WHERE
  (
    (:team2_id IS NULL AND (g.home_team_id = :team1_id OR g.away_team_id = :team1_id))
    OR
    (:team2_id IS NOT NULL AND (
      (g.home_team_id = :team1_id AND g.away_team_id = :team2_id)
      OR
      (g.home_team_id = :team2_id AND g.away_team_id = :team1_id)
    ))
  )

  AND
  (
    -- Range overrides season
    (
      (:start_dt IS NOT NULL OR :end_dt IS NOT NULL)
      AND g.game_datetime >= COALESCE(:start_dt, '1900-01-01 00:00:00'::timestamp)
      AND g.game_datetime <= COALESCE(:end_dt,   '3000-01-01 00:00:00'::timestamp)
    )
    OR
    (
      (:start_dt IS NULL AND :end_dt IS NULL)
      AND (
        :season IS NULL
        OR g.game_datetime BETWEEN
            (SELECT start_datetime FROM season_calendar WHERE season = :season)
            AND
            (SELECT end_datetime   FROM season_calendar WHERE season = :season)
      )
    )
  )

  AND (:game_type IS NULL OR g.game_type = :game_type)
  AND (:game_label IS NULL OR g.game_label = :game_label)

ORDER BY g.game_datetime DESC
LIMIT :limit OFFSET :offset;
""")


# -------------------------
# SQL: Filter options endpoints
# -------------------------
FILTER_GAME_TYPES = text("""
SELECT DISTINCT game_type
FROM games
WHERE game_type IS NOT NULL AND game_type <> ''
ORDER BY game_type;
""")

FILTER_GAME_LABELS = text("""
SELECT DISTINCT game_label
FROM games
WHERE game_type = :game_type
  AND game_label IS NOT NULL AND game_label <> ''
ORDER BY game_label;
""")

FILTER_GAME_SUB_LABELS = text("""
SELECT DISTINCT game_sub_label
FROM games
WHERE game_type = :game_type
  AND game_label = :game_label
  AND game_sub_label IS NOT NULL AND game_sub_label <> ''
ORDER BY game_sub_label;
""")

def resolve_team(conn, q: str):
    q = q.strip()
    row = conn.execute(TEAM_RESOLVE_EXACT, {"q": q}).mappings().first()
    if row:
        return row
    return conn.execute(TEAM_RESOLVE_FUZZY, {"q": q}).mappings().first()


@router.get("/search")
def search_games(
    team1: str = Query(..., description="Team name/city/nickname/abbrev (e.g. 'Charlotte Hornets' or 'CHA')"),
    team2: str | None = Query(None, description="Optional opponent team"),
    season: str | None = Query(None, description="Season key in season_calendar, e.g. '2023-24'"),
    game_type: str | None = Query(None, description="One of your normalized game types, e.g. 'Regular Season' / 'Playoffs'"),
    game_label: str | None = Query(None, description="Optional label, e.g. 'Emirates NBA Cup' / 'NBA Finals'"),
    start_datetime: str | None = Query(None, description="YYYY-MM-DD HH:MM:SS"),
    end_datetime: str | None = Query(None, description="YYYY-MM-DD HH:MM:SS"),

    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
):
    try:
        with engine.connect() as conn:
            if season is not None:
                exists = conn.execute(SEASON_EXISTS, {"season": season}).first()
                if not exists:
                    raise HTTPException(status_code=404, detail=f"Season not found in season_calendar: {season}")

            t1 = resolve_team(conn, team1)
            if not t1:
                raise HTTPException(status_code=404, detail=f"team1 not found: {team1}")

            t2 = None
            if team2:
                t2 = resolve_team(conn, team2)
                if not t2:
                    raise HTTPException(status_code=404, detail=f"team2 not found: {team2}")

            params = {
                "team1_id": t1["team_id"],
                "team2_id": (t2["team_id"] if t2 else None),
                "season": season,
                "game_type": game_type,
                "game_label": game_label,
                "limit": limit,
                "offset": offset,
                "start_dt": start_datetime,
                "end_dt": end_datetime,

            }

            rows = conn.execute(GAMES_FINDER, params).mappings().all()

            items = []
            for r in rows:
                items.append({
                    "game_id": r["game_id"],
                    "game_datetime": r["game_datetime"],
                    "home_team": {
                        "id": r["home_team_id"],
                        "abbrev": r["home_team_abbrev"],
                        "name": r["home_team_full_name"],
                        "score": r["home_score"],
                    },
                    "away_team": {
                        "id": r["away_team_id"],
                        "abbrev": r["away_team_abbrev"],
                        "name": r["away_team_full_name"],
                        "score": r["away_score"],
                    },
                    "winner": r["winner_abbrev"],  # winner was team_id; we mapped to abbrev
                    "game_type": r["game_type"],
                    "game_label": r["game_label"],
                    "game_sub_label": r["game_sub_label"],  # output only
                    "series_game_number": r["series_game_number"],
                })

            return {
                "resolved_inputs": {
                    "team1": f"{t1['team_city']} {t1['team_name']} ({t1['team_abbrev']})",
                    "team2": (f"{t2['team_city']} {t2['team_name']} ({t2['team_abbrev']})" if t2 else None),
                    "season": season,
                    "game_type": game_type,
                    "game_label": game_label,
                },
                "count": len(items),
                "limit": limit,
                "offset": offset,
                "items": items,
            }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# -------------------------
# API: Filter Options (for dependent dropdowns)
# -------------------------
@router.get("/filters/game-types")
def get_game_types():
    with engine.connect() as conn:
        rows = conn.execute(FILTER_GAME_TYPES).fetchall()
        return {"game_types": [r[0] for r in rows]}

@router.get("/filters/game-labels")
def get_game_labels(
    game_type: str = Query(..., description="Selected game_type, e.g. 'Playoffs' or 'Regular Season'")
):
    with engine.connect() as conn:
        rows = conn.execute(FILTER_GAME_LABELS, {"game_type": game_type}).fetchall()
        return {"game_type": game_type, "game_labels": [r[0] for r in rows]}

@router.get("/filters/game-sub-labels")
def get_game_sub_labels(
    game_type: str = Query(...),
    game_label: str = Query(...),
):
    with engine.connect() as conn:
        rows = conn.execute(FILTER_GAME_SUB_LABELS, {"game_type": game_type, "game_label": game_label}).fetchall()
        return {
            "game_type": game_type,
            "game_label": game_label,
            "game_sub_labels": [r[0] for r in rows],
        }
