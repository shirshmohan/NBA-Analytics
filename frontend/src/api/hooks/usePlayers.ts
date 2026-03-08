import { useQuery } from '@tanstack/react-query'
import {
  searchPlayers,
  getPlayerDashboard,
  getPlayerAccolades,
  getPlayerSeasonPercentiles,
  getPlayerSeasonRanks,
} from '../endpoints/players'

export function usePlayerSearch(q: string, limit = 25) {
  return useQuery({
    queryKey: ['players', 'search', q, limit],
    queryFn: () => searchPlayers(q, limit),
    enabled: q.trim().length >= 1,
    staleTime: 1000 * 60 * 5,
  })
}

export function usePlayerDashboard(playerName: string | null) {
  return useQuery({
    queryKey: ['players', 'dashboard', playerName],
    queryFn: () => getPlayerDashboard(playerName!),
    enabled: !!playerName,
    staleTime: 1000 * 60 * 10,
  })
}

export function usePlayerAccolades(playerName: string | null) {
  return useQuery({
    queryKey: ['players', 'accolades', playerName],
    queryFn: () => getPlayerAccolades(playerName!),
    enabled: !!playerName,
    staleTime: 1000 * 60 * 30,
  })
}

export function usePlayerSeasonPercentiles(
  playerName: string | null,
  season: number | null,
  minGames = 30
) {
  return useQuery({
    queryKey: ['players', 'percentiles', playerName, season, minGames],
    queryFn: () => getPlayerSeasonPercentiles(playerName!, season!, minGames),
    enabled: !!playerName && !!season,
    staleTime: 1000 * 60 * 10,
  })
}

export function usePlayerSeasonRanks(
  playerName: string | null,
  season: number | null,
  minGames = 30
) {
  return useQuery({
    queryKey: ['players', 'ranks', playerName, season, minGames],
    queryFn: () => getPlayerSeasonRanks(playerName!, season!, minGames),
    enabled: !!playerName && !!season,
    staleTime: 1000 * 60 * 10,
  })
}
