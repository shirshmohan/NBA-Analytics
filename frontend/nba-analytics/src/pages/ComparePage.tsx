import { useState } from 'react'
import { usePlayerDashboard, usePlayerSeasonPercentiles, usePlayerSearch } from '@/api/hooks/usePlayers'
import { Skeleton } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/ErrorState'
import PercentileChart from '@/components/charts/PercentileChart'
import { fmt, fmtPct, fmtSeason, teamColor } from '@/utils/formatters'

function PlayerSelector({
  label,
  value,
  onSelect,
}: {
  label: string
  value: string | null
  onSelect: (name: string) => void
}) {
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const { data: results } = usePlayerSearch(q, 8)

  return (
    <div className="relative">
      <div className="text-xs text-slate-500 uppercase tracking-widest mb-2">{label}</div>
      <div className="relative">
        <input
          value={value && !open ? value : q}
          onChange={e => { setQ(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
          placeholder="Search player..."
          className="input-dark"
        />
        {open && q.length >= 2 && results && results.length > 0 && (
          <div
            className="absolute top-full left-0 right-0 mt-1 rounded-xl overflow-hidden z-50"
            style={{ background: 'rgba(10,22,40,0.98)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}
          >
            {results.map(p => (
              <button
                key={p.person_id}
                onMouseDown={() => { onSelect(p.full_name); setQ(''); setOpen(false) }}
                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 text-left"
              >
                <div className="w-7 h-7 rounded-full bg-orange-500/20 flex items-center justify-center text-xs">👤</div>
                <div>
                  <div className="text-sm font-medium text-white">{p.full_name}</div>
                  <div className="text-xs text-slate-500">{p.team ?? 'FA'} · {p.position ?? 'N/A'}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function CompareColumn({ playerName, side }: { playerName: string | null; side: 'left' | 'right' }) {
  const dashQ = usePlayerDashboard(playerName)
  const pctQ = usePlayerSeasonPercentiles(
    playerName,
    dashQ.data?.seasons?.length
      ? Math.max(...dashQ.data.seasons.map(s => s.season))
      : null
  )

  const color = side === 'left' ? '#f97316' : '#06b6d4'

  if (!playerName) {
    return (
      <div className="flex-1 glass-card p-6 flex items-center justify-center">
        <div className="text-center text-slate-600">
          <div className="text-3xl mb-2">👤</div>
          <div className="text-sm">Select a player</div>
        </div>
      </div>
    )
  }

  if (dashQ.isLoading) return <div className="flex-1"><Skeleton height="400px" className="rounded-xl" /></div>
  if (dashQ.isError) return <div className="flex-1"><ErrorState message="Failed to load" compact /></div>
  if (!dashQ.data) return null

  const { career } = dashQ.data
  const latestSeason = dashQ.data.seasons.length
    ? Math.max(...dashQ.data.seasons.map(s => s.season))
    : null

  return (
    <div className="flex-1 glass-card overflow-hidden">
      <div className="p-4 border-b border-white/6 text-center">
        <div className="font-display text-2xl tracking-widest" style={{ color }}>
          {playerName.split(' ').pop()?.toUpperCase()}
        </div>
        <div className="text-xs text-slate-500">{dashQ.data.current_team}</div>
      </div>

      <div className="p-4 space-y-3">
        {[
          { label: 'PPG', value: fmt(career.ppg) },
          { label: 'APG', value: fmt(career.apg) },
          { label: 'RPG', value: fmt(career.rpg) },
          { label: 'SPG', value: fmt(career.spg, 2) },
          { label: 'BPG', value: fmt(career.bpg, 2) },
          { label: 'MPG', value: fmt(career.mpg) },
        ].map(s => (
          <div key={s.label} className="flex justify-between items-center">
            <div className="text-xs text-slate-500">{s.label}</div>
            <div className="font-mono font-bold text-white">{s.value}</div>
          </div>
        ))}

        {latestSeason && (
          <div className="text-xs text-slate-600 pt-1">Latest: {fmtSeason(latestSeason)}</div>
        )}

        {pctQ.data && (
          <div className="pt-3 border-t border-white/6">
            <div className="text-xs text-slate-500 uppercase tracking-widest mb-3">Percentiles</div>
            <PercentileChart data={pctQ.data} />
          </div>
        )}
      </div>
    </div>
  )
}

export default function ComparePage() {
  const [player1, setPlayer1] = useState<string | null>(null)
  const [player2, setPlayer2] = useState<string | null>(null)

  return (
    <div className="min-h-screen pt-14">
      <div className="border-b border-white/6 py-4 px-4 md:px-8"
        style={{ background: 'rgba(7,15,26,0.9)', backdropFilter: 'blur(10px)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">⚖️</span>
            <div>
              <h1 className="font-display text-2xl text-white tracking-widest">COMPARE</h1>
              <p className="text-xs text-slate-500">Head-to-head player comparison</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 max-w-xl">
            <PlayerSelector label="Player 1" value={player1} onSelect={setPlayer1} />
            <PlayerSelector label="Player 2" value={player2} onSelect={setPlayer2} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        <div className="flex gap-4">
          <CompareColumn playerName={player1} side="left" />
          <div className="flex-shrink-0 flex items-center justify-center w-8">
            <div className="font-display text-slate-600 text-2xl">VS</div>
          </div>
          <CompareColumn playerName={player2} side="right" />
        </div>
      </div>
    </div>
  )
}
