// ─── Player Types ─────────────────────────────────────────────────────────────

// GET /players/search  → [{player: string}, ...]
export interface PlayerSearchResult {
  player: string
}

// GET /players/{name}/dashboard
export interface PlayerSeasonRow {
  season: string
  team: string
  pos: string | null
  g: number
  mp: number
  fg: number; fga: number; fg_percent: number | null
  x3p: number; x3pa: number; x3p_percent: number | null
  x2p: number; x2pa: number; x2p_percent: number | null
  e_fg_percent: number | null
  ft: number; fta: number; ft_percent: number | null
  orb: number; drb: number; trb: number
  ast: number; stl: number; blk: number; tov: number; pf: number; pts: number
  trp_dbl: number | null
  person_id: number | null
}

export interface PlayerCareer {
  player: string
  person_id: number | null
  career_g: number
  avg_mp_per_season: number
  mpg: number
  career_pts: number; career_ast: number; career_trb: number
  career_stl: number; career_blk: number; career_tov: number; career_pf: number
  ppg: number; apg: number; rpg: number; spg: number; bpg: number
  fg_pct: number | null; x3p_pct: number | null; ft_pct: number | null; efg_pct: number | null
}

export interface PlayerDashboard {
  player: string
  career: PlayerCareer
  seasons: PlayerSeasonRow[]
}

// GET /players/{name}/accolades
export interface MvpEntry {
  season_start: number
  team: string
  ppg: number; apg: number; trb: number
  ts_pct: number; per: number; ws: number; vorp: number
}
export interface AllNbaEntry {
  season_start: number
  all_team: number | string  // integer: 1=First, 2=Second, 3=Third
  team: string
}
export interface AllStarEntry {
  season_start: number
}
export interface AwardEntry {
  season: string
  award: string
}
export interface PlayerAccolades {
  player: string
  person_id: number | null
  mvp: MvpEntry[]
  all_nba: AllNbaEntry[]
  all_star: AllStarEntry[]
  awards: AwardEntry[]
}

// GET /players/{name}/season-percentiles
export interface SeasonPercentiles {
  player: string
  person_id: number | null
  season: string
  g: number
  pool_size: number
  ppg: number; apg: number; rpg: number; spg: number; bpg: number; mpg: number
  fta: number; trp_dbl: number | null; tov_pg: number
  fg_pct: number | null; x3p_pct: number | null; ft_pct: number | null; efg_pct: number | null
  ppg_percentile: number; apg_percentile: number; rpg_percentile: number
  spg_percentile: number; bpg_percentile: number; mpg_percentile: number
  fg_percentile: number; x3p_percentile: number; ft_percentile: number; efg_percentile: number
  fta_percentile: number; trp_dbl_percentile: number; tov_percentile_better: number
}

// GET /players/{name}/season-ranks
export interface SeasonRanks {
  player: string
  person_id: number | null
  season: string
  g: number
  pool_size: number
  ppg: number; apg: number; spg: number; mpg: number
  ppg_rank: number; apg_rank: number; spg_rank: number; mpg_rank: number
  avg_ppg_pool: number; avg_apg_pool: number; avg_spg_pool: number; avg_mpg_pool: number
}

// ─── Game Types ───────────────────────────────────────────────────────────────

// GET /games/search → GameSearchResponse
export interface GameTeamInfo {
  id: number
  abbrev: string
  name: string
  score: number
}
export interface GameSummary {
  game_id: number
  game_datetime: string
  home_team: GameTeamInfo
  away_team: GameTeamInfo
  winner: string | null
  game_type: string | null
  game_label: string | null
  game_sub_label: string | null
  series_game_number: number | null
}
export interface GameSearchResponse {
  resolved_inputs: {
    team1: string
    team2: string | null
    season: string | null
    game_type: string | null
    game_label: string | null
  }
  count: number
  limit: number
  offset: number
  items: GameSummary[]
}

