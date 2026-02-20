# routes/player_dashboard.py

from fastapi import APIRouter, Query, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from urllib.parse import unquote

from database import get_db

router = APIRouter(prefix="/players", tags=["Players"])


# -------------------------
# Helper: resolve person_id
# -------------------------
def resolve_person_id(db: Session, player_name: str) -> int | None:
    # 1) Prefer person_id already present in season stats (best)
    sql1 = text("""
        SELECT person_id
        FROM player_season_stats
        WHERE player = :player
          AND person_id IS NOT NULL
        LIMIT 1;
    """)
    r = db.execute(sql1, {"player": player_name}).mappings().first()
    if r and r.get("person_id") is not None:
        return int(r["person_id"])

    # 2) Fallback: match "First Last" from players table
    sql2 = text("""
        SELECT person_id
        FROM players
        WHERE trim(coalesce(first_name,'') || ' ' || coalesce(last_name,'')) = :player
        LIMIT 1;
    """)
    r2 = db.execute(sql2, {"player": player_name}).mappings().first()
    if r2 and r2.get("person_id") is not None:
        return int(r2["person_id"])

    return None


# -----------------------------------
# 1) Typeahead search (distinct names)
# -----------------------------------
@router.get("/search")
def search_players(
    q: str = Query(..., min_length=1, max_length=50),
    limit: int = Query(25, ge=1, le=100),
    db: Session = Depends(get_db),
):
    sql = text("""
        SELECT player
        FROM (
          SELECT DISTINCT player
          FROM player_season_stats
          WHERE player ILIKE '%' || :q || '%'
        ) x
        ORDER BY
          (player ILIKE :q || '%') DESC,
          player
        LIMIT :limit;
    """)
    rows = db.execute(sql, {"q": q, "limit": limit}).mappings().all()
    return rows  # [{"player": "Stephen Curry"}, ...]


# ---------------------------------------------------------
# 2) Dashboard (career summary + seasons) by player_name
# ---------------------------------------------------------
@router.get("/{player_name}/dashboard")
def player_dashboard(player_name: str, db: Session = Depends(get_db)):
    player_name = unquote(player_name)

    career_sql = text("""
        SELECT
          pss.player,
          MIN(pss.person_id) AS person_id,

          SUM(pss.g)  AS career_g,

          ROUND(AVG(pss.mp)::numeric, 2) AS avg_mp_per_season,
          ROUND(SUM(pss.mp)::numeric / NULLIF(SUM(pss.g),0), 2) AS mpg,

          SUM(pss.pts) AS career_pts,
          SUM(pss.ast) AS career_ast,
          SUM(pss.trb) AS career_trb,
          SUM(pss.stl) AS career_stl,
          SUM(pss.blk) AS career_blk,
          SUM(pss.tov) AS career_tov,
          SUM(pss.pf)  AS career_pf,

          ROUND(SUM(pss.pts)::numeric / NULLIF(SUM(pss.g),0), 2) AS ppg,
          ROUND(SUM(pss.ast)::numeric / NULLIF(SUM(pss.g),0), 2) AS apg,
          ROUND(SUM(pss.trb)::numeric / NULLIF(SUM(pss.g),0), 2) AS rpg,
          ROUND(SUM(pss.stl)::numeric / NULLIF(SUM(pss.g),0), 2) AS spg,
          ROUND(SUM(pss.blk)::numeric / NULLIF(SUM(pss.g),0), 2) AS bpg,

          ROUND(SUM(pss.fg)::numeric  / NULLIF(SUM(pss.fga),0), 3)  AS fg_pct,
          ROUND(SUM(pss.x3p)::numeric / NULLIF(SUM(pss.x3pa),0), 3) AS x3p_pct,
          ROUND(SUM(pss.ft)::numeric  / NULLIF(SUM(pss.fta),0), 3)  AS ft_pct,
          ROUND((SUM(pss.fg) + 0.5*SUM(pss.x3p))::numeric / NULLIF(SUM(pss.fga),0), 3) AS efg_pct
        FROM player_season_stats pss
        WHERE pss.player = :player
        GROUP BY pss.player;
    """)
    career = db.execute(career_sql, {"player": player_name}).mappings().first()
    if not career:
        raise HTTPException(status_code=404, detail="Player not found in player_season_stats")

    seasons_sql = text("""
        SELECT
          season, team, pos, g, mp,
          fg, fga, fg_percent,
          x3p, x3pa, x3p_percent,
          x2p, x2pa, x2p_percent,
          e_fg_percent,
          ft, fta, ft_percent,
          orb, drb, trb,
          ast, stl, blk, tov, pf, pts,
          trp_dbl,
          person_id
        FROM player_season_stats
        WHERE player = :player
        ORDER BY season;
    """)
    seasons = db.execute(seasons_sql, {"player": player_name}).mappings().all()

    return {
        "player": player_name,
        "career": dict(career),
        "seasons": seasons,
    }


