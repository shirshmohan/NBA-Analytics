import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, Legend, ResponsiveContainer
} from 'recharts'
import type { ScoreTimelinePoint } from '@/types'
import { teamColor } from '@/utils/formatters'

interface Props {
  data: ScoreTimelinePoint[]
  homeTricode: string
  awayTricode: string
}

// Convert "PT10M30.00S" style clock → seconds remaining in period
function clockToSec(clock: string): number {
  const m = clock.match(/PT(\d+)M([\d.]+)S/)
  if (m) return parseInt(m[1]) * 60 + parseFloat(m[2])
  return 0
}

// Build a flat numeric index for X axis: period * 1000 + (720 - secsLeft)
function eventToX(period: number, clock: string): number {
  const secsLeft = clockToSec(clock)
  const elapsed  = 720 - secsLeft  // 12-min quarters
  return (period - 1) * 720 + elapsed
}

function xToLabel(x: number): string {
  const period  = Math.floor(x / 720) + 1
  const elapsed = x % 720
  const m = Math.floor(elapsed / 60)
  const s = elapsed % 60
  return `Q${period} ${m}:${String(s).padStart(2, '0')}`
}

// Quarter boundary ticks at 0, 720, 1440, 2160, 2880
const Q_TICKS = [0, 720, 1440, 2160, 2880]
const Q_LABELS = ['', 'Q2', 'Q3', 'Q4', 'OT']

interface ChartPoint {
  x: number
  label: string
  home: number
  away: number
  period: number
}

export default function ScoreTimeline({ data, homeTricode, awayTricode }: Props) {
  const homeColor = teamColor(homeTricode)
  const awayColor = teamColor(awayTricode)

  const chartData: ChartPoint[] = data.map(p => ({
    x:      eventToX(p.period, p.clock),
    label:  xToLabel(eventToX(p.period, p.clock)),
    home:   p.home_score,
    away:   p.away_score,
    period: p.period,
  }))

  // Detect max period to know how many quarter lines to show
  const maxPeriod = data.length ? Math.max(...data.map(d => d.period)) : 4
  const qLines = Array.from({ length: maxPeriod - 1 }, (_, i) => (i + 1) * 720)

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    return (
      <div className="rounded-xl p-3 text-xs" style={{ background: '#0c1a2e', border: '1px solid rgba(255,255,255,0.12)' }}>
        <div className="text-slate-400 mb-2 font-mono">{label}</div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: awayColor }} />
            <span className="text-slate-300">{awayTricode}</span>
            <span className="font-bold text-white ml-auto pl-4">{payload[1]?.value ?? '—'}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: homeColor }} />
            <span className="text-slate-300">{homeTricode}</span>
            <span className="font-bold text-white ml-auto pl-4">{payload[0]?.value ?? '—'}</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={chartData} margin={{ top: 10, right: 20, left: -20, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />

        <XAxis
          dataKey="x"
          type="number"
          domain={[0, Math.max(2880, (maxPeriod) * 720)]}
          ticks={Q_TICKS.slice(0, maxPeriod + 1)}
          tickFormatter={(v) => {
            const idx = Q_TICKS.indexOf(v)
            if (idx === 0) return 'Start'
            return `Q${idx + 1}`
          }}
          stroke="#334155"
          tick={{ fill: '#475569', fontSize: 11 }}
          label={{ value: 'Game Time', position: 'insideBottom', fill: '#334155', fontSize: 10, offset: -10 }}
        />

        <YAxis stroke="#334155" tick={{ fill: '#475569', fontSize: 11 }} />

        <Tooltip content={<CustomTooltip />} />

        <Legend
          wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
          formatter={(value) => <span style={{ color: value === 'home' ? homeColor : awayColor }}>{value === 'home' ? homeTricode : awayTricode}</span>}
        />

        {/* Quarter dividers */}
        {qLines.map((x, i) => (
          <ReferenceLine key={x} x={x} stroke="rgba(255,255,255,0.1)" strokeDasharray="4 4"
            label={{ value: `Q${i + 2}`, position: 'top', fill: '#475569', fontSize: 10 }} />
        ))}

        <Line type="stepAfter" dataKey="home" name="home"
          stroke={homeColor} strokeWidth={2.5} dot={false}
          activeDot={{ r: 4, fill: homeColor }} />

        <Line type="stepAfter" dataKey="away" name="away"
          stroke={awayColor} strokeWidth={2.5} dot={false}
          activeDot={{ r: 4, fill: awayColor }}
          strokeDasharray="6 2" />
      </LineChart>
    </ResponsiveContainer>
  )
}
