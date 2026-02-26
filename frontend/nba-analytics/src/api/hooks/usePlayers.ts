import { useQuery } from '@tanstack/react-query'
import {
  searchPlayers,
  getPlayerDashboard,
  getPlayerAccolades,
  getPlayerSeasonPercentiles,
  getPlayerSeasonRanks,
  getPlayerPlayByPlay,
} from '../endpoints/players'
import type { PlayerPbpParams } from '../endpoints/players'

export function usePlayerSearch(q: string, limit = 10) {
  return useQuery({
    queryKey: ['players', 'search', q, limit],
    queryFn: () => searchPlayers(q, limit),
    enabled: q.length >= 2,
    staleTime: 30_000,
  })
}

export function usePlayerDashboard(playerName: string | null) {
  return useQuery({
    queryKey: ['player', 'dashboard', playerName],
    queryFn: () => getPlayerDashboard(playerName!),
    enabled: !!playerName,
  })
}

export function usePlayerAccolades(playerName: string | null) {
  return useQuery({
    queryKey: ['player', 'accolades', playerName],
    queryFn: () => getPlayerAccolades(playerName!),
    enabled: !!playerName,
  })
}

export function usePlayerSeasonPercentiles(playerName: string | null, season: number | null, minGames = 30) {
  return useQuery({
    queryKey: ['player', 'percentiles', playerName, season, minGames],
    queryFn: () => getPlayerSeasonPercentiles(playerName!, season!, minGames),
    enabled: !!playerName && !!season,
  })
}

export function usePlayerSeasonRanks(playerName: string | null, season: number | null, minGames = 30) {
  return useQuery({
    queryKey: ['player', 'ranks', playerName, season, minGames],
    queryFn: () => getPlayerSeasonRanks(playerName!, season!, minGames),
    enabled: !!playerName && !!season,
  })
}

export function usePlayerPlayByPlay(playerName: string | null, params: PlayerPbpParams = {}) {
  return useQuery({
    queryKey: ['player', 'pbp', playerName, params],
    queryFn: () => getPlayerPlayByPlay(playerName!, params),
    enabled: !!playerName,
  })
}
