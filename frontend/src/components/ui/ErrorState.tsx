interface ErrorStateProps {
  message?: string
  onRetry?: () => void
  compact?: boolean
}

export function ErrorState({ message = 'Something went wrong', onRetry, compact = false }: ErrorStateProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-3 p-3 text-sm text-red-400">
        <span>⚠️</span>
        <span>{message}</span>
        {onRetry && (
          <button onClick={onRetry} className="text-orange-400 hover:text-orange-300 underline">
            Retry
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
      <div className="text-4xl">⚠️</div>
      <div className="text-red-400 font-medium">{message}</div>
      {onRetry && (
        <button onClick={onRetry} className="btn-primary mt-2">
          Try Again
        </button>
      )}
    </div>
  )
}

export function EmptyState({ message = 'No data available', icon = '📊' }: { message?: string; icon?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <div className="text-4xl opacity-50">{icon}</div>
      <div className="text-slate-500">{message}</div>
    </div>
  )
}
