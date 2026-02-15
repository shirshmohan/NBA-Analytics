from fastapi import APIRouter, HTTPException
from sqlalchemy import text
from database import engine

router = APIRouter(prefix="/games", tags=["Game Stats"])

GAME_EXISTS = text("SELECT 1 FROM games WHERE game_id = :game_id LIMIT 1;")

TEAM_STATS_BY_GAME = text("""
SELECT
  game_id,
  home,
  win,

  team_city,
  team_name,

  team_score,
  opponent_score,

  assists,
  blocks,
  steals,

  field_goals_attempted,
  field_goals_made,
  field_goals_percentage,

  three_pointers_attempted,
  three_pointers_made,
  three_pointers_percentage,

  free_throws_attempted,
  free_throws_made,
  free_throws_percentage,

  rebounds_defensive,
  rebounds_offensive,
  rebounds_total,

  fouls_personal,
  turnovers,

  num_minutes,

  q1_points,
  q2_points,
  q3_points,
  q4_points

FROM team_game_stats
WHERE game_id = :game_id
ORDER BY home DESC;
""")

PLAYER_STATS_BY_GAME = text("""
SELECT
  pgs.game_id,
  pgs.person_id,
  (p.first_name || ' ' || p.last_name) AS player_name,

  pgs.win,
  pgs.home,

  pgs.num_minutes,
  pgs.points,
  pgs.assists,
  pgs.blocks,
  pgs.steals,

  pgs.field_goals_attempted,
  pgs.field_goals_made,
  pgs.field_goals_percentage,

  pgs.three_pointers_attempted,
  pgs.three_pointers_made,
  pgs.three_pointers_percentage,

  pgs.free_throws_attempted,
  pgs.free_throws_made,
  pgs.free_throws_percentage,

  pgs.rebounds_defensive,
  pgs.rebounds_offensive,
  pgs.rebounds_total,

  pgs.fouls_personal,
  pgs.turnovers,
  pgs.plus_minus

FROM player_game_stats pgs
LEFT JOIN players p
  ON p.person_id = pgs.person_id
WHERE pgs.game_id = :game_id
ORDER BY
  pgs.home DESC,
  pgs.num_minutes DESC NULLS LAST,
  pgs.points DESC NULLS LAST,
  pgs.person_id;
""")


@router.get("/{game_id}/team-stats")
def get_team_stats_for_game(game_id: int):
    try:
        with engine.connect() as conn:
            exists = conn.execute(GAME_EXISTS, {"game_id": game_id}).first()
            if not exists:
                raise HTTPException(status_code=404, detail=f"Game not found: {game_id}")

            rows = conn.execute(TEAM_STATS_BY_GAME, {"game_id": game_id}).mappings().all()
            if not rows:
                raise HTTPException(status_code=404, detail=f"No team_game_stats found for game_id: {game_id}")

            teams = []
            for r in rows:
                teams.append({
                    "game_id": r["game_id"],
                    "home": r["home"],
                    "win": r["win"],
                    "team": {"city": r["team_city"], "name": r["team_name"]},

                    "score": {
                        "team_score": r["team_score"],
                        "opponent_score": r["opponent_score"],
                        "quarters": {
                            "q1": r["q1_points"],
                            "q2": r["q2_points"],
                            "q3": r["q3_points"],
                            "q4": r["q4_points"],
                        }
                    },

                    "box": {
                        "num_minutes": r["num_minutes"],
                        "assists": r["assists"],
                        "rebounds": {
                            "off": r["rebounds_offensive"],
                            "def": r["rebounds_defensive"],
                            "total": r["rebounds_total"],
                        },
                        "steals": r["steals"],
                        "blocks": r["blocks"],
                        "turnovers": r["turnovers"],
                        "fouls_personal": r["fouls_personal"],
                    },

                    "shooting": {
                        "fg": {
                            "made": r["field_goals_made"],
                            "att": r["field_goals_attempted"],
                            "pct": r["field_goals_percentage"],
                        },
                        "3p": {
                            "made": r["three_pointers_made"],
                            "att": r["three_pointers_attempted"],
                            "pct": r["three_pointers_percentage"],
                        },
                        "ft": {
                            "made": r["free_throws_made"],
                            "att": r["free_throws_attempted"],
                            "pct": r["free_throws_percentage"],
                        },
                    },
                })

            home_team = next((t for t in teams if t["home"] is True), None)
            away_team = next((t for t in teams if t["home"] is False), None)

            return {
                "game_id": game_id,
                "home_team": home_team,
                "away_team": away_team,
                "rows": teams,
            }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{game_id}/player-stats")
def get_player_stats_for_game(game_id: int):
    try:
        with engine.connect() as conn:
            exists = conn.execute(GAME_EXISTS, {"game_id": game_id}).first()
            if not exists:
                raise HTTPException(status_code=404, detail=f"Game not found: {game_id}")

            rows = conn.execute(PLAYER_STATS_BY_GAME, {"game_id": game_id}).mappings().all()
            if not rows:
                raise HTTPException(status_code=404, detail=f"No player_game_stats found for game_id: {game_id}")

            def map_row(r):
                return {
                    "game_id": r["game_id"],
                    "person_id": r["person_id"],
                    "player_name": r.get("player_name"),
                    "home": r["home"],
                    "win": r["win"],

                    "num_minutes": r["num_minutes"],
                    "points": r["points"],
                    "assists": r["assists"],
                    "rebounds_defensive": r["rebounds_defensive"],
                    "rebounds_offensive": r["rebounds_offensive"],
                    "rebounds_total": r["rebounds_total"],
                    "steals": r["steals"],
                    "blocks": r["blocks"],
                    "turnovers": r["turnovers"],
                    "fouls_personal": r["fouls_personal"],
                    "plus_minus": r["plus_minus"],

                    "shooting": {
                        "fgm": r["field_goals_made"],
                        "fga": r["field_goals_attempted"],
                        "fg_pct": r["field_goals_percentage"],
                        "tpm": r["three_pointers_made"],
                        "tpa": r["three_pointers_attempted"],
                        "tp_pct": r["three_pointers_percentage"],
                        "ftm": r["free_throws_made"],
                        "fta": r["free_throws_attempted"],
                        "ft_pct": r["free_throws_percentage"],
                    },
                }

            home_players = [map_row(r) for r in rows if r["home"] is True]
            away_players = [map_row(r) for r in rows if r["home"] is False]

            return {
                "game_id": game_id,
                "home_players": home_players,
                "away_players": away_players,
            }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
