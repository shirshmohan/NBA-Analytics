interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  trend?: 'up' | 'down' | 'neutral'
  accent?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function StatCard({ label, value, sub, trend, accent = false, size = 'md' }: StatCardProps) {
  const sizeClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-5',
  }
  const valueSize = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-4xl',
  }

  return (
    <div className={`glass-card-hover ${sizeClasses[size]} ${accent ? 'border-orange-500/30 bg-orange-500/5' : ''}`}>
      <div className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-1">{label}</div>
      <div className={`stat-value ${valueSize[size]} font-bold ${accent ? 'text-orange-400' : 'text-white'}`}>
        {value}
        {trend && (
          <span className={`ml-1 text-sm ${trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-slate-500'}`}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '—'}
          </span>
        )}
      </div>
      {sub && <div className="text-xs text-slate-500 mt-1">{sub}</div>}
    </div>
  )
}
