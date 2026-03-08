import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer, CartesianGrid } from 'recharts'
import type { ShotZone } from '@/types'

interface ShotZoneChartProps {
  data: ShotZone[]
}

const ZONE_COLORS = ['#f97316', '#06b6d4', '#8b5cf6', '#eab308']

export default function ShotZoneChart({ data }: ShotZoneChartProps) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 30 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis
          dataKey="zone"
          tick={{ fill: '#475569', fontSize: 10 }}
          stroke="#334155"
          angle={-15}
          textAnchor="end"
          interval={0}
        />
        <YAxis
          tickFormatter={v => `${(v * 100).toFixed(0)}%`}
          stroke="#334155"
          tick={{ fill: '#475569', fontSize: 11 }}
          domain={[0, 0.8]}
        />
        <Tooltip
          contentStyle={{ background: '#0c1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }}
          formatter={(value: number, _name: string, props) => [
            `${(value * 100).toFixed(1)}% (${props.payload.made}/${props.payload.attempted})`,
            'FG%'
          ]}
        />
        <Bar dataKey="pct" radius={[4, 4, 0, 0]}>
          {data.map((_entry, i) => (
            <Cell key={i} fill={ZONE_COLORS[i % ZONE_COLORS.length]} fillOpacity={0.85} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
