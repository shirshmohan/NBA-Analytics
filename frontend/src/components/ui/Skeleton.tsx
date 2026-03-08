interface SkeletonProps {
  className?: string
  height?: string | number
  width?: string | number
  rounded?: boolean
}

export function Skeleton({ className = '', height = '1rem', width = '100%', rounded = false }: SkeletonProps) {
  return (
    <div
      className={`skeleton ${rounded ? 'rounded-full' : ''} ${className}`}
      style={{ height, width }}
    />
  )
}

export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className="glass-card p-4 space-y-3">
      <Skeleton height="1.2rem" width="60%" />
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} height="0.875rem" width={`${70 + (i % 3) * 10}%`} />
      ))}
    </div>
  )
}

export function SkeletonTable({ rows = 5, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-1">
      <div className="flex gap-3 px-3 py-2">
        {Array.from({ length: cols }, (_, i) => (
          <Skeleton key={i} height="0.7rem" width={`${60 + (i % 4) * 10}px`} />
        ))}
      </div>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex gap-3 px-3 py-2 border-b border-white/5">
          {Array.from({ length: cols }, (_, j) => (
            <Skeleton key={j} height="0.875rem" width={`${50 + (j % 3) * 15}px`} />
          ))}
        </div>
      ))}
    </div>
  )
}
