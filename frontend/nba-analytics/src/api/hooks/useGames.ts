import { useQuery } from '@tanstack/react-query'
import {
  searchGames,
  getGameTypes,
  getGameLabels,
  getGameSubLabels,
  getGameTeamStats,
  getGamePlayerStats,
  getGamePlayByPlay,
} from '../endpoints/games'
import type { GameFilters, GamePbpParams } from '../endpoints/games'

export function useGameSearch(filters: GameFilters, enabled = true) {
  return useQuery({
    queryKey: ['games', 'search', filters],
    queryFn: () => searchGames(filters),
    enabled,
  })
}

export function useGameTypes() {
  return useQuery({
    queryKey: ['games', 'filters', 'types'],
    queryFn: getGameTypes,
    staleTime: Infinity,
  })
}

export function useGameLabels() {
  return useQuery({
    queryKey: ['games', 'filters', 'labels'],
    queryFn: getGameLabels,
    staleTime: Infinity,
  })
}

export function useGameSubLabels() {
  return useQuery({
    queryKey: ['games', 'filters', 'sub-labels'],
    queryFn: getGameSubLabels,
    staleTime: Infinity,
  })
}

export function useGameTeamStats(gameId: string | null) {
  return useQuery({
    queryKey: ['game', 'team-stats', gameId],
    queryFn: () => getGameTeamStats(gameId!),
    enabled: !!gameId,
  })
}

export function useGamePlayerStats(gameId: string | null) {
  return useQuery({
    queryKey: ['game', 'player-stats', gameId],
    queryFn: () => getGamePlayerStats(gameId!),
    enabled: !!gameId,
  })
}

export function useGamePlayByPlay(gameId: string | null, params: GamePbpParams = {}) {
  return useQuery({
    queryKey: ['game', 'pbp', gameId, params],
    queryFn: () => getGamePlayByPlay(gameId!, params),
    enabled: !!gameId,
  })
}
