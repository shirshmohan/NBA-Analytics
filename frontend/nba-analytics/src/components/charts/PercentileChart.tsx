import type { SeasonPercentiles } from '@/types'
import { percentileColor, fmtPercentile } from '@/utils/formatters'

interface PercentileChartProps {
  data: SeasonPercentiles
}

const STAT_LABELS: Record<string, string> = {
  ppg: 'Points', apg: 'Assists', rpg: 'Rebounds',
  spg: 'Steals', bpg: 'Blocks', mpg: 'Minutes',
  tov_pg: 'Turnovers', fg_pct: 'FG%',
}

export default function PercentileChart({ data }: PercentileChartProps) {
  const entries = Object.entries(data.percentiles).filter(([, v]) => v !== null)

  return (
    <div className="space-y-3">
      {entries.map(([key, pct]) => {
        if (pct === null) return null
        const color = percentileColor(pct)
        const isNegative = key === 'tov_pg'
        const adjustedPct = isNegative ? 100 - pct : pct
        const displayColor = isNegative ? percentileColor(adjustedPct) : color

        return (
          <div key={key} className="flex items-center gap-3">
            <div className="text-xs text-slate-500 w-20 flex-shrink-0 text-right">
              {STAT_LABELS[key] ?? key}
            </div>
            <div className="flex-1 h-5 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 flex items-center justify-end pr-2"
                style={{
                  width: `${pct}%`,
                  background: `linear-gradient(90deg, ${displayColor}44, ${displayColor})`,
                }}
              >
                {pct > 25 && (
                  <span className="text-xs font-bold text-white">{fmtPercentile(pct)}</span>
                )}
              </div>
            </div>
            <div className="text-xs font-mono w-14 flex-shrink-0" style={{ color: displayColor }}>
              {fmtPercentile(pct)}
              {isNegative && <span className="text-slate-600 ml-1">✓</span>}
            </div>
          </div>
        )
      })}
      <div className="text-xs text-slate-600 pt-2">
        Pool: {data.pool_size} qualified players · {data.season}-{String(data.season + 1).slice(-2)} season
      </div>
    </div>
  )
}