// GET /games/{id}/team-stats
export interface TeamScoreBox {
  team_score: number
  opponent_score: number
  quarters: { q1: number; q2: number; q3: number; q4: number }
}
export interface TeamBoxStats {
  num_minutes: number
  assists: number
  rebounds: { off: number; def: number; total: number }
  steals: number; blocks: number; turnovers: number; fouls_personal: number
}
export interface TeamShooting {
  fg:   { made: number; att: number; pct: number | null }
  '3p': { made: number; att: number; pct: number | null }
  ft:   { made: number; att: number; pct: number | null }
}
export interface TeamGameStatEntry {
  game_id: number
  home: boolean
  win: boolean
  teamId?: number
  team: { city: string; name: string; abbrev?: string }
  score: TeamScoreBox
  box: TeamBoxStats
  shooting: TeamShooting
}
export interface GameTeamStatsResponse {
  game_id: number
  home_team: TeamGameStatEntry | null
  away_team: TeamGameStatEntry | null
  rows: TeamGameStatEntry[]
}

// GET /games/{id}/player-stats
export interface PlayerGameStatEntry {
  game_id: number
  person_id: number
  player_name: string | null
  home: boolean
  win: boolean
  num_minutes: number
  points: number
  assists: number
  rebounds_defensive: number; rebounds_offensive: number; rebounds_total: number
  steals: number; blocks: number; turnovers: number; fouls_personal: number
  plus_minus: number | null
  shooting: {
    fgm: number; fga: number; fg_pct: number | null
    tpm: number; tpa: number; tp_pct: number | null
    ftm: number; fta: number; ft_pct: number | null
  }
}
export interface GamePlayerStatsResponse {
  game_id: number
  home_players: PlayerGameStatEntry[]
  away_players: PlayerGameStatEntry[]
}

// GET /game/{id}/pbp-sequence  (DuckDB parquet routes use /game prefix)
export interface PbpScorePoint {
  period: number
  actionNumber: number
  clock: string
  scoreHome: string
  scoreAway: string
}

// GET /game/{id}/shot-distribution
export interface ShotDistributionEntry {
  playerteamName: string
  area: string
  attempts: number
  makes: number
}

// GET /game/{id}/team-efficiency
export interface TeamEfficiencyEntry {
  playerteamName: string
  actionType: '2pt' | '3pt' | 'freethrow'
  attempts: number
  makes: number
  fgPercentage: number
}

// GET /game/{id}/key-events
export interface KeyEvent {
  period: number
  clock: string
  actionNumber: number
  teamId: number
  statType: 'Assist' | 'Rebound' | 'Steal' | 'Turnover' | 'Block'
}

// GET /game/{id}/scoring-runs
export interface ScoringRun {
  runId: number
  teamTricode: string
  runPoints: number
  scoringEvents: number
  scoreBeforeHome: number; scoreBeforeAway: number
  scoreAfterHome: number;  scoreAfterAway: number
  periodStart: number
}

// GET /player/{game_id}/{player_id}/timeline
export interface PlayerTimelineEvent {
  period: number
  clock: string
  actionNumber: number
  teamId: number
  statType: string
}

// GET /player/{game_id}/{player_id}/shot-zones
export interface PlayerShotZone {
  shotRange: string
  attempts: number
  makes: number
}

// ─── Search / Filter params ───────────────────────────────────────────────────
export interface GameFilters {
  team1: string
  team2?: string
  season?: string
  game_type?: string
  game_label?: string
  start_datetime?: string
  end_datetime?: string
  limit?: number
  offset?: number
}

// ─── Settings ─────────────────────────────────────────────────────────────────
export interface AppSettings {
  darkMode: boolean
  performanceMode: boolean
  show3DBackground: boolean
  useMockData: boolean
}

// ─── Chart helpers ────────────────────────────────────────────────────────────
export interface ScoreTimelinePoint {
  actionNumber: number
  period: number
  clock: string
  home_score: number
  away_score: number
}

export interface ShotZone {
  zone: string
  made: number
  attempted: number
  pct: number
}
