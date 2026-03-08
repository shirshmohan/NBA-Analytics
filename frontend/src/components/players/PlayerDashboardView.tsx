import { useState, useEffect } from 'react'
import { usePlayerDashboard, usePlayerAccolades, usePlayerSeasonPercentiles, usePlayerSeasonRanks } from '@/api/hooks/usePlayers'
import { Tabs } from '@/components/ui/Tabs'
import { StatCard } from '@/components/ui/StatCard'
import { SortableTable, type Column } from '@/components/ui/SortableTable'
import { Skeleton } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/ErrorState'
import { Badge } from '@/components/ui/Badge'
import ProgressionChart, { type ProgressionSeason } from '@/components/charts/ProgressionChart'
import PercentileChart from '@/components/charts/PercentileChart'
import { Select } from '@/components/ui/Select'
import { fmt, fmtPct, fmtRank } from '@/utils/formatters'
import type { PlayerSeasonRow } from '@/types'
import { useThreeContext } from '@/context/ThreeContext'

const TABS = [
  { id: 'overview',    label: 'Overview',      icon: '📋' },
  { id: 'seasonal',   label: 'Seasons',        icon: '📊' },
  { id: 'progression',label: 'Progression',    icon: '📈' },
  { id: 'percentiles',label: 'Percentiles',    icon: '🎯' },
  { id: 'ranks',      label: 'Rankings',       icon: '🏆' },
]

const SEASON_COLS: Column<PlayerSeasonRow & Record<string, unknown>>[] = [
  { key: 'season', label: 'Season' },
  { key: 'team',   label: 'Team' },
  { key: 'pos',    label: 'Pos' },
  { key: 'g',      label: 'G',   align: 'right' },
  { key: 'mp',     label: 'MPG', align: 'right', render: r => fmt((r.mp as number) / Math.max(r.g as number, 1)) },
  { key: 'pts',    label: 'PPG', align: 'right', highlight: true, render: r => fmt((r.pts as number) / Math.max(r.g as number, 1)) },
  { key: 'ast',    label: 'APG', align: 'right', render: r => fmt((r.ast as number) / Math.max(r.g as number, 1)) },
  { key: 'trb',    label: 'RPG', align: 'right', render: r => fmt((r.trb as number) / Math.max(r.g as number, 1)) },
  { key: 'stl',    label: 'SPG', align: 'right', render: r => fmt((r.stl as number) / Math.max(r.g as number, 1), 2) },
  { key: 'blk',    label: 'BPG', align: 'right', render: r => fmt((r.blk as number) / Math.max(r.g as number, 1), 2) },
  { key: 'tov',    label: 'TOV', align: 'right', render: r => fmt((r.tov as number) / Math.max(r.g as number, 1), 2) },
  { key: 'fg_percent',  label: 'FG%', align: 'right', render: r => r.fg_percent  ? fmtPct(r.fg_percent  as number) : '—' },
  { key: 'x3p_percent', label: '3P%', align: 'right', render: r => r.x3p_percent ? fmtPct(r.x3p_percent as number) : '—' },
  { key: 'ft_percent',  label: 'FT%', align: 'right', render: r => r.ft_percent  ? fmtPct(r.ft_percent  as number) : '—' },
]

type ProgStat = 'ppg' | 'apg' | 'rpg' | 'spg' | 'fg_pct'
const PROG_STATS: { key: ProgStat; label: string; color: string }[] = [
  { key: 'ppg',    label: 'PPG', color: '#f97316' },
  { key: 'apg',    label: 'APG', color: '#06b6d4' },
  { key: 'rpg',    label: 'RPG', color: '#8b5cf6' },
  { key: 'spg',    label: 'SPG', color: '#eab308' },
  { key: 'fg_pct', label: 'FG%', color: '#ec4899' },
]


const ALL_NBA_TEAM_LABEL: Record<number, string> = { 1: 'First Team', 2: 'Second Team', 3: 'Third Team' }
interface Props { playerName: string }

