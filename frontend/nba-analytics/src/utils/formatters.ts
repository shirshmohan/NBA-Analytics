export function fmt(value: number | null | undefined, decimals = 1): string {
  if (value === null || value === undefined || isNaN(value)) return '—'
  return value.toFixed(decimals)
}

export function fmtPct(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) return '—'
  return `${(value * 100).toFixed(1)}%`
}

export function fmtRank(rank: number | null | undefined, total?: number): string {
  if (rank === null || rank === undefined) return '—'
  if (total) return `#${rank} / ${total}`
  return `#${rank}`
}

export function fmtPercentile(pct: number | null | undefined): string {
  if (pct === null || pct === undefined) return '—'
  return `${Math.round(pct)}th`
}

export function fmtDate(dateStr: string): string {
  try {
    const d = new Date(dateStr + 'T00:00:00')
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return dateStr
  }
}

export function fmtSeason(season: number): string {
  return `${season}-${String(season + 1).slice(-2)}`
}

export function fmtClock(clock: string): string {
  return clock
}

export function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0])
}

export function percentileColor(pct: number): string {
  if (pct >= 90) return '#22c55e'
  if (pct >= 75) return '#84cc16'
  if (pct >= 50) return '#eab308'
  if (pct >= 25) return '#f97316'
  return '#ef4444'
}

export function teamColor(tricode: string): string {
  const colors: Record<string, string> = {
    LAL: '#552583',
    GSW: '#1D428A',
    BOS: '#007A33',
    MIL: '#00471B',
    PHI: '#006BB6',
    MIA: '#98002E',
    DAL: '#00538C',
    DEN: '#0E2240',
    PHX: '#1D1160',
    MEM: '#5D76A9',
    OKC: '#007AC1',
    SAS: '#C4CED4',
    HOU: '#CE1141',
    ATL: '#E03A3E',
    IND: '#002D62',
    TOR: '#CE1141',
    NOP: '#0C2340',
    SAC: '#5A2D81',
    UTA: '#002B5C',
    POR: '#E03A3E',
    MIN: '#0C2340',
    ORL: '#0077C0',
    CLE: '#860038',
    DET: '#C8102E',
    WAS: '#002B5C',
    CHA: '#1D1160',
    BKN: '#000000',
    NYK: '#006BB6',
    CHI: '#CE1141',
    LAC: '#C8102E',
  }
  return colors[tricode] ?? '#f97316'
}

export function accentColor(tricode: string): string {
  const accents: Record<string, string> = {
    LAL: '#FDB927',
    GSW: '#FFC72C',
    BOS: '#BA9653',
    MIL: '#EEE1C6',
    PHI: '#ED174C',
    OKC: '#EF3B24',
  }
  return accents[tricode] ?? '#f97316'
}
