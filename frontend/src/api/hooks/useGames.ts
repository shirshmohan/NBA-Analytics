import { useQuery } from '@tanstack/react-query'
import type { GameFilters } from '@/types'
import {
  searchGames,
  getGameTypes,
  getGameLabels,
  getGameSubLabels,
  getGameTeamStats,
  getGamePlayerStats,
  getGamePbpSequence,
  getGameShotDistribution,
  getGameTeamEfficiency,
  getGameKeyEvents,
  getGameScoringRuns,
  getPlayerGameTimeline,
  getPlayerGameShotZones,
} from '../endpoints/games'

export function useGameSearch(filters: GameFilters | null) {
  return useQuery({
    queryKey: ['games', 'search', filters],
    queryFn: () => searchGames(filters!),
    enabled: !!filters && filters.team1.trim().length >= 1,
    staleTime: 1000 * 60 * 5,
  })
}

export function useGameTypes() {
  return useQuery({
    queryKey: ['games', 'filters', 'types'],
    queryFn: getGameTypes,
    staleTime: 1000 * 60 * 60,
  })
}

export function useGameLabels(gameType: string | null) {
  return useQuery({
    queryKey: ['games', 'filters', 'labels', gameType],
    queryFn: () => getGameLabels(gameType!),
    enabled: !!gameType,
    staleTime: 1000 * 60 * 60,
  })
}

export function useGameSubLabels(gameType: string | null, gameLabel: string | null) {
  return useQuery({
    queryKey: ['games', 'filters', 'sublabels', gameType, gameLabel],
    queryFn: () => getGameSubLabels(gameType!, gameLabel!),
    enabled: !!gameType && !!gameLabel,
    staleTime: 1000 * 60 * 60,
  })
}

// SQLAlchemy routes
export function useGameTeamStats(gameId: number | null) {
  return useQuery({
    queryKey: ['games', 'team-stats', gameId],
    queryFn: () => getGameTeamStats(gameId!),
    enabled: !!gameId,
    staleTime: 1000 * 60 * 60,
  })
}

export function useGamePlayerStats(gameId: number | null) {
  return useQuery({
    queryKey: ['games', 'player-stats', gameId],
    queryFn: () => getGamePlayerStats(gameId!),
    enabled: !!gameId,
    staleTime: 1000 * 60 * 60,
  })
}

// DuckDB / parquet routes
export function useGamePbpSequence(gameId: number | null) {
  return useQuery({
    queryKey: ['game', 'pbp-sequence', gameId],
    queryFn: () => getGamePbpSequence(gameId!),
    enabled: !!gameId,
    staleTime: 1000 * 60 * 60,
  })
}

export function useGameShotDistribution(gameId: number | null) {
  return useQuery({
    queryKey: ['game', 'shot-distribution', gameId],
    queryFn: () => getGameShotDistribution(gameId!),
    enabled: !!gameId,
    staleTime: 1000 * 60 * 60,
  })
}

export function useGameTeamEfficiency(gameId: number | null) {
  return useQuery({
    queryKey: ['game', 'team-efficiency', gameId],
    queryFn: () => getGameTeamEfficiency(gameId!),
    enabled: !!gameId,
    staleTime: 1000 * 60 * 60,
  })
}

export function useGameKeyEvents(gameId: number | null) {
  return useQuery({
    queryKey: ['game', 'key-events', gameId],
    queryFn: () => getGameKeyEvents(gameId!),
    enabled: !!gameId,
    staleTime: 1000 * 60 * 60,
  })
}

export function useGameScoringRuns(gameId: number | null) {
  return useQuery({
    queryKey: ['game', 'scoring-runs', gameId],
    queryFn: () => getGameScoringRuns(gameId!),
    enabled: !!gameId,
    staleTime: 1000 * 60 * 60,
  })
}

// Player-in-game routes
export function usePlayerGameTimeline(gameId: number | null, playerId: number | null) {
  return useQuery({
    queryKey: ['player', 'timeline', gameId, playerId],
    queryFn: () => getPlayerGameTimeline(gameId!, playerId!),
    enabled: !!gameId && !!playerId,
    staleTime: 1000 * 60 * 60,
  })
}

export function usePlayerGameShotZones(gameId: number | null, playerId: number | null) {
  return useQuery({
    queryKey: ['player', 'shot-zones', gameId, playerId],
    queryFn: () => getPlayerGameShotZones(gameId!, playerId!),
    enabled: !!gameId && !!playerId,
    staleTime: 1000 * 60 * 60,
  })
}
