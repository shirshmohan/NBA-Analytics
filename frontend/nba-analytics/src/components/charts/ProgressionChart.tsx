import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer
} from 'recharts'
import type { PlayerSeason } from '@/types'
import { fmtSeason } from '@/utils/formatters'

type StatKey = keyof Pick<PlayerSeason, 'ppg' | 'apg' | 'rpg' | 'spg' | 'bpg' | 'mpg' | 'fg_pct'>

interface ProgressionChartProps {
  seasons: PlayerSeason[]
  stat: StatKey
  color?: string
}

const STAT_LABELS: Record<StatKey, string> = {
  ppg: 'PPG', apg: 'APG', rpg: 'RPG', spg: 'SPG', bpg: 'BPG', mpg: 'MPG', fg_pct: 'FG%'
}

export default function ProgressionChart({ seasons, stat, color = '#f97316' }: ProgressionChartProps) {
  const data = seasons.map(s => ({
    season: s.season,
    label: fmtSeason(s.season),
    value: stat === 'fg_pct' ? Number((s[stat] * 100).toFixed(1)) : s[stat],
    team: s.team,
  }))

  const avg = data.reduce((a, d) => a + d.value, 0) / data.length

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 10, right: 20, left: -15, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis
          dataKey="label"
          tick={{ fill: '#475569', fontSize: 10 }}
          stroke="#334155"
          interval={data.length > 10 ? Math.floor(data.length / 10) : 0}
          angle={-30}
          textAnchor="end"
          height={35}
        />
        <YAxis stroke="#334155" tick={{ fill: '#475569', fontSize: 11 }} />
        <Tooltip
          contentStyle={{ background: '#0c1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }}
          formatter={(value: number) => [
            stat === 'fg_pct' ? `${value}%` : value,
            STAT_LABELS[stat]
          ]}
          labelStyle={{ color: '#94a3b8' }}
        />
        <ReferenceLine y={avg} stroke="rgba(255,255,255,0.15)" strokeDasharray="4 4" label={{ value: 'Avg', fill: '#475569', fontSize: 10 }} />
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2.5}
          dot={{ r: 3, fill: color, strokeWidth: 0 }}
          activeDot={{ r: 5, fill: color }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
