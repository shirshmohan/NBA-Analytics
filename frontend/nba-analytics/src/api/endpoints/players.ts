import { apiGet, mockDelay, shouldUseMocks } from '../client'
import type {
  PlayerSearchResult,
  PlayerDashboard,
  PlayerAccolades,
  SeasonPercentiles,
  SeasonRanks,
  PlayerPlayByPlayEvent,
} from '@/types'
import {
  mockPlayerSearch,
  mockPlayerDashboard,
  mockPlayerAccolades,
  mockSeasonPercentiles,
  mockSeasonRanks,
  mockPlayerPbp,
} from '@/mocks/players'

export async function searchPlayers(q: string, limit = 10): Promise<PlayerSearchResult[]> {
  if (shouldUseMocks()) {
    const filtered = mockPlayerSearch.filter(p =>
      p.full_name.toLowerCase().includes(q.toLowerCase())
    )
    return mockDelay(filtered.slice(0, limit))
  }
  return apiGet<PlayerSearchResult[]>('/players/search', { q, limit })
}

export async function getPlayerDashboard(playerName: string): Promise<PlayerDashboard> {
  if (shouldUseMocks()) {
    return mockDelay({ ...mockPlayerDashboard, player: playerName })
  }
  return apiGet<PlayerDashboard>(`/players/${encodeURIComponent(playerName)}/dashboard`)
}

export async function getPlayerAccolades(playerName: string): Promise<PlayerAccolades> {
  if (shouldUseMocks()) {
    return mockDelay({ ...mockPlayerAccolades, player: playerName })
  }
  return apiGet<PlayerAccolades>(`/players/${encodeURIComponent(playerName)}/accolades`)
}

export async function getPlayerSeasonPercentiles(
  playerName: string,
  season: number,
  minGames = 30
): Promise<SeasonPercentiles> {
  if (shouldUseMocks()) {
    return mockDelay({ ...mockSeasonPercentiles, player: playerName, season })
  }
  return apiGet<SeasonPercentiles>(`/players/${encodeURIComponent(playerName)}/season-percentiles`, {
    season,
    min_games: minGames,
  })
}

export async function getPlayerSeasonRanks(
  playerName: string,
  season: number,
  minGames = 30
): Promise<SeasonRanks> {
  if (shouldUseMocks()) {
    return mockDelay({ ...mockSeasonRanks, player: playerName, season })
  }
  return apiGet<SeasonRanks>(`/players/${encodeURIComponent(playerName)}/season-ranks`, {
    season,
    min_games: minGames,
  })
}

export interface PlayerPbpParams {
  season?: number
  game_id?: string
  actionType?: string
  period?: number
}

export async function getPlayerPlayByPlay(
  playerName: string,
  params: PlayerPbpParams = {}
): Promise<PlayerPlayByPlayEvent[]> {
  if (shouldUseMocks()) {
    return mockDelay(mockPlayerPbp)
  }
  return apiGet<PlayerPlayByPlayEvent[]>(
    `/players/${encodeURIComponent(playerName)}/play-by-play`,
    params as Record<string, string | number | boolean | undefined | null>
  )
}
