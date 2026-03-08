import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePlayerSearch } from '@/api/hooks/usePlayers'
import { useGameSearch } from '@/api/hooks/useGames'
import { fmtDate } from '@/utils/formatters'

interface GlobalSearchProps {
  onClose: () => void
}

export default function GlobalSearch({ onClose }: GlobalSearchProps) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  // Player search — works with any partial name
  const { data: players } = usePlayerSearch(query, 6)

  // Game search — requires team1; use the query as team1 directly
  const { data: gamesResp } = useGameSearch(
    query.trim().length >= 2
      ? { team1: query.trim(), limit: 5 }
      : null
  )
  const games = gamesResp?.items ?? []

  useEffect(() => {
    inputRef.current?.focus()
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  function goToPlayer(name: string) {
    navigate(`/players?player=${encodeURIComponent(name)}`)
    onClose()
  }

  function goToGame(id: number) {
    navigate(`/games?game=${id}`)
    onClose()
  }

  const hasResults = (players?.length ?? 0) > 0 || games.length > 0

  return (
    <div
      className="fixed inset-0 z-80 flex items-start justify-center pt-20 px-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-2xl overflow-hidden"
        style={{ background: 'rgba(10,22,40,0.98)', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 40px 80px rgba(0,0,0,0.6)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
          <svg className="w-4 h-4 text-slate-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search players or team games..."
            className="flex-1 bg-transparent text-white text-base outline-none placeholder-slate-600"
          />
          <kbd className="text-xs text-slate-600 border border-white/10 rounded px-1.5 py-0.5">ESC</kbd>
        </div>

        {query.length < 2 ? (
          <div className="p-6 text-center text-slate-600 text-sm">Type at least 2 characters to search</div>
        ) : !hasResults ? (
          <div className="p-6 text-center text-slate-600 text-sm">No results found</div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {(players?.length ?? 0) > 0 && (
              <div>
                <div className="px-4 py-2 text-xs font-semibold uppercase tracking-widest text-slate-600">Players</div>
                {players!.map(p => (
                  <button
                    key={p.player}
                    onClick={() => goToPlayer(p.player)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-all text-left"
                  >
                    <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-sm">👤</div>
                    <div className="text-sm font-medium text-white">{p.player}</div>
                  </button>
                ))}
              </div>
            )}
            {games.length > 0 && (
              <div>
                <div className="px-4 py-2 text-xs font-semibold uppercase tracking-widest text-slate-600 border-t border-white/6 mt-1">
                  Games
                </div>
                {games.map(g => (
                  <button
                    key={g.game_id}
                    onClick={() => goToGame(g.game_id)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-all text-left"
                  >
                    <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-sm">🏀</div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-white">
                        {g.away_team.abbrev} @ {g.home_team.abbrev}
                      </div>
                      <div className="text-xs text-slate-500">
                        {fmtDate(g.game_datetime)} · {g.game_type ?? ''}
                        {g.game_label ? ` · ${g.game_label}` : ''}
                      </div>
                    </div>
                    <div className="text-sm font-mono text-orange-400">
                      {g.away_team.score} – {g.home_team.score}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