export default function PlayerDashboardView({ playerName }: Props) {
  const [tab, setTab]               = useState('overview')
  const [progStat, setProgStat]     = useState<ProgStat>('ppg')
  const [selectedSeason, setSeason] = useState<number | null>(null)
  const [rawData, setRawData]       = useState<string | null>(null)
  const { updatePlayerCard }        = useThreeContext()

  const dashQ = usePlayerDashboard(playerName)
  const accQ  = usePlayerAccolades(playerName)

  const dashboard = dashQ.data
  const accolades = accQ.data

  // Only fire percentiles/ranks for seasons that actually exist in the dashboard
  const validSeasonYears = new Set(
    (dashboard?.seasons ?? []).map(s => parseInt(String(s.season).slice(0, 4), 10))
  )
  const seasonForQuery = selectedSeason && validSeasonYears.has(selectedSeason) ? selectedSeason : null

  const pctQ  = usePlayerSeasonPercentiles(playerName, seasonForQuery)
  const rankQ = usePlayerSeasonRanks(playerName, seasonForQuery)

  // Debug: fetch raw JSON on error so we can see exactly what backend returns
  useEffect(() => {
    if (dashQ.isError) {
      const base = (import.meta as any).env?.VITE_API_BASE_URL ?? 'http://localhost:8000'
      fetch(`${base}/players/${encodeURIComponent(playerName)}/dashboard`)
        .then(r => r.text())
        .then(t => setRawData(t))
        .catch(e => setRawData(`fetch failed: ${e.message}`))
    }
  }, [dashQ.isError, playerName])

  useEffect(() => {
    if (dashboard?.seasons?.length) {
      const latest = dashboard.seasons[dashboard.seasons.length - 1]
      const yr = parseInt(String(latest.season).slice(0, 4), 10)
      if (!isNaN(yr)) setSeason(yr)
    }
  }, [dashboard])
  useEffect(() => {
    updatePlayerCard({ name: playerName, season: selectedSeason })
  }, [playerName, selectedSeason, updatePlayerCard])

  // ── Loading ──
  if (dashQ.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton height="8rem" className="rounded-2xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[...Array(8)].map((_, i) => <Skeleton key={i} height="6rem" className="rounded-xl" />)}
        </div>
      </div>
    )
  }

  // ── Error — shows actual error + raw response for debugging ──
  if (dashQ.isError) {
    return (
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">⚠️</span>
          <div>
            <div className="text-white font-semibold">Failed to load "{playerName}"</div>
            <div className="text-xs text-red-400">{(dashQ.error as Error)?.message}</div>
          </div>
          <button onClick={() => dashQ.refetch()} className="ml-auto btn-ghost text-xs">Retry</button>
        </div>
        {rawData && (
          <div>
            <div className="text-xs text-slate-500 mb-1">Raw server response:</div>
            <pre className="text-xs text-green-300 bg-black/40 rounded-lg p-3 overflow-auto max-h-48 font-mono whitespace-pre-wrap">
              {rawData}
            </pre>
          </div>
        )}
      </div>
    )
  }

  if (!dashboard) return null

  const seasons: PlayerSeasonRow[] = Array.isArray(dashboard.seasons) ? dashboard.seasons : []
  const { career } = dashboard

  const latestSeason = seasons.length ? seasons[seasons.length - 1] : null
  const currentTeam  = latestSeason?.team ?? null
  const currentPos   = latestSeason?.pos  ?? null

  const seasonOptions = seasons.map(s => String(parseInt(String(s.season).slice(0, 4), 10)))

  const mvpCount     = accolades?.mvp?.length     ?? 0
  const allStarCount = accolades?.all_star?.length ?? 0
  const allNbaCount  = accolades?.all_nba?.length  ?? 0
  const firstTeams   = accolades?.all_nba?.filter(a => Number(a.all_team) === 1)?.length ?? 0

  const progressionSeasons: ProgressionSeason[] = seasons.map(s => ({
    season: parseInt(String(s.season).slice(0, 4), 10),
    ppg:    s.g ? s.pts / s.g : 0,
    apg:    s.g ? s.ast / s.g : 0,
    rpg:    s.g ? s.trb / s.g : 0,
    spg:    s.g ? s.stl / s.g : 0,
    bpg:    s.g ? s.blk / s.g : 0,
    mpg:    s.g ? s.mp  / s.g : 0,
    fg_pct: s.fg_percent ?? 0,
  }))

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Header ── */}
      <div className="glass-card p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
          style={{ background: 'rgba(249,115,22,0.12)' }}>👤</div>
        <div className="flex-1 min-w-0">
          <h2 className="font-display text-3xl text-white tracking-widest truncate">{playerName.toUpperCase()}</h2>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            {currentTeam  && <Badge label={currentTeam}  color="#f97316" />}
            {currentPos   && <Badge label={currentPos}   color="#64748b" />}
            {mvpCount > 0 && <Badge label={`${mvpCount}× MVP`} color="#eab308" />}
            {allStarCount > 0 && <Badge label={`${allStarCount}× All-Star`} color="#06b6d4" />}
          </div>
        </div>
        <Select
          value={String(selectedSeason ?? '')}
          onChange={v => setSeason(v ? Number(v) : null)}
          options={seasonOptions}
          placeholder="All Seasons"
        />
      </div>

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {/* ── Overview ── */}
      {tab === 'overview' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xs uppercase tracking-widest text-slate-500 mb-3">Career Averages</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard label="PPG"    value={fmt(career.ppg)}    accent />
              <StatCard label="APG"    value={fmt(career.apg)}    />
              <StatCard label="RPG"    value={fmt(career.rpg)}    />
              <StatCard label="SPG"    value={fmt(career.spg, 2)} />
              <StatCard label="BPG"    value={fmt(career.bpg, 2)} />
              <StatCard label="MPG"    value={fmt(career.mpg)}    />
              <StatCard label="Games"  value={String(career.career_g)} />
              <StatCard label="FG%"    value={career.fg_pct ? fmtPct(career.fg_pct) : '—'} />
            </div>
          </div>

          {accolades && (
            <div>
              <h3 className="text-xs uppercase tracking-widest text-slate-500 mb-3">Accolades</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {mvpCount > 0 && (
                  <div className="glass-card p-4">
                    <div className="text-2xl mb-1">🏆</div>
                    <div className="text-2xl font-bold text-yellow-400">{mvpCount}×</div>
                    <div className="text-xs text-slate-500">MVP</div>
                    <div className="text-xs text-slate-600 mt-1">{accolades.mvp.map(m => m.season_start).join(', ')}</div>
                  </div>
                )}
                {allStarCount > 0 && (
                  <div className="glass-card p-4">
                    <div className="text-2xl mb-1">⭐</div>
                    <div className="text-2xl font-bold text-cyan-400">{allStarCount}×</div>
                    <div className="text-xs text-slate-500">All-Star</div>
                  </div>
                )}
                {allNbaCount > 0 && (
                  <div className="glass-card p-4">
                    <div className="text-2xl mb-1">🎖️</div>
                    <div className="text-2xl font-bold text-purple-400">{allNbaCount}×</div>
                    <div className="text-xs text-slate-500">All-NBA</div>
                    {firstTeams > 0 && <div className="text-xs text-slate-600 mt-1">{firstTeams}× First Team</div>}
                    <div className="text-xs text-slate-600 mt-1 truncate">
                      {accolades.all_nba.slice(0,3).map(a =>
                        `${a.season_start} ${ALL_NBA_TEAM_LABEL[Number(a.all_team)] ?? `Team ${a.all_team}`}`
                      ).join(', ')}
                    </div>
                  </div>
                )}
                {(accolades.awards?.length ?? 0) > 0 && (
                  <div className="glass-card p-4">
                    <div className="text-2xl mb-1">🥇</div>
                    <div className="text-2xl font-bold text-green-400">{accolades.awards.length}</div>
                    <div className="text-xs text-slate-500">Awards</div>
                    <div className="text-xs text-slate-600 mt-1 truncate">
                      {accolades.awards.slice(0, 2).map(a => a.award).join(', ')}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Seasonal Stats ── */}
      {tab === 'seasonal' && (
        <div className="glass-card overflow-hidden">
          <div className="p-3 border-b border-white/6">
            <h3 className="text-xs uppercase tracking-widest text-slate-500">Season-by-Season · {seasons.length} seasons</h3>
          </div>
          <SortableTable
            columns={SEASON_COLS}
            data={seasons as (PlayerSeasonRow & Record<string, unknown>)[]}
            rowKey="season"
            maxHeight="500px"
          />
        </div>
      )}

      {/* ── Progression ── */}
      {tab === 'progression' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {PROG_STATS.map(s => (
              <button key={s.key} onClick={() => setProgStat(s.key)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all"
                style={progStat === s.key
                  ? { background: s.color, borderColor: s.color, color: '#fff' }
                  : { borderColor: 'rgba(255,255,255,0.1)', color: '#64748b' }}>
                {s.label}
              </button>
            ))}
          </div>
          <div className="glass-card p-4">
            <ProgressionChart seasons={progressionSeasons} stat={progStat}
              color={PROG_STATS.find(s => s.key === progStat)?.color} />
          </div>
        </div>
      )}

      {/* ── Percentiles ── */}
      {tab === 'percentiles' && (
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-white">Season Percentiles</h3>
            <Select value={String(selectedSeason ?? '')} onChange={v => setSeason(v ? Number(v) : null)}
              options={seasonOptions} placeholder="Season" />
          </div>
          {pctQ.isLoading && <Skeleton height="200px" />}
          {pctQ.isError && (
            <div className="text-xs text-red-400 font-mono bg-red-500/10 rounded p-3">
              {(pctQ.error as Error)?.message}
            </div>
          )}
          {pctQ.data && <PercentileChart data={pctQ.data} />}
        </div>
      )}

      {/* ── Rankings ── */}
      {tab === 'ranks' && (
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-white">Season Rankings</h3>
            <Select value={String(selectedSeason ?? '')} onChange={v => setSeason(v ? Number(v) : null)}
              options={seasonOptions} placeholder="Season" />
          </div>
          {rankQ.isLoading && <Skeleton height="200px" />}
          {rankQ.isError && (
            <div className="text-xs text-red-400 font-mono bg-red-500/10 rounded p-3">
              {(rankQ.error as Error)?.message}
            </div>
          )}
          {rankQ.data && (() => {
            const r = rankQ.data
            const entries = [
              { label: 'PPG', rank: r.ppg_rank, val: fmt(r.ppg) },
              { label: 'APG', rank: r.apg_rank, val: fmt(r.apg) },
              { label: 'SPG', rank: r.spg_rank, val: fmt(r.spg, 2) },
              { label: 'MPG', rank: r.mpg_rank, val: fmt(r.mpg) },
            ]
            return (
              <div className="space-y-3">
                {entries.map(e => {
                  const pct = Math.round((1 - (e.rank - 1) / r.pool_size) * 100)
                  return (
                    <div key={e.label} className="flex items-center gap-3">
                      <div className="text-xs text-slate-500 w-10">{e.label}</div>
                      <div className="text-xs font-mono text-white w-10">{e.val}</div>
                      <div className="flex-1 h-4 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full rounded-full"
                          style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#f97316aa,#f97316)' }} />
                      </div>
                      <div className="font-mono text-xs text-orange-400 w-20 text-right">{fmtRank(e.rank, r.pool_size)}</div>
                    </div>
                  )
                })}
                <div className="text-xs text-slate-600 pt-2">Pool: {r.pool_size} qualified players</div>
              </div>
            )
          })()}
        </div>
      )}
    </div>
  )
}
