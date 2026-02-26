import type {
  GameSummary,
  GameTeamStats,
  GamePlayerStats,
  PlayByPlayEvent,
} from '@/types'

export const mockGameSearch: GameSummary[] = [
  {
    game_id: '0022301191',
    game_date: '2024-04-14',
    home_team: 'Golden State Warriors',
    away_team: 'Oklahoma City Thunder',
    home_tricode: 'GSW',
    away_tricode: 'OKC',
    home_score: 128,
    away_score: 124,
    game_type: 'Regular Season',
    game_label: null,
    game_sub_label: null,
    status: 'Final',
  },
  {
    game_id: '0022301190',
    game_date: '2024-04-14',
    home_team: 'Boston Celtics',
    away_team: 'Washington Wizards',
    home_tricode: 'BOS',
    away_tricode: 'WAS',
    home_score: 140,
    away_score: 105,
    game_type: 'Regular Season',
    game_label: null,
    game_sub_label: null,
    status: 'Final',
  },
  {
    game_id: '0022301189',
    game_date: '2024-04-13',
    home_team: 'Los Angeles Lakers',
    away_team: 'New Orleans Pelicans',
    home_tricode: 'LAL',
    away_tricode: 'NOP',
    home_score: 115,
    away_score: 113,
    game_type: 'Regular Season',
    game_label: null,
    game_sub_label: null,
    status: 'Final',
  },
  {
    game_id: '0022301188',
    game_date: '2024-04-13',
    home_team: 'Milwaukee Bucks',
    away_team: 'Miami Heat',
    home_tricode: 'MIL',
    away_tricode: 'MIA',
    home_score: 122,
    away_score: 111,
    game_type: 'Regular Season',
    game_label: null,
    game_sub_label: null,
    status: 'Final',
  },
  {
    game_id: '0042300241',
    game_date: '2024-05-27',
    home_team: 'Indiana Pacers',
    away_team: 'Boston Celtics',
    home_tricode: 'IND',
    away_tricode: 'BOS',
    home_score: 108,
    away_score: 114,
    game_type: 'Playoffs',
    game_label: 'ECF',
    game_sub_label: 'Game 4',
    status: 'Final',
  },
]

export const mockGameTypes = ['Regular Season', 'Playoffs', 'Play-In', 'Preseason', 'All-Star']
export const mockGameLabels = ['ECF', 'WCF', 'Finals', 'Second Round', 'First Round']
export const mockGameSubLabels = ['Game 1', 'Game 2', 'Game 3', 'Game 4', 'Game 5', 'Game 6', 'Game 7']

export const mockGameTeamStats: GameTeamStats = {
  game_id: '0022301191',
  home: {
    team: 'Golden State Warriors',
    tricode: 'GSW',
    pts: 128,
    reb: 42,
    ast: 32,
    stl: 9,
    blk: 5,
    tov: 12,
    pf: 21,
    fg_pct: 0.502,
    x3p_pct: 0.408,
    ft_pct: 0.812,
  },
  away: {
    team: 'Oklahoma City Thunder',
    tricode: 'OKC',
    pts: 124,
    reb: 39,
    ast: 28,
    stl: 7,
    blk: 4,
    tov: 15,
    pf: 23,
    fg_pct: 0.476,
    x3p_pct: 0.372,
    ft_pct: 0.889,
  },
}

