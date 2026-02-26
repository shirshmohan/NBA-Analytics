import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useGameSearch, useGameTypes, useGameLabels, useGameSubLabels } from '@/api/hooks/useGames'
import { Select } from '@/components/ui/Select'
import { Skeleton } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/ErrorState'
import { Badge } from '@/components/ui/Badge'
import GameDetailView from '@/components/games/GameDetailView'
import { fmtDate, teamColor } from '@/utils/formatters'
import type { GameFilters } from '@/types'

export default function GamesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [filters, setFilters] = useState<GameFilters>({
    q: '',
    date_from: '',
    date_to: '',
    game_type: '',
    game_label: '',
  })
  const [selectedGameId, setSelectedGameId] = useState<string | null>(searchParams.get('game'))
  const [searching, setSearching] = useState(false)

  const typesQ = useGameTypes()
  const labelsQ = useGameLabels()
  const subLabelsQ = useGameSubLabels()

  useEffect(() => {
    setSearching(true)
    const t = setTimeout(() => setSearching(false), 100)
    return () => clearTimeout(t)
  }, [filters])

  const gamesQ = useGameSearch(filters)

  useEffect(() => {
    const g = searchParams.get('game')
    if (g) setSelectedGameId(g)
  }, [searchParams])

  function setFilter(key: keyof GameFilters, value: string) {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  function selectGame(id: string) {
    setSelectedGameId(id)
    setSearchParams({ game: id })
  }

  return (
    <div className="min-h-screen pt-14">
      <div className="border-b border-white/6 py-4 px-4 md:px-8"
        style={{ background: 'rgba(7,15,26,0.9)', backdropFilter: 'blur(10px)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">🏀</span>
            <div>
              <h1 className="font-display text-2xl text-white tracking-widest">GAMES</h1>
              <p className="text-xs text-slate-500">Search and analyze game data</p>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            <div className="col-span-2">
              <input
                value={filters.q ?? ''}
                onChange={e => setFilter('q', e.target.value)}
                placeholder="Search teams..."
                className="input-dark"
              />
            </div>
            <div>
              <input
                type="date"
                value={filters.date_from ?? ''}
                onChange={e => setFilter('date_from', e.target.value)}
                className="input-dark"
              />
            </div>
            <div>
              <input
                type="date"
                value={filters.date_to ?? ''}
                onChange={e => setFilter('date_to', e.target.value)}
                className="input-dark"
              />
            </div>
            <Select
              value={filters.game_type ?? ''}
              onChange={v => setFilter('game_type', v)}
              options={typesQ.data ?? []}
              placeholder="All Types"
            />
            <Select
              value={filters.game_label ?? ''}
              onChange={v => setFilter('game_label', v)}
              options={labelsQ.data ?? []}
              placeholder="All Labels"
            />
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-8rem)]">
        {/* Game list sidebar */}
        <div className="w-80 flex-shrink-0 border-r border-white/6 overflow-y-auto"
          style={{ background: 'rgba(7,15,26,0.5)' }}>
          <div className="p-3 border-b border-white/6">
            <div className="text-xs text-slate-500 uppercase tracking-widest">
              {gamesQ.isLoading ? 'Searching...' : `${gamesQ.data?.length ?? 0} games found`}
            </div>
          </div>

          {gamesQ.isLoading && (
            <div className="p-3 space-y-2">
              {[...Array(6)].map((_, i) => <Skeleton key={i} height="4rem" className="rounded-lg" />)}
            </div>
          )}

          {gamesQ.isError && (
            <ErrorState message="Failed to load games" onRetry={() => gamesQ.refetch()} compact />
          )}

          {gamesQ.data?.map(game => (
            <button
              key={game.game_id}
              onClick={() => selectGame(game.game_id)}
              className={`w-full p-3 border-b border-white/4 text-left hover:bg-white/5 transition-all ${selectedGameId === game.game_id ? 'bg-orange-500/10 border-orange-500/20' : ''}`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="text-xs font-bold" style={{ color: teamColor(game.away_tricode) }}>
                    {game.away_tricode}
                  </div>
                  <div className="text-xs text-slate-600">@</div>
                  <div className="text-xs font-bold" style={{ color: teamColor(game.home_tricode) }}>
                    {game.home_tricode}
                  </div>
                </div>
                {game.home_score !== undefined && (
                  <div className="text-xs font-mono text-white">
                    {game.away_score} - {game.home_score}
                  </div>
                )}
              </div>
              <div className="text-xs text-slate-600">{fmtDate(game.game_date)}</div>
              <div className="flex gap-1 mt-1">
                {game.status && (
                  <Badge
                    label={game.status}
                    color={game.status === 'Final' ? '#22c55e' : game.status === 'Live' ? '#ef4444' : '#64748b'}
                  />
                )}
                {game.game_type && <Badge label={game.game_type} color="#64748b" />}
                {game.game_label && <Badge label={game.game_label} color="#f97316" />}
              </div>
            </button>
          ))}

          {!gamesQ.isLoading && gamesQ.data?.length === 0 && (
            <div className="p-6 text-center text-slate-600 text-sm">No games found</div>
          )}
        </div>

        {/* Game detail */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {!selectedGameId ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="text-5xl mb-4 opacity-40">🏀</div>
              <h2 className="text-xl font-semibold text-slate-400 mb-2">Select a Game</h2>
              <p className="text-slate-600 text-sm">Choose a game from the list to view detailed analytics</p>
            </div>
          ) : (
            <GameDetailView gameId={selectedGameId} />
          )}
        </div>
      </div>
    </div>
  )
}
