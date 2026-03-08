import { apiGet, mockDelay, shouldUseMocks } from '../client'
import type {
  GameFilters,
  GameSearchResponse,
  GameTeamStatsResponse,
  GamePlayerStatsResponse,
  PbpScorePoint,
  ShotDistributionEntry,
  TeamEfficiencyEntry,
  KeyEvent,
  ScoringRun,
  PlayerTimelineEvent,
  PlayerShotZone,
} from '@/types'
import {
  mockGameSearch,
  mockGameTypes,
  mockGameLabels,
  mockGameTeamStats,
  mockGamePlayerStats,
} from '@/mocks/games'

// ─── Game Search ──────────────────────────────────────────────────────────────
// GET /games/search?team1=&team2=&season=&game_type=&game_label=&...
export async function searchGames(filters: GameFilters): Promise<GameSearchResponse> {
  if (shouldUseMocks()) {
    return mockDelay({
      resolved_inputs: { team1: filters.team1, team2: filters.team2 ?? null, season: null, game_type: null, game_label: null },
      count: mockGameSearch.length,
      limit: filters.limit ?? 50,
      offset: filters.offset ?? 0,
      items: mockGameSearch,
    })
  }
  return apiGet<GameSearchResponse>('/games/search', filters as unknown as Record<string, string | number | undefined>)
}

// ─── Filter dropdowns ─────────────────────────────────────────────────────────
// GET /games/filters/game-types → {game_types: string[]}
export async function getGameTypes(): Promise<string[]> {
  if (shouldUseMocks()) return mockDelay(mockGameTypes)
  const raw = await apiGet<{ game_types: string[] }>('/games/filters/game-types')
  return raw.game_types
}

// GET /games/filters/game-labels?game_type= → {game_labels: string[]}
export async function getGameLabels(gameType: string): Promise<string[]> {
  if (shouldUseMocks()) return mockDelay(mockGameLabels)
  const raw = await apiGet<{ game_labels: string[] }>('/games/filters/game-labels', { game_type: gameType })
  return raw.game_labels
}

// GET /games/filters/game-sub-labels?game_type=&game_label= → {game_sub_labels: string[]}
export async function getGameSubLabels(gameType: string, gameLabel: string): Promise<string[]> {
  if (shouldUseMocks()) return mockDelay([])
  const raw = await apiGet<{ game_sub_labels: string[] }>('/games/filters/game-sub-labels', {
    game_type: gameType,
    game_label: gameLabel,
  })
  return raw.game_sub_labels
}

// ─── Game detail — SQLAlchemy routes (/games prefix) ─────────────────────────
// GET /games/{game_id}/team-stats
export async function getGameTeamStats(gameId: number): Promise<GameTeamStatsResponse> {
  if (shouldUseMocks()) return mockDelay(mockGameTeamStats as unknown as GameTeamStatsResponse)
  return apiGet<GameTeamStatsResponse>(`/games/${gameId}/team-stats`)
}

// GET /games/{game_id}/player-stats
export async function getGamePlayerStats(gameId: number): Promise<GamePlayerStatsResponse> {
  if (shouldUseMocks()) return mockDelay(mockGamePlayerStats as unknown as GamePlayerStatsResponse)
  return apiGet<GamePlayerStatsResponse>(`/games/${gameId}/player-stats`)
}

// ─── PBP / parquet routes (/game prefix — different router!) ─────────────────
// GET /game/{game_id}/pbp-sequence
export async function getGamePbpSequence(gameId: number): Promise<PbpScorePoint[]> {
  if (shouldUseMocks()) return mockDelay([])
  return apiGet<PbpScorePoint[]>(`/game/${gameId}/pbp-sequence`)
}

// GET /game/{game_id}/shot-distribution
export async function getGameShotDistribution(gameId: number): Promise<ShotDistributionEntry[]> {
  if (shouldUseMocks()) return mockDelay([])
  return apiGet<ShotDistributionEntry[]>(`/game/${gameId}/shot-distribution`)
}

// GET /game/{game_id}/team-efficiency
export async function getGameTeamEfficiency(gameId: number): Promise<TeamEfficiencyEntry[]> {
  if (shouldUseMocks()) return mockDelay([])
  return apiGet<TeamEfficiencyEntry[]>(`/game/${gameId}/team-efficiency`)
}

// GET /game/{game_id}/key-events
export async function getGameKeyEvents(gameId: number): Promise<KeyEvent[]> {
  if (shouldUseMocks()) return mockDelay([])
  return apiGet<KeyEvent[]>(`/game/${gameId}/key-events`)
}

// GET /game/{game_id}/scoring-runs
export async function getGameScoringRuns(gameId: number): Promise<ScoringRun[]> {
  if (shouldUseMocks()) return mockDelay([])
  return apiGet<ScoringRun[]>(`/game/${gameId}/scoring-runs`)
}

// ─── Player-in-game routes (/player prefix) ───────────────────────────────────
// GET /player/{game_id}/{player_id}/timeline
export async function getPlayerGameTimeline(gameId: number, playerId: number): Promise<PlayerTimelineEvent[]> {
  if (shouldUseMocks()) return mockDelay([])
  return apiGet<PlayerTimelineEvent[]>(`/player/${gameId}/${playerId}/timeline`)
}

// GET /player/{game_id}/{player_id}/shot-zones
export async function getPlayerGameShotZones(gameId: number, playerId: number): Promise<PlayerShotZone[]> {
  if (shouldUseMocks()) return mockDelay([])
  return apiGet<PlayerShotZone[]>(`/player/${gameId}/${playerId}/shot-zones`)
}
