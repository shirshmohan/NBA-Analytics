// ─── Player Types ─────────────────────────────────────────────────────────────

export interface PlayerSearchResult {
  person_id: number
  full_name: string
  team: string | null
  position: string | null
}

export interface CareerSummary {
  seasons: number
  g: number
  ppg: number
  apg: number
  rpg: number
  spg: number
  bpg: number
  mpg: number
}

export interface PlayerSeason {
  season: number
  team: string
  g: number
  mpg: number
  ppg: number
  apg: number
  rpg: number
  spg: number
  bpg: number
  tov_pg: number
  fg_pct: number
  x3p_pct: number | null
}

export interface PlayerDashboard {
  player: string
  person_id: number
  position: string | null
  current_team: string | null
  career: CareerSummary
  seasons: PlayerSeason[]
}

export interface Accolades {
  mvps: { season: number }[]
  all_nba: { season: number; team: '1st' | '2nd' | '3rd' }[]
  all_defense: { season: number; team: '1st' | '2nd' }[]
  all_star: { season: number }[]
  dpoy: { season: number }[]
  champion: { season: number; team: string }[]
}

export interface PlayerAccolades {
  player: string
  person_id: number
  accolades: Accolades
}

export interface SeasonPercentiles {
  season: number
  player: string
  pool_size: number
  percentiles: {
    ppg: number
    apg: number
    rpg: number
    spg: number
    bpg: number
    mpg: number
    tov_pg: number
    fg_pct: number
    ft_rate: number | null
  }
}

export interface SeasonRanks {
  season: number
  player: string
  pool_size: number
  ranks: {
    ppg_rank: number
    apg_rank: number
    rpg_rank: number
    spg_rank: number
    bpg_rank: number
    mpg_rank: number
    tov_pg_rank: number
    fg_pct_rank: number
  }
}

export interface PlayerPlayByPlayEvent {
  game_id: string
  game_date: string
  period: number
  clock: string
  time_sec: number
  event: string
  description: string
  x: number | null
  y: number | null
  shotResult: string | null
}

// ─── Game Types ───────────────────────────────────────────────────────────────

export interface GameSummary {
  game_id: string
  game_date: string
  home_team: string
  away_team: string
  home_tricode: string
  away_tricode: string
  home_score?: number
  away_score?: number
  game_type: string | null
  game_label: string | null
  game_sub_label: string | null
  status: 'Final' | 'Scheduled' | 'Live' | string
}

export interface TeamBoxScore {
  team: string
  tricode: string
  pts: number
  reb: number
  ast: number
  stl: number
  blk: number
  tov: number
  pf: number
  fg_pct: number
  x3p_pct: number
  ft_pct: number
}

export interface GameTeamStats {
  game_id: string
  home: TeamBoxScore
  away: TeamBoxScore
}

export interface PlayerBoxScore {
  person_id: number
  player: string
  min: string
  pts: number
  reb: number
  ast: number
  stl: number
  blk: number
  tov: number
  pf: number
  fgm: number
  fga: number
  x3pm: number
  x3pa: number
  ftm: number
  fta: number
  plus_minus: number | null
}

export interface GamePlayerStats {
  game_id: string
  home_tricode: string
  away_tricode: string
  home_players: PlayerBoxScore[]
  away_players: PlayerBoxScore[]
}

export interface PlayByPlayEvent {
  period: number
  clock: string
  time_sec: number
  actionType: string
  description: string
  teamTricode: string | null
  playerName: string | null
  personId: number | null
  shotValue: number | null
  shotResult: 'Made' | 'Missed' | null
  x: number | null
  y: number | null
}

export interface GameFilters {
  q?: string
  date_from?: string
  date_to?: string
  team?: string
  game_type?: string
  game_label?: string
  game_sub_label?: string
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

// ─── Chart Derived Types ──────────────────────────────────────────────────────

export interface ScoreTimelinePoint {
  time_sec: number
  label: string
  home_score: number
  away_score: number
  period: number
}

export interface ShotZone {
  zone: string
  made: number
  attempted: number
  pct: number
}
