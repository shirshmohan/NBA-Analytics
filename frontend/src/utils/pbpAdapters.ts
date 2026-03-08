import type { ScoreTimelinePoint, ShotZone } from '@/types'

// Converts PBP sequence from /game/{id}/pbp-sequence into chart-ready timeline
export function buildScoreTimeline(
  events: { period: number; actionNumber: number; clock: string; scoreHome: string; scoreAway: string }[]
): ScoreTimelinePoint[] {
  return events.map(e => ({
    actionNumber: e.actionNumber,
    period: e.period,
    clock: e.clock,
    home_score: Number(e.scoreHome),
    away_score: Number(e.scoreAway),
  }))
}

// Shot zones now come directly from /game/{id}/shot-distribution
// This stub remains for any legacy reference
export function buildShotZones(_events: unknown[]): ShotZone[] {
  return []
}

// Event category labels for timeline display
export const EVENT_ICONS: Record<string, string> = {
  'shot':     '🏀',
  'assist':   '🤝',
  'rebound':  '💪',
  'turnover': '❌',
  'steal':    '🔒',
  'block':    '🛡️',
  'foul':     '✋',
}

export const EVENT_COLORS: Record<string, string> = {
  'shot':     '#f97316',
  'assist':   '#06b6d4',
  'rebound':  '#8b5cf6',
  'turnover': '#ef4444',
  'steal':    '#22c55e',
  'block':    '#3b82f6',
  'foul':     '#eab308',
}