export const mockGamePlayerStats: GamePlayerStats = {
  game_id: '0022301191',
  home_tricode: 'GSW',
  away_tricode: 'OKC',
  home_players: [
    { person_id: 201939, player: 'Stephen Curry', min: '34:22', pts: 38, reb: 4, ast: 9, stl: 2, blk: 0, tov: 4, pf: 2, fgm: 13, fga: 25, x3pm: 7, x3pa: 14, ftm: 5, fta: 5, plus_minus: 12 },
    { person_id: 1628384, player: 'Klay Thompson', min: '32:11', pts: 22, reb: 4, ast: 2, stl: 1, blk: 1, tov: 1, pf: 3, fgm: 8, fga: 18, x3pm: 4, x3pa: 10, ftm: 2, fta: 2, plus_minus: 5 },
    { person_id: 1628366, player: 'Jordan Poole', min: '28:44', pts: 18, reb: 2, ast: 6, stl: 0, blk: 0, tov: 3, pf: 4, fgm: 6, fga: 14, x3pm: 3, x3pa: 8, ftm: 3, fta: 4, plus_minus: -2 },
    { person_id: 203110, player: 'Draymond Green', min: '31:05', pts: 8, reb: 9, ast: 11, stl: 2, blk: 2, tov: 3, pf: 5, fgm: 4, fga: 8, x3pm: 0, x3pa: 2, ftm: 0, fta: 0, plus_minus: 8 },
    { person_id: 1641705, player: 'Jonathan Kuminga', min: '25:30', pts: 14, reb: 6, ast: 2, stl: 2, blk: 1, tov: 1, pf: 3, fgm: 5, fga: 9, x3pm: 1, x3pa: 3, ftm: 3, fta: 4, plus_minus: 4 },
    { person_id: 1628442, player: 'Moses Moody', min: '18:22', pts: 12, reb: 3, ast: 1, stl: 1, blk: 0, tov: 0, pf: 1, fgm: 4, fga: 7, x3pm: 2, x3pa: 4, ftm: 2, fta: 2, plus_minus: 6 },
    { person_id: 203944, player: 'Gary Payton II', min: '22:15', pts: 8, reb: 3, ast: 2, stl: 1, blk: 2, tov: 0, pf: 2, fgm: 3, fga: 5, x3pm: 1, x3pa: 2, ftm: 1, fta: 1, plus_minus: 3 },
  ],
  away_players: [
    { person_id: 1641706, player: 'Shai Gilgeous-Alexander', min: '36:44', pts: 35, reb: 5, ast: 7, stl: 3, blk: 1, tov: 4, pf: 2, fgm: 12, fga: 24, x3pm: 2, x3pa: 7, ftm: 9, fta: 10, plus_minus: -6 },
    { person_id: 1628386, player: 'Josh Giddey', min: '30:11', pts: 14, reb: 8, ast: 9, stl: 1, blk: 0, tov: 3, pf: 3, fgm: 6, fga: 12, x3pm: 1, x3pa: 4, ftm: 1, fta: 2, plus_minus: -3 },
    { person_id: 1629029, player: 'Chet Holmgren', min: '32:25', pts: 22, reb: 10, ast: 2, stl: 0, blk: 5, tov: 2, pf: 3, fgm: 8, fga: 14, x3pm: 3, x3pa: 6, ftm: 3, fta: 4, plus_minus: -2 },
    { person_id: 1630578, player: 'Luguentz Dort', min: '28:00', pts: 18, reb: 3, ast: 1, stl: 2, blk: 0, tov: 1, pf: 4, fgm: 7, fga: 15, x3pm: 3, x3pa: 8, ftm: 1, fta: 1, plus_minus: -4 },
    { person_id: 1630195, player: 'Isaiah Joe', min: '22:33', pts: 12, reb: 2, ast: 2, stl: 0, blk: 1, tov: 2, pf: 2, fgm: 4, fga: 9, x3pm: 3, x3pa: 7, ftm: 1, fta: 2, plus_minus: -5 },
    { person_id: 1628408, player: 'Kenrich Williams', min: '18:00', pts: 6, reb: 5, ast: 3, stl: 0, blk: 1, tov: 2, pf: 2, fgm: 3, fga: 6, x3pm: 0, x3pa: 2, ftm: 0, fta: 0, plus_minus: -2 },
    { person_id: 1641709, player: 'Jalen Williams', min: '25:00', pts: 17, reb: 4, ast: 3, stl: 1, blk: 0, tov: 1, pf: 3, fgm: 6, fga: 11, x3pm: 2, x3pa: 5, ftm: 3, fta: 4, plus_minus: -1 },
  ],
}

// Generate a mock play-by-play
function generatePbp(): PlayByPlayEvent[] {
  const events: PlayByPlayEvent[] = []
  let homeScore = 0
  let awayScore = 0
  const totalSeconds = 2880

  const actionTypes = ['2pt', '3pt', '2pt', 'assist', 'turnover', 'foul', 'rebound', '2pt', '3pt', '2pt']

  for (let t = 0; t < totalSeconds; t += Math.floor(Math.random() * 30) + 8) {
    const period = Math.floor(t / 720) + 1
    const periodTime = t % 720
    const clockSec = 720 - periodTime
    const mm = Math.floor(clockSec / 60)
    const ss = clockSec % 60
    const clock = `${mm}:${ss.toString().padStart(2, '0')}`
    const isHome = Math.random() > 0.5
    const tricode = isHome ? 'GSW' : 'OKC'
    const actionType = actionTypes[Math.floor(Math.random() * actionTypes.length)]

    let pts = 0
    let shotResult: 'Made' | 'Missed' | null = null
    let description = ''
    let x: number | null = null
    let y: number | null = null

    if (actionType === '3pt') {
      shotResult = Math.random() > 0.62 ? 'Made' : 'Missed'
      pts = shotResult === 'Made' ? 3 : 0
      description = `3PT Jump Shot (${shotResult})`
      x = (Math.random() > 0.5 ? 1 : -1) * (180 + Math.random() * 60)
      y = (Math.random() - 0.5) * 160
    } else if (actionType === '2pt') {
      shotResult = Math.random() > 0.45 ? 'Made' : 'Missed'
      pts = shotResult === 'Made' ? 2 : 0
      description = `2PT Driving Layup (${shotResult})`
      x = (Math.random() - 0.5) * 120
      y = (Math.random() - 0.5) * 80
    } else if (actionType === 'assist') {
      description = 'Assist'
    } else if (actionType === 'turnover') {
      description = 'Bad Pass Turnover'
    } else if (actionType === 'foul') {
      description = 'Personal Foul'
    } else {
      description = 'Defensive Rebound'
    }

    if (isHome) homeScore += pts
    else awayScore += pts

    events.push({
      period: Math.min(period, 4),
      clock,
      time_sec: t,
      actionType,
      description,
      teamTricode: tricode,
      playerName: isHome ? 'Stephen Curry' : 'Shai Gilgeous-Alexander',
      personId: isHome ? 201939 : 1641706,
      shotValue: actionType === '3pt' ? 3 : actionType === '2pt' ? 2 : null,
      shotResult,
      x,
      y,
    })
  }

  return events
}

export const mockPlayByPlay: PlayByPlayEvent[] = generatePbp()
