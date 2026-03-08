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

const TEAM_COLORS: Record<string, string> = {
  LAL:'#552583', GSW:'#1D428A', BOS:'#007A33', MIL:'#00471B',
  PHI:'#006BB6', MIA:'#98002E', DAL:'#00538C', DEN:'#0E2240',
  PHX:'#E56020', MEM:'#5D76A9', OKC:'#007AC1', SAS:'#C4CED4',
  HOU:'#CE1141', ATL:'#E03A3E', IND:'#002D62', TOR:'#CE1141',
  NOP:'#0C2340', SAC:'#5A2D81', UTA:'#002B5C', POR:'#E03A3E',
  MIN:'#0C2340', ORL:'#0077C0', CLE:'#860038', DET:'#C8102E',
  WAS:'#002B5C', CHA:'#1D1160', BKN:'#777777', NYK:'#F58426',
  CHI:'#CE1141', LAC:'#C8102E',
  'Los Angeles Lakers':'#552583','Golden State Warriors':'#1D428A',
  'Boston Celtics':'#007A33','Milwaukee Bucks':'#00471B',
  'Philadelphia 76ers':'#006BB6','Miami Heat':'#98002E',
  'Dallas Mavericks':'#00538C','Denver Nuggets':'#0E2240',
  'Phoenix Suns':'#E56020','Memphis Grizzlies':'#5D76A9',
  'Oklahoma City Thunder':'#007AC1','San Antonio Spurs':'#C4CED4',
  'Houston Rockets':'#CE1141','Atlanta Hawks':'#E03A3E',
  'Indiana Pacers':'#002D62','Toronto Raptors':'#CE1141',
  'New Orleans Pelicans':'#0C2340','Sacramento Kings':'#5A2D81',
  'Utah Jazz':'#002B5C','Portland Trail Blazers':'#E03A3E',
  'Minnesota Timberwolves':'#0C2340','Orlando Magic':'#0077C0',
  'Cleveland Cavaliers':'#860038','Detroit Pistons':'#C8102E',
  'Washington Wizards':'#002B5C','Charlotte Hornets':'#1D1160',
  'Brooklyn Nets':'#777777','New York Knicks':'#F58426',
  'Chicago Bulls':'#CE1141','Los Angeles Clippers':'#C8102E',
  Lakers:'#552583',Warriors:'#1D428A',Celtics:'#007A33',
  Bucks:'#00471B',Heat:'#98002E',Mavericks:'#00538C',
  Nuggets:'#0E2240',Suns:'#E56020',Grizzlies:'#5D76A9',
  Thunder:'#007AC1',Spurs:'#C4CED4',Rockets:'#CE1141',
  Hawks:'#E03A3E',Pacers:'#002D62',Raptors:'#CE1141',
  Pelicans:'#0C2340',Kings:'#5A2D81',Jazz:'#002B5C',
  Blazers:'#E03A3E',Timberwolves:'#0C2340',Magic:'#0077C0',
  Cavaliers:'#860038',Pistons:'#C8102E',Wizards:'#002B5C',
  Hornets:'#1D1160',Nets:'#777777',Knicks:'#F58426',
  Bulls:'#CE1141',Clippers:'#C8102E',
}

function hashColor(s: string): string {
  const p = ['#06b6d4','#8b5cf6','#eab308','#ec4899','#10b981','#3b82f6']
  let h = 0; for (let i=0;i<s.length;i++) h=(h*31+s.charCodeAt(i))>>>0
  return p[h%p.length]
}

export function teamColor(name: string): string {
  if (!name) return '#f97316'
  if (TEAM_COLORS[name]) return TEAM_COLORS[name]
  const u = name.trim().toUpperCase()
  if (TEAM_COLORS[u]) return TEAM_COLORS[u]
  for (const [k,c] of Object.entries(TEAM_COLORS))
    if (name.toLowerCase().includes(k.toLowerCase())) return c
  return hashColor(name)
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
