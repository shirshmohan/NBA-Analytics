import { apiGet, mockDelay, shouldUseMocks } from '../client'
import type {
  PlayerSearchResult,
  PlayerDashboard,
  PlayerAccolades,
  SeasonPercentiles,
  SeasonRanks,
} from '@/types'
import {
  mockPlayerSearch,
  mockPlayerDashboard,
  mockPlayerAccolades,
  mockSeasonPercentiles,
  mockSeasonRanks,
} from '@/mocks/players'

// GET /players/search?q=&limit=
// Returns [{player: string}, ...]
export async function searchPlayers(q: string, limit = 25): Promise<PlayerSearchResult[]> {
  if (shouldUseMocks()) {
    const filtered = mockPlayerSearch.filter((p: PlayerSearchResult) =>
      p.player.toLowerCase().includes(q.toLowerCase())
    )
    return mockDelay(filtered.slice(0, limit))
  }
  return apiGet<PlayerSearchResult[]>('/players/search', { q, limit })
}

// GET /players/{player_name}/dashboard
export async function getPlayerDashboard(playerName: string): Promise<PlayerDashboard> {
  if (shouldUseMocks()) {
    return mockDelay({ ...mockPlayerDashboard, player: playerName })
  }
  return apiGet<PlayerDashboard>(`/players/${encodeURIComponent(playerName)}/dashboard`)
}

// GET /players/{player_name}/accolades
export async function getPlayerAccolades(playerName: string): Promise<PlayerAccolades> {
  if (shouldUseMocks()) {
    return mockDelay({ ...mockPlayerAccolades, player: playerName })
  }
  return apiGet<PlayerAccolades>(`/players/${encodeURIComponent(playerName)}/accolades`)
}

// GET /players/{player_name}/season-percentiles?season=&min_games=
// season is the 4-digit start year (e.g. 2023 for "2023-24")
export async function getPlayerSeasonPercentiles(
  playerName: string,
  season: number,
  minGames = 30
): Promise<SeasonPercentiles> {
  if (shouldUseMocks()) {
    return mockDelay({ ...mockSeasonPercentiles, player: playerName, season: String(season) })
  }
  return apiGet<SeasonPercentiles>(
    `/players/${encodeURIComponent(playerName)}/season-percentiles`,
    { season, min_games: minGames }
  )
}

// GET /players/{player_name}/season-ranks?season=&min_games=
export async function getPlayerSeasonRanks(
  playerName: string,
  season: number,
  minGames = 30
): Promise<SeasonRanks> {
  if (shouldUseMocks()) {
    return mockDelay({ ...mockSeasonRanks, player: playerName, season: String(season) })
  }
  return apiGet<SeasonRanks>(
    `/players/${encodeURIComponent(playerName)}/season-ranks`,
    { season, min_games: minGames }
  )
}
