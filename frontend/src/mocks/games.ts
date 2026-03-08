import type {
  GameSummary,
  GameTeamStatsResponse,
  GamePlayerStatsResponse,
} from '@/types'

export const mockGameTypes = ['Regular Season', 'Playoffs', 'Play-In Tournament']
export const mockGameLabels = ['NBA Finals', 'Conference Finals', 'Conference Semifinals', 'First Round', 'Emirates NBA Cup']

export const mockGameSearch: GameSummary[] = [
  {
    game_id: 22300001,
    game_datetime: '2024-01-15T20:00:00',
    home_team: { id: 1610612744, abbrev: 'GSW', name: 'Golden State Warriors', score: 120 },
    away_team: { id: 1610612760, abbrev: 'OKC', name: 'Oklahoma City Thunder', score: 115 },
    winner: 'GSW',
    game_type: 'Regular Season',
    game_label: null,
    game_sub_label: null,
    series_game_number: null,
  },
  {
    game_id: 22300042,
    game_datetime: '2024-01-22T19:30:00',
    home_team: { id: 1610612747, abbrev: 'LAL', name: 'Los Angeles Lakers', score: 108 },
    away_team: { id: 1610612744, abbrev: 'GSW', name: 'Golden State Warriors', score: 117 },
    winner: 'GSW',
    game_type: 'Regular Season',
    game_label: null,
    game_sub_label: null,
    series_game_number: null,
  },
  {
    game_id: 42300401,
    game_datetime: '2024-06-06T21:00:00',
    home_team: { id: 1610612738, abbrev: 'BOS', name: 'Boston Celtics', score: 107 },
    away_team: { id: 1610612748, abbrev: 'MIA', name: 'Miami Heat', score: 89 },
    winner: 'BOS',
    game_type: 'Playoffs',
    game_label: 'NBA Finals',
    game_sub_label: 'Game 5',
    series_game_number: 5,
  },
]

export const mockGameTeamStats: GameTeamStatsResponse = {
  game_id: 22300001,
  home_team: {
    game_id: 22300001,
    home: true,
    win: true,
    team: { city: 'Golden State', name: 'Warriors' },
    score: { team_score: 120, opponent_score: 115, quarters: { q1: 32, q2: 28, q3: 31, q4: 29 } },
    box: { num_minutes: 240, assists: 28, rebounds: { off: 8, def: 34, total: 42 }, steals: 9, blocks: 5, turnovers: 12, fouls_personal: 18 },
    shooting: {
      fg:   { made: 45, att: 89, pct: 0.506 },
      '3p': { made: 16, att: 38, pct: 0.421 },
      ft:   { made: 14, att: 17, pct: 0.824 },
    },
  },
  away_team: {
    game_id: 22300001,
    home: false,
    win: false,
    team: { city: 'Oklahoma City', name: 'Thunder' },
    score: { team_score: 115, opponent_score: 120, quarters: { q1: 28, q2: 30, q3: 29, q4: 28 } },
    box: { num_minutes: 240, assists: 24, rebounds: { off: 10, def: 30, total: 40 }, steals: 7, blocks: 4, turnovers: 15, fouls_personal: 22 },
    shooting: {
      fg:   { made: 42, att: 91, pct: 0.462 },
      '3p': { made: 12, att: 35, pct: 0.343 },
      ft:   { made: 19, att: 24, pct: 0.792 },
    },
  },
  rows: [],
}

export const mockGamePlayerStats: GamePlayerStatsResponse = {
  game_id: 22300001,
  home_players: [
    {
      game_id: 22300001, person_id: 201939, player_name: 'Stephen Curry',
      home: true, win: true, num_minutes: 34, points: 32, assists: 7,
      rebounds_defensive: 4, rebounds_offensive: 1, rebounds_total: 5,
      steals: 2, blocks: 0, turnovers: 3, fouls_personal: 2, plus_minus: 12,
      shooting: { fgm: 11, fga: 22, fg_pct: 0.500, tpm: 6, tpa: 12, tp_pct: 0.500, ftm: 4, fta: 4, ft_pct: 1.000 },
    },
    {
      game_id: 22300001, person_id: 203110, player_name: 'Klay Thompson',
      home: true, win: true, num_minutes: 31, points: 24, assists: 2,
      rebounds_defensive: 3, rebounds_offensive: 0, rebounds_total: 3,
      steals: 1, blocks: 1, turnovers: 1, fouls_personal: 3, plus_minus: 8,
      shooting: { fgm: 8, fga: 18, fg_pct: 0.444, tpm: 5, tpa: 10, tp_pct: 0.500, ftm: 3, fta: 4, ft_pct: 0.750 },
    },
  ],
  away_players: [
    {
      game_id: 22300001, person_id: 1628384, player_name: 'Shai Gilgeous-Alexander',
      home: false, win: false, num_minutes: 36, points: 31, assists: 5,
      rebounds_defensive: 5, rebounds_offensive: 1, rebounds_total: 6,
      steals: 3, blocks: 1, turnovers: 2, fouls_personal: 2, plus_minus: -5,
      shooting: { fgm: 10, fga: 20, fg_pct: 0.500, tpm: 2, tpa: 5, tp_pct: 0.400, ftm: 9, fta: 11, ft_pct: 0.818 },
    },
  ],
}
