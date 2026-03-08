import { useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, Cell, ResponsiveContainer
} from 'recharts'
import type { TeamEfficiencyEntry } from '@/types'
import { teamColor, fmtPct } from '@/utils/formatters'

interface Props {
  data: TeamEfficiencyEntry[]
  homeTricode: string
  awayTricode: string
}

const ACTION_LABELS: Record<string, string> = {
  '2pt':       '2-Pointers',
  '3pt':       '3-Pointers',
  'freethrow': 'Free Throws',
}

export default function TeamEfficiencyChart({ data, homeTricode, awayTricode }: Props) {
  const homeColor = teamColor(homeTricode)
  const awayColor = teamColor(awayTricode)

  // Group by actionType, one bar per team
  const chartData = useMemo(() => {
    const types = ['2pt', '3pt', 'freethrow']
    return types.map(type => {
      const row: Record<string, string | number> = { type: ACTION_LABELS[type] ?? type }
      for (const entry of data) {
        if (entry.actionType !== type) continue
        // Use team name as key — shorten to tricode if too long
        const code = entry.playerteamName.length <= 4 ? entry.playerteamName : entry.playerteamName.slice(0, 3).toUpperCase()
        row[`${code}_pct`]  = Math.round((entry.fgPercentage ?? 0) * 100)
        row[`${code}_made`] = entry.makes
        row[`${code}_att`]  = entry.attempts
        row[`${code}_name`] = entry.playerteamName
      }
      return row
    })
  }, [data])

  // Derive team codes from actual data
  const teams = useMemo(() => {
    const seen = new Map<string, string>()
    for (const e of data) {
      const code = e.playerteamName.length <= 4 ? e.playerteamName : e.playerteamName.slice(0, 3).toUpperCase()
      seen.set(code, e.playerteamName)
    }
    return Array.from(seen.entries()).map(([code, name]) => ({ code, name }))
  }, [data])

  const colors = [homeColor, awayColor]

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    return (
      <div className="rounded-xl p-3 text-xs" style={{ background: '#0c1a2e', border: '1px solid rgba(255,255,255,0.12)' }}>
        <div className="font-semibold text-white mb-2">{label}</div>
        {payload.map((p: any) => {
          const code   = p.dataKey.replace('_pct', '')
          const made   = p.payload[`${code}_made`]
          const att    = p.payload[`${code}_att`]
          return (
            <div key={p.dataKey} className="flex items-center gap-3 mb-1">
              <div className="w-2 h-2 rounded-full" style={{ background: p.fill }} />
              <span style={{ color: p.fill }} className="font-bold">{p.payload[`${code}_name`] ?? code}</span>
              <span className="text-white ml-auto pl-4">{p.value}% ({made}/{att})</span>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* FG% Comparison */}
      <div>
        <h4 className="text-xs uppercase tracking-widest text-slate-500 mb-3">Shooting Efficiency (%)</h4>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="type" stroke="#334155" tick={{ fill: '#475569', fontSize: 11 }} />
            <YAxis stroke="#334155" tick={{ fill: '#475569', fontSize: 10 }} unit="%" domain={[0, 100]} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11 }}
              formatter={(v) => {
                const code = v.replace('_pct', '')
                const team = teams.find(t => t.code === code)
                return <span style={{ color: colors[teams.findIndex(t => t.code === code)] ?? '#94a3b8' }}>{team?.name ?? code}</span>
              }} />
            {teams.map((t, i) => (
              <Bar key={t.code} dataKey={`${t.code}_pct`} name={`${t.code}_pct`} radius={[4, 4, 0, 0]}>
                {chartData.map((_, ci) => (
                  <Cell key={ci} fill={colors[i] ?? '#f97316'} fillOpacity={0.8} />
                ))}
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Attempts comparison */}
      <div>
        <h4 className="text-xs uppercase tracking-widest text-slate-500 mb-3">Shot Attempts</h4>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="type" stroke="#334155" tick={{ fill: '#475569', fontSize: 11 }} />
            <YAxis stroke="#334155" tick={{ fill: '#475569', fontSize: 10 }} />
            <Tooltip
              contentStyle={{ background: '#0c1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 11 }}
              labelStyle={{ color: '#94a3b8' }}
            />
            {teams.map((t, i) => (
              <Bar key={t.code} dataKey={`${t.code}_att`} name={t.name} fill={colors[i] ?? '#f97316'} fillOpacity={0.7} radius={[4, 4, 0, 0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
