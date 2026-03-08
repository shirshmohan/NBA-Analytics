import { useMemo } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ReferenceLine, ResponsiveContainer
} from 'recharts'
import type { KeyEvent } from '@/types'
import { teamColor } from '@/utils/formatters'

interface Props {
  data: KeyEvent[]
  homeTeamId: number
  awayTeamId: number
  homeTricode: string
  awayTricode: string
}

function clockToSec(clock: string): number {
  const m = clock.match(/PT(\d+)M([\d.]+)S/)
  if (m) return parseInt(m[1]) * 60 + parseFloat(m[2])
  return 0
}

function eventToX(period: number, clock: string): number {
  return (period - 1) * 720 + (720 - clockToSec(clock))
}

const STAT_TYPES = ['Assist', 'Rebound', 'Steal', 'Block', 'Turnover'] as const
const STAT_COLORS: Record<string, string> = {
  Assist:   '#06b6d4',
  Rebound:  '#8b5cf6',
  Steal:    '#22c55e',
  Block:    '#3b82f6',
  Turnover: '#ef4444',
}

export default function KeyEventsChart({ data, homeTeamId, awayTeamId, homeTricode, awayTricode }: Props) {
  const [selectedTeamId, setSelectedTeamId] = React.useState<number>(homeTeamId)
  const tricode = selectedTeamId === homeTeamId ? homeTricode : awayTricode
  const color   = teamColor(tricode)

  // Build cumulative counts over game time for each stat type
  const chartData = useMemo(() => {
    const teamEvents = data.filter(e => e.teamId === selectedTeamId)
    if (!teamEvents.length) return []

    // Sort by game time
    const sorted = [...teamEvents].sort((a, b) => eventToX(a.period, a.clock) - eventToX(b.period, b.clock))

    // Collect all X positions
    const xSet = new Set<number>(sorted.map(e => eventToX(e.period, e.clock)))
    const xs   = Array.from(xSet).sort((a, b) => a - b)

    // Running totals per stat
    const counts: Record<string, number> = Object.fromEntries(STAT_TYPES.map(s => [s, 0]))
    const rows: Record<string, number>[] = []
    let ei = 0

    for (const x of xs) {
      while (ei < sorted.length && eventToX(sorted[ei].period, sorted[ei].clock) <= x) {
        counts[sorted[ei].statType] = (counts[sorted[ei].statType] ?? 0) + 1
        ei++
      }
      const period = Math.floor(x / 720) + 1
      const elapsed = x % 720
      rows.push({ x, label: `Q${period} ${Math.floor(elapsed/60)}:${String(elapsed%60).padStart(2,'0')}`, ...counts })
    }
    return rows
  }, [data, selectedTeamId])

  const maxPeriod = data.length ? Math.max(...data.map(d => d.period)) : 4
  const qLines    = Array.from({ length: maxPeriod - 1 }, (_, i) => (i + 1) * 720)

  return (
    <div className="space-y-3">
      {/* Team toggle */}
      <div className="flex gap-2">
        {[{ id: homeTeamId, code: homeTricode }, { id: awayTeamId, code: awayTricode }].map(t => (
          <button key={t.id} onClick={() => setSelectedTeamId(t.id)}
            className="px-3 py-1.5 text-xs font-bold rounded-lg border transition-all"
            style={selectedTeamId === t.id
              ? { background: teamColor(t.code), borderColor: teamColor(t.code), color: '#fff' }
              : { borderColor: 'rgba(255,255,255,0.1)', color: '#64748b' }}>
            {t.code}
          </button>
        ))}
      </div>

      {chartData.length === 0 ? (
        <div className="h-48 flex items-center justify-center text-slate-600 text-sm">No key events data for this team</div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={chartData} margin={{ top: 10, right: 20, left: -20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="x" type="number"
              domain={[0, maxPeriod * 720]}
              ticks={Array.from({ length: maxPeriod + 1 }, (_, i) => i * 720)}
              tickFormatter={v => { const q = Math.floor(v/720); return q === 0 ? 'Start' : `Q${q+1}` }}
              stroke="#334155" tick={{ fill: '#475569', fontSize: 10 }}
              label={{ value: 'Game Time', position: 'insideBottom', fill: '#334155', fontSize: 10, offset: -10 }}
            />
            <YAxis stroke="#334155" tick={{ fill: '#475569', fontSize: 10 }} allowDecimals={false} />
            <Tooltip
              contentStyle={{ background: '#0c1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 11 }}
              labelStyle={{ color: '#94a3b8' }}
              labelFormatter={(_v, payload) => payload?.[0]?.payload?.label ?? ''}
            />
            <Legend wrapperStyle={{ fontSize: 11 }}
              formatter={(value) => <span style={{ color: STAT_COLORS[value] ?? '#94a3b8' }}>{value}</span>} />

            {qLines.map((x, i) => (
              <ReferenceLine key={x} x={x} stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4"
                label={{ value: `Q${i+2}`, position: 'top', fill: '#334155', fontSize: 9 }} />
            ))}

            {STAT_TYPES.map(stat => (
              <Line key={stat} type="stepAfter" dataKey={stat}
                stroke={STAT_COLORS[stat]} strokeWidth={2}
                dot={false} activeDot={{ r: 3 }} connectNulls />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

// Need React for useState
import React from 'react'
