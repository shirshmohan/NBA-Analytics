import type { SeasonPercentiles } from '@/types'
import { percentileColor, fmtPercentile } from '@/utils/formatters'

interface PercentileChartProps {
  data: SeasonPercentiles
}

// Map flat API fields to display labels
const PERCENTILE_ENTRIES: { key: keyof SeasonPercentiles; label: string; negative?: boolean }[] = [
  { key: 'ppg_percentile',      label: 'Points' },
  { key: 'apg_percentile',      label: 'Assists' },
  { key: 'rpg_percentile',      label: 'Rebounds' },
  { key: 'spg_percentile',      label: 'Steals' },
  { key: 'bpg_percentile',      label: 'Blocks' },
  { key: 'fg_percentile',       label: 'FG%' },
  { key: 'x3p_percentile',      label: '3P%' },
  { key: 'ft_percentile',       label: 'FT%' },
  { key: 'efg_percentile',      label: 'eFG%' },
  { key: 'mpg_percentile',      label: 'Minutes' },
  { key: 'trp_dbl_percentile',  label: 'Triple Doubles' },
  { key: 'tov_percentile_better', label: 'Ball Security', negative: false },
]

export default function PercentileChart({ data }: PercentileChartProps) {
  return (
    <div className="space-y-3">
      {PERCENTILE_ENTRIES.map(({ key, label }) => {
        const pct = data[key] as number | null | undefined
        if (pct == null) return null
        const color = percentileColor(pct)

        return (
          <div key={key} className="flex items-center gap-3">
            <div className="text-xs text-slate-500 w-28 flex-shrink-0 text-right">{label}</div>
            <div className="flex-1 h-5 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 flex items-center justify-end pr-2"
                style={{
                  width: `${pct}%`,
                  background: `linear-gradient(90deg, ${color}44, ${color})`,
                }}
              >
                {pct > 25 && (
                  <span className="text-xs font-bold text-white">{fmtPercentile(pct)}</span>
                )}
              </div>
            </div>
            <div className="text-xs font-mono w-14 flex-shrink-0" style={{ color }}>
              {fmtPercentile(pct)}
            </div>
          </div>
        )
      })}
      <div className="text-xs text-slate-600 pt-2">
        Pool: {data.pool_size} qualified players · Season {data.season}
      </div>
    </div>
  )
}

