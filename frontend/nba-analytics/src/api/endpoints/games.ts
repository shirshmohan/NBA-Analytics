import { apiGet, mockDelay, shouldUseMocks } from '../client'
import type {
  GameSummary,
  GameTeamStats,
  GamePlayerStats,
  PlayByPlayEvent,
  GameFilters,
} from '@/types'
import {
  mockGameSearch,
  mockGameTypes,
  mockGameLabels,
  mockGameSubLabels,
  mockGameTeamStats,
  mockGamePlayerStats,
  mockPlayByPlay,
} from '@/mocks/games'

export async function searchGames(filters: GameFilters): Promise<GameSummary[]> {
  if (shouldUseMocks()) {
    let results = [...mockGameSearch]
    if (filters.q) {
      const q = filters.q.toLowerCase()
      results = results.filter(
        g =>
          g.home_team.toLowerCase().includes(q) ||
          g.away_team.toLowerCase().includes(q) ||
          g.home_tricode.toLowerCase().includes(q) ||
          g.away_tricode.toLowerCase().includes(q)
      )
    }
    if (filters.game_type) {
      results = results.filter(g => g.game_type === filters.game_type)
    }
    if (filters.game_label) {
      results = results.filter(g => g.game_label === filters.game_label)
    }
    if (filters.date_from) {
      results = results.filter(g => g.game_date >= filters.date_from!)
    }
    if (filters.date_to) {
      results = results.filter(g => g.game_date <= filters.date_to!)
    }
    return mockDelay(results.slice(0, filters.limit ?? 20))
  }
  return apiGet<GameSummary[]>('/games/search', filters as Record<string, string | number | boolean | undefined | null>)
}

function parseFilterResponse(data: unknown): string[] {
  if (Array.isArray(data)) {
    return data.map(item => {
      if (typeof item === 'string') return item
      if (typeof item === 'object' && item !== null) {
        const obj = item as Record<string, unknown>
        return String(obj.label ?? obj.value ?? obj.name ?? '')
      }
      return String(item)
    }).filter(Boolean)
  }
  return []
}

export async function getGameTypes(): Promise<string[]> {
  if (shouldUseMocks()) return mockDelay(mockGameTypes)
  const raw = await apiGet<unknown>('/games/filters/game-types')
  return parseFilterResponse(raw)
}

export async function getGameLabels(): Promise<string[]> {
  if (shouldUseMocks()) return mockDelay(mockGameLabels)
  const raw = await apiGet<unknown>('/games/filters/game-labels')
  return parseFilterResponse(raw)
}

export async function getGameSubLabels(): Promise<string[]> {
  if (shouldUseMocks()) return mockDelay(mockGameSubLabels)
  const raw = await apiGet<unknown>('/games/filters/game-sub-labels')
  return parseFilterResponse(raw)
}

export async function getGameTeamStats(gameId: string): Promise<GameTeamStats> {
  if (shouldUseMocks()) return mockDelay({ ...mockGameTeamStats, game_id: gameId })
  return apiGet<GameTeamStats>(`/games/${gameId}/team-stats`)
}

export async function getGamePlayerStats(gameId: string): Promise<GamePlayerStats> {
  if (shouldUseMocks()) return mockDelay({ ...mockGamePlayerStats, game_id: gameId })
  return apiGet<GamePlayerStats>(`/games/${gameId}/player-stats`)
}

export interface GamePbpParams {
  period?: number
  player_id?: number
  team?: string
  action_type?: string
}

export async function getGamePlayByPlay(gameId: string, params: GamePbpParams = {}): Promise<PlayByPlayEvent[]> {
  if (shouldUseMocks()) {
    let events = [...mockPlayByPlay]
    if (params.period) events = events.filter(e => e.period === params.period)
    if (params.team) events = events.filter(e => e.teamTricode === params.team)
    if (params.action_type) events = events.filter(e => e.actionType === params.action_type)
    return mockDelay(events)
  }
  return apiGet<PlayByPlayEvent[]>(
    `/games/${gameId}/play-by-play`,
    params as Record<string, string | number | boolean | undefined | null>
  )
}
