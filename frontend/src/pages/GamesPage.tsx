import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useGameSearch, useGameTypes, useGameLabels } from '@/api/hooks/useGames'
import { Select } from '@/components/ui/Select'
import { Skeleton } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/ErrorState'
import { Badge } from '@/components/ui/Badge'
import GameDetailView from '@/components/games/GameDetailView'
import { fmtDate, teamColor } from '@/utils/formatters'
import type { GameFilters } from '@/types'

export default function GamesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [team1, setTeam1]           = useState(searchParams.get('team1') ?? '')
  const [team2, setTeam2]           = useState(searchParams.get('team2') ?? '')
  const [season, setSeason]         = useState(searchParams.get('season') ?? '')
  const [gameType, setGameType]     = useState(searchParams.get('game_type') ?? '')
  const [gameLabel, setGameLabel]   = useState(searchParams.get('game_label') ?? '')
  const [selectedGameId, setSelectedGameId] = useState<number | null>(
    searchParams.get('game') ? Number(searchParams.get('game')) : null
  )

  // Only fire search when team1 is provided
  const activeFilters: GameFilters | null = team1.trim().length >= 2 ? {
    team1: team1.trim(),
    team2: team2.trim() || undefined,
    season: season || undefined,
    game_type: gameType || undefined,
    game_label: gameLabel || undefined,
    limit: 100,
  } : null

  const gamesQ  = useGameSearch(activeFilters)
  const typesQ  = useGameTypes()
  const labelsQ = useGameLabels(gameType || null)

  useEffect(() => {
    const g = searchParams.get('game')
    if (g) setSelectedGameId(Number(g))
  }, [searchParams])

  function selectGame(id: number) {
    setSelectedGameId(id)
    setSearchParams({ game: String(id), team1 })
  }

  const games = gamesQ.data?.items ?? []

  return (
    <div className="min-h-screen pt-14">
      {/* Filter bar */}
      <div className="border-b border-white/6 py-4 px-4 md:px-8"
        style={{ background: 'rgba(7,15,26,0.9)', backdropFilter: 'blur(10px)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">🏀</span>
            <div>
              <h1 className="font-display text-2xl text-white tracking-widest">GAMES</h1>
              <p className="text-xs text-slate-500">Search games by team — type at least 2 characters</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {/* Team 1 — required */}
            <input
              value={team1}
              onChange={e => setTeam1(e.target.value)}
              placeholder="Team 1 (e.g. Lakers, LAL)"
              className="input-dark col-span-1"
            />
            {/* Team 2 — optional opponent */}
            <input
              value={team2}
              onChange={e => setTeam2(e.target.value)}
              placeholder="vs Team 2 (optional)"
              className="input-dark col-span-1"
            />
            {/* Season — e.g. 2023-24 */}
            <input
              value={season}
              onChange={e => setSeason(e.target.value)}
              placeholder="Season (e.g. 2023-24)"
              className="input-dark col-span-1"
            />
            <Select
              value={gameType}
              onChange={v => { setGameType(v); setGameLabel('') }}
              options={typesQ.data ?? []}
              placeholder="All Types"
            />
            <Select
              value={gameLabel}
              onChange={setGameLabel}
              options={labelsQ.data ?? []}
              placeholder="All Labels"
            />
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-9rem)]">
        {/* Sidebar */}
        <div className="w-80 flex-shrink-0 border-r border-white/6 overflow-y-auto"
          style={{ background: 'rgba(7,15,26,0.5)' }}>
          <div className="p-3 border-b border-white/6">
            <div className="text-xs text-slate-500 uppercase tracking-widest">
              {!activeFilters
                ? 'Enter a team name to search'
                : gamesQ.isLoading
                  ? 'Searching...'
                  : `${games.length} games found`
              }
            </div>
            {gamesQ.data?.resolved_inputs && (
              <div className="text-xs text-orange-400 mt-1">
                {gamesQ.data.resolved_inputs.team1}
                {gamesQ.data.resolved_inputs.team2 && ` vs ${gamesQ.data.resolved_inputs.team2}`}
              </div>
            )}
          </div>

          {gamesQ.isLoading && (
            <div className="p-3 space-y-2">
              {[...Array(6)].map((_, i) => <Skeleton key={i} height="4.5rem" className="rounded-lg" />)}
            </div>
          )}

          {gamesQ.isError && (
            <ErrorState message="Team not found or search failed" onRetry={() => gamesQ.refetch()} compact />
          )}

          {!activeFilters && (
            <div className="p-6 text-center text-slate-600 text-sm">
              Start typing a team name above
            </div>
          )}

          {games.map(game => {
            const isSelected = selectedGameId === game.game_id
            return (
              <button
                key={game.game_id}
                onClick={() => selectGame(game.game_id)}
                className={`w-full p-3 border-b border-white/4 text-left hover:bg-white/5 transition-all ${
                  isSelected ? 'bg-orange-500/10 border-l-2 border-l-orange-500' : ''
                }`}
              >
                {/* Team matchup + score */}
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold" style={{ color: teamColor(game.away_team.abbrev) }}>
                      {game.away_team.abbrev}
                    </span>
                    <span className="text-slate-600 text-xs">@</span>
                    <span className="text-xs font-bold" style={{ color: teamColor(game.home_team.abbrev) }}>
                      {game.home_team.abbrev}
                    </span>
                  </div>
                  <div className="text-xs font-mono text-white">
                    {game.away_team.score ?? '–'} – {game.home_team.score ?? '–'}
                  </div>
                </div>

                {/* Winner indicator */}
                {game.winner && (
                  <div className="text-xs text-green-500 mb-1">W: {game.winner}</div>
                )}

                <div className="text-xs text-slate-600">{fmtDate(game.game_datetime)}</div>

                {/* Tags */}
                <div className="flex gap-1 mt-1.5 flex-wrap">
                  {game.game_type && <Badge label={game.game_type} color="#64748b" />}
                  {game.game_label && <Badge label={game.game_label} color="#f97316" />}
                  {game.game_sub_label && <Badge label={game.game_sub_label} color="#8b5cf6" />}
                  {game.series_game_number && <Badge label={`Gm ${game.series_game_number}`} color="#06b6d4" />}
                </div>
              </button>
            )
          })}

          {activeFilters && !gamesQ.isLoading && games.length === 0 && !gamesQ.isError && (
            <div className="p-6 text-center text-slate-600 text-sm">No games found for this search</div>
          )}
        </div>

        {/* Detail panel */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {!selectedGameId ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="text-5xl mb-4 opacity-30">🏀</div>
              <h2 className="text-xl font-semibold text-slate-400 mb-2">Select a Game</h2>
              <p className="text-slate-600 text-sm">Search for a team, then click a game to view detailed stats</p>
            </div>
          ) : (
            <GameDetailView gameId={selectedGameId} />
          )}
        </div>
      </div>
    </div>
  )
}
