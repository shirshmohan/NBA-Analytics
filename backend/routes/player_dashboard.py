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


@router.get("/{player_name}/season-percentiles")
def player_season_percentiles(
    player_name:str,
    season: int =  Query(... ,description="Season start year (e.g.,2021)"),
    min_games: int = Query(30,ge=0, le=82),
    db:Session = Depends(get_db),
):
    player_name = unquote(player_name)

    sql = text("""
    WITH season_pool AS (
      SELECT
        season,
        player,
        person_id,
        g,

        (pts::numeric / NULLIF(g,0)) AS ppg,
        (ast::numeric / NULLIF(g,0)) AS apg,
        (trb::numeric / NULLIF(g,0)) AS rpg,
        (stl::numeric / NULLIF(g,0)) AS spg,
        (blk::numeric / NULLIF(g,0)) AS bpg,

        (mp::numeric / NULLIF(g,0)) AS mpg,

        fta,
        trp_dbl,

        (tov::numeric / NULLIF(g,0)) AS tov_pg,

        fg_percent   AS fg_pct,
        x3p_percent  AS x3p_pct,
        ft_percent   AS ft_pct,
        e_fg_percent AS efg_pct

      FROM player_season_stats
      WHERE season = :season
        AND g >= :min_games
    ),
    ranked AS (
      SELECT
        *,

        COUNT(*) OVER () AS pool_size,

        CUME_DIST() OVER (ORDER BY ppg)    AS ppg_pctile,
        CUME_DIST() OVER (ORDER BY apg)    AS apg_pctile,
        CUME_DIST() OVER (ORDER BY rpg)    AS rpg_pctile,
        CUME_DIST() OVER (ORDER BY spg)    AS spg_pctile,
        CUME_DIST() OVER (ORDER BY bpg)    AS bpg_pctile,

        CUME_DIST() OVER (ORDER BY fg_pct)  AS fg_pctile,
        CUME_DIST() OVER (ORDER BY x3p_pct) AS x3p_pctile,
        CUME_DIST() OVER (ORDER BY ft_pct)  AS ft_pctile,
        CUME_DIST() OVER (ORDER BY efg_pct) AS efg_pctile,

        CUME_DIST() OVER (ORDER BY fta)     AS fta_pctile,
        CUME_DIST() OVER (ORDER BY trp_dbl) AS trp_dbl_pctile,

        CUME_DIST() OVER (ORDER BY mpg)     AS mpg_pctile,

        CUME_DIST() OVER (ORDER BY tov_pg DESC) AS tov_pctile_better

      FROM season_pool
    )
    SELECT
      player,
      person_id,
      season,
      g,
      pool_size,

      ROUND(ppg, 2) AS ppg,
      ROUND(apg, 2) AS apg,
      ROUND(rpg, 2) AS rpg,
      ROUND(spg, 2) AS spg,
      ROUND(bpg, 2) AS bpg,
      ROUND(mpg, 2) AS mpg,

      fta,
      trp_dbl,

      ROUND(tov_pg, 2) AS tov_pg,

      ROUND(fg_pct::numeric, 3)  AS fg_pct,
      ROUND(x3p_pct::numeric, 3) AS x3p_pct,
      ROUND(ft_pct::numeric, 3)  AS ft_pct,
      ROUND(efg_pct::numeric, 3) AS efg_pct,

      ROUND((100 * ppg_pctile)::numeric, 1) AS ppg_percentile,
      ROUND((100 * apg_pctile)::numeric, 1) AS apg_percentile,
      ROUND((100 * rpg_pctile)::numeric, 1) AS rpg_percentile,
      ROUND((100 * spg_pctile)::numeric, 1) AS spg_percentile,
      ROUND((100 * bpg_pctile)::numeric, 1) AS bpg_percentile,

      ROUND((100 * fg_pctile)::numeric, 1)  AS fg_percentile,
      ROUND((100 * x3p_pctile)::numeric, 1) AS x3p_percentile,
      ROUND((100 * ft_pctile)::numeric, 1)  AS ft_percentile,
      ROUND((100 * efg_pctile)::numeric, 1) AS efg_percentile,

      ROUND((100 * fta_pctile)::numeric, 1)     AS fta_percentile,
      ROUND((100 * trp_dbl_pctile)::numeric, 1) AS trp_dbl_percentile,
      ROUND((100 * mpg_pctile)::numeric, 1)     AS mpg_percentile,

      ROUND((100 * tov_pctile_better)::numeric, 1) AS tov_percentile_better

    FROM ranked
    WHERE player = :player;
    """)

    row = db.execute(sql,{"season":season,"min_games":min_games,"player":player_name}).mappings().first()

    if not row:
        raise HTTPException(status_code=404, detail="No percentile row found for that player/season/min_games.")

    return dict(row)


@router.get("/{player_name}/season-ranks")
def player_season_ranks(
    player_name:str,
    season: int = Query(..., description="Season start year (e.g., 2021)"),
    min_games: int = Query(30, ge=0, le=82),
    db: Session = Depends(get_db),
):
    player_name = unquote(player_name)
    sql = text("""
    WITH season_pool AS (
      SELECT
        season,
        player,
        person_id,
        g,
        (pts::numeric / NULLIF(g,0)) AS ppg,
        (ast::numeric / NULLIF(g,0)) AS apg,
        (stl::numeric / NULLIF(g,0)) AS spg,
        (mp::numeric  / NULLIF(g,0)) AS mpg,
        (tov::numeric / NULLIF(g,0)) AS tov_pg
      FROM player_season_stats
      WHERE season = :season
        AND g >= :min_games
    ),
    ranked AS (
      SELECT
        *,
        COUNT(*) OVER () AS pool_size,

        RANK() OVER (ORDER BY ppg DESC) AS ppg_rank,
        RANK() OVER (ORDER BY apg DESC) AS apg_rank,
        RANK() OVER (ORDER BY spg DESC) AS spg_rank,
        RANK() OVER (ORDER BY mpg DESC) AS mpg_rank,
        RANK() OVER (ORDER BY tov_pg ASC) AS tov_rank,

        AVG(ppg) OVER () AS avg_ppg_pool,
        AVG(apg) OVER () AS avg_apg_pool,
        AVG(spg) OVER () AS avg_spg_pool,
        AVG(mpg) OVER () AS avg_mpg_pool
      FROM season_pool
    )
    SELECT
      player,
      person_id,
      season,
      g,
      pool_size,

      ROUND(ppg, 2) AS ppg,
      ROUND(apg, 2) AS apg,
      ROUND(spg, 2) AS spg,
      ROUND(mpg, 2) AS mpg,

      ppg_rank,
      apg_rank,
      spg_rank,
      mpg_rank,

      ROUND(avg_ppg_pool::numeric, 2) AS avg_ppg_pool,
      ROUND(avg_apg_pool::numeric, 2) AS avg_apg_pool,
      ROUND(avg_spg_pool::numeric, 2) AS avg_spg_pool,
      ROUND(avg_mpg_pool::numeric, 2) AS avg_mpg_pool
    FROM ranked
    WHERE player = :player;
    """)

    row = db.execute(sql, {"season": season, "min_games": min_games, "player": player_name}).mappings().first()
    if not row:
        raise HTTPException(status_code=404, detail="No rank row found for that player/season/min_games.")

    return dict(row)