# -----------------------------------------
# 3) Accolades (side panel) by player_name
# -----------------------------------------
@router.get("/{player_name}/accolades")
def player_accolades(player_name: str, db: Session = Depends(get_db)):
    player_name = unquote(player_name)
    person_id = resolve_person_id(db, player_name)

    # Name-based (always available)
    all_star_sql = text("""
        SELECT CAST(LEFT(season, 4) AS int) AS season_start
        FROM all_star
        WHERE player = :player
        ORDER BY CAST(LEFT(season, 4) AS int);
    """)
    all_star = db.execute(all_star_sql, {"player": player_name}).mappings().all()

    awards_sql = text("""
        SELECT season, award
        FROM awards
        WHERE player = :player
        ORDER BY season;
    """)
    awards = db.execute(awards_sql, {"player": player_name}).mappings().all()

    # person_id based (optional)
    mvp = []
    all_nba = []

    if person_id is not None:
        mvp_sql = text("""
            SELECT
              CAST(LEFT(year, 4) AS int) AS season_start,
              team,
              ppg, apg, trb, ts_pct, per, ws, vorp
            FROM mvp
            WHERE person_id = :pid
            ORDER BY CAST(LEFT(year, 4) AS int);
        """)
        mvp = db.execute(mvp_sql, {"pid": person_id}).mappings().all()

        all_nba_sql = text("""
            SELECT
              CAST(LEFT(season, 4) AS int) AS season_start,
              all_team,
              team
            FROM all_nba
            WHERE person_id = :pid
            ORDER BY CAST(LEFT(season, 4) AS int);
        """)
        all_nba = db.execute(all_nba_sql, {"pid": person_id}).mappings().all()

    return {
        "player": player_name,
        "person_id": person_id,
        "mvp": mvp,
        "all_nba": all_nba,
        "all_star": all_star,
        "awards": awards,
    }


# ---------------------------------------------
# 4) Recent game log (uses player_game_stats)
# ---------------------------------------------
@router.get("/{player_name}/games")
def player_recent_games(
    player_name: str,
    limit: int = Query(20, ge=1, le=200),
    db: Session = Depends(get_db),
):
    player_name = unquote(player_name)
    person_id = resolve_person_id(db, player_name)
    if person_id is None:
        raise HTTPException(status_code=404, detail="Could not resolve person_id for this player name")

    sql = text("""
        SELECT
          game_id,
          team_ref_id,
          opponent_team_ref_id,
          home,
          win,

          minutes_played,
          points,
          assists,
          rebounds_total,
          rebounds_offensive,
          rebounds_defensive,
          steals,
          blocks,
          turnovers,
          fouls_personal,
          plus_minus,

          field_goals_made,
          field_goals_attempted,
          field_goals_percentage,
          two_p_made,
          three_pointers_made,
          three_pointers_attempted,
          three_pointers_percentage,
          free_throws_made,
          free_throws_attempted,
          free_throws_percentage
        FROM player_game_stats
        WHERE person_id = :pid
        ORDER BY game_id DESC
        LIMIT :limit;
    """)
    games = db.execute(sql, {"pid": person_id, "limit": limit}).mappings().all()

    return {
        "player": player_name,
        "person_id": person_id,
        "games": games,
    }

