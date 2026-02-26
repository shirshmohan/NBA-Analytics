import type { PlayByPlayEvent, ScoreTimelinePoint, ShotZone } from '@/types'

export function buildScoreTimeline(
  events: PlayByPlayEvent[],
  homeTricode: string
): ScoreTimelinePoint[] {
  let homeScore = 0
  let awayScore = 0
  const points: ScoreTimelinePoint[] = [{ time_sec: 0, label: 'Start', home_score: 0, away_score: 0, period: 1 }]

  for (const ev of events) {
    if (!ev.shotResult || ev.shotResult !== 'Made') continue
    const pts = ev.shotValue ?? 2
    if (ev.teamTricode === homeTricode) homeScore += pts
    else awayScore += pts

    const mm = Math.floor(ev.time_sec / 60)
    const ss = ev.time_sec % 60
    points.push({
      time_sec: ev.time_sec,
      label: `${mm}:${ss.toString().padStart(2, '0')}`,
      home_score: homeScore,
      away_score: awayScore,
      period: ev.period,
    })
  }

  return points
}

export function buildShotZones(events: PlayByPlayEvent[]): ShotZone[] {
  const zones: Record<string, { made: number; attempted: number }> = {
    'Rim (0-4ft)': { made: 0, attempted: 0 },
    'Short Mid (5-14ft)': { made: 0, attempted: 0 },
    'Long Mid (15-19ft)': { made: 0, attempted: 0 },
    '3-Pointer': { made: 0, attempted: 0 },
  }

  for (const ev of events) {
    if (ev.shotValue === null) continue
    if (ev.shotValue === 3) {
      zones['3-Pointer'].attempted++
      if (ev.shotResult === 'Made') zones['3-Pointer'].made++
      continue
    }
    if (ev.x === null || ev.y === null) {
      zones['Short Mid (5-14ft)'].attempted++
      if (ev.shotResult === 'Made') zones['Short Mid (5-14ft)'].made++
      continue
    }
    const dist = Math.sqrt(ev.x ** 2 + ev.y ** 2)
    if (dist < 40) {
      zones['Rim (0-4ft)'].attempted++
      if (ev.shotResult === 'Made') zones['Rim (0-4ft)'].made++
    } else if (dist < 120) {
      zones['Short Mid (5-14ft)'].attempted++
      if (ev.shotResult === 'Made') zones['Short Mid (5-14ft)'].made++
    } else {
      zones['Long Mid (15-19ft)'].attempted++
      if (ev.shotResult === 'Made') zones['Long Mid (15-19ft)'].made++
    }
  }

  return Object.entries(zones).map(([zone, { made, attempted }]) => ({
    zone,
    made,
    attempted,
    pct: attempted > 0 ? made / attempted : 0,
  }))
}

export function buildTeamEventTimeline(events: PlayByPlayEvent[]) {
  return events.map(ev => ({
    ...ev,
    category: categorizeEvent(ev.actionType),
  }))
}

function categorizeEvent(actionType: string): string {
  const type = actionType.toLowerCase()
  if (type.includes('2pt') || type.includes('3pt') || type.includes('shot')) return 'shot'
  if (type === 'assist') return 'assist'
  if (type === 'turnover') return 'turnover'
  if (type.includes('foul')) return 'foul'
  if (type.includes('rebound')) return 'rebound'
  if (type.includes('block')) return 'block'
  if (type.includes('steal')) return 'steal'
  return 'other'
}

export const EVENT_ICONS: Record<string, string> = {
  shot: '🏀',
  assist: '🎯',
  turnover: '❌',
  foul: '🚫',
  rebound: '💪',
  block: '🛡️',
  steal: '⚡',
  other: '•',
}

export const EVENT_COLORS: Record<string, string> = {
  shot: '#f97316',
  assist: '#06b6d4',
  turnover: '#ef4444',
  foul: '#f59e0b',
  rebound: '#8b5cf6',
  block: '#10b981',
  steal: '#eab308',
  other: '#64748b',
}
