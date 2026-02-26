import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ReferenceLine, ResponsiveContainer
} from 'recharts'
import type { ScoreTimelinePoint } from '@/types'
import { teamColor } from '@/utils/formatters'

interface ScoreTimelineProps {
  data: ScoreTimelinePoint[]
  homeTricode: string
  awayTricode: string
}

function QuarterLabel({ viewBox, label }: { viewBox?: { x: number; y: number; height: number }; label: string }) {
  if (!viewBox) return null
  return (
    <text x={viewBox.x} y={viewBox.y + 12} fill="#475569" fontSize={10} textAnchor="middle">
      {label}
    </text>
  )
}

export default function ScoreTimeline({ data, homeTricode, awayTricode }: ScoreTimelineProps) {
  const homeColor = teamColor(homeTricode)
  const awayColor = teamColor(awayTricode)

  // Quarter markers at 720, 1440, 2160 seconds
  const qMarkers = [720, 1440, 2160]

  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ top: 10, right: 20, left: -20, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis
          dataKey="time_sec"
          tickFormatter={v => {
            const q = Math.floor(v / 720) + 1
            return q <= 4 ? `Q${q}` : 'OT'
          }}
          ticks={[0, 720, 1440, 2160, 2880]}
          stroke="#334155"
          tick={{ fill: '#475569', fontSize: 11 }}
        />
        <YAxis stroke="#334155" tick={{ fill: '#475569', fontSize: 11 }} />
        <Tooltip
          contentStyle={{ background: '#0c1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }}
          labelStyle={{ color: '#94a3b8' }}
          itemStyle={{ color: '#f1f5f9' }}
          labelFormatter={v => `${Math.floor(Number(v)/60)}:${String(Number(v)%60).padStart(2,'0')}`}
        />
        <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
        {qMarkers.map(q => (
          <ReferenceLine
            key={q}
            x={q}
            stroke="rgba(255,255,255,0.08)"
            strokeDasharray="4 4"
            label={<QuarterLabel label={`Q${Math.floor(q / 720) + 1}`} />}
          />
        ))}
        <Line
          type="monotone"
          dataKey="home_score"
          name={homeTricode}
          stroke={homeColor}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: homeColor }}
        />
        <Line
          type="monotone"
          dataKey="away_score"
          name={awayTricode}
          stroke={awayColor}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: awayColor }}
          strokeDasharray="5 2"
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
