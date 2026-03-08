import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { usePlayerSearch } from '@/api/hooks/usePlayers'
import PlayerDashboardView from '@/components/players/PlayerDashboardView'

export default function PlayersPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(searchParams.get('player'))
  const [showDropdown, setShowDropdown] = useState(false)

  const { data: searchResults, isLoading: searching } = usePlayerSearch(query)

  useEffect(() => {
    const p = searchParams.get('player')
    if (p) setSelectedPlayer(p)
  }, [searchParams])

  function selectPlayer(name: string) {
    setSelectedPlayer(name)
    setSearchParams({ player: name })
    setQuery('')
    setShowDropdown(false)
  }

  return (
    <div className="min-h-screen pt-14">
      {/* Header bar */}
      <div className="border-b border-white/6 py-4 px-4 md:px-8"
        style={{ background: 'rgba(7,15,26,0.9)', backdropFilter: 'blur(10px)' }}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">👤</span>
            <div>
              <h1 className="font-display text-2xl text-white tracking-widest">PLAYERS</h1>
              <p className="text-xs text-slate-500">Search and analyze player stats</p>
            </div>
          </div>

          {/* Player Search */}
          <div className="relative flex-1 max-w-md">
            <input
              value={query}
              onChange={e => {
                setQuery(e.target.value)
                setShowDropdown(true)
              }}
              onFocus={() => setShowDropdown(true)}
              placeholder={selectedPlayer ?? 'Search player name...'}
              className="input-dark pr-8"
            />
            {searching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            )}

            {showDropdown && query.length >= 2 && (
              <div
                className="absolute top-full left-0 right-0 mt-1 rounded-xl overflow-hidden z-50"
                style={{ background: 'rgba(10,22,40,0.98)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}
              >
                {(searchResults?.length ?? 0) === 0 ? (
                  <div className="p-3 text-sm text-slate-500 text-center">No players found</div>
                ) : (
                  searchResults!.map(p => (
                    <button
                      key={p.player}
                      onClick={() => selectPlayer(p.player)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 transition-all text-left"
                    >
                      <div className="w-7 h-7 rounded-full bg-orange-500/20 flex items-center justify-center text-xs">👤</div>
                      <div>
                        <div className="text-sm font-medium text-white">{p.player}</div>
                        <div className="text-xs text-slate-500">{"-"} · {"-"}</div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {selectedPlayer && (
            <div className="flex items-center gap-2">
              <div className="text-xs text-slate-500">Viewing:</div>
              <div className="text-sm font-semibold text-orange-400">{selectedPlayer}</div>
              <button
                onClick={() => { setSelectedPlayer(null); setSearchParams({}) }}
                className="text-xs text-slate-600 hover:text-slate-400 ml-1"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div
        className="px-4 md:px-8 py-6 max-w-7xl mx-auto"
        onClick={() => setShowDropdown(false)}
      >
        {!selectedPlayer ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="text-5xl mb-4 opacity-40">👤</div>
            <h2 className="text-xl font-semibold text-slate-400 mb-2">Select a Player</h2>
            <p className="text-slate-600 text-sm">Search for a player above to view their analytics dashboard</p>
          </div>
        ) : (
          <PlayerDashboardView playerName={selectedPlayer} />
        )}
      </div>
    </div>
  )
}
