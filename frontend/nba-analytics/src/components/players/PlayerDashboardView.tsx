import { useState, useEffect } from 'react'
import { usePlayerDashboard, usePlayerAccolades, usePlayerSeasonPercentiles, usePlayerSeasonRanks, usePlayerPlayByPlay } from '@/api/hooks/usePlayers'
import { Tabs } from '@/components/ui/Tabs'
import { StatCard } from '@/components/ui/StatCard'
import { SortableTable, type Column } from '@/components/ui/SortableTable'
import { Skeleton, SkeletonTable } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/ErrorState'
import { Badge } from '@/components/ui/Badge'
import ProgressionChart from '@/components/charts/ProgressionChart'
import PercentileChart from '@/components/charts/PercentileChart'
import { Select } from '@/components/ui/Select'
import { fmt, fmtPct, fmtSeason, fmtRank, fmtDate, accentColor, teamColor } from '@/utils/formatters'
import type { PlayerSeason } from '@/types'
import { useThreeContext } from '@/context/ThreeContext'
import { EVENT_ICONS, EVENT_COLORS, buildTeamEventTimeline } from '@/utils/pbpAdapters'

const TABS = [
  { id: 'overview', label: 'Overview', icon: '📋' },
  { id: 'seasonal', label: 'Seasonal Stats', icon: '📊' },
  { id: 'progression', label: 'Progression', icon: '📈' },
  { id: 'percentiles', label: 'Percentiles', icon: '🎯' },
  { id: 'ranks', label: 'Rankings', icon: '🏆' },
  { id: 'timeline', label: 'Impact Timeline', icon: '⚡' },
]

const SEASON_COLS: Column<PlayerSeason & Record<string, unknown>>[] = [
  { key: 'season', label: 'Season', render: r => fmtSeason(r.season as number) },
  { key: 'team', label: 'Team' },
  { key: 'g', label: 'G', align: 'right' },
  { key: 'mpg', label: 'MPG', align: 'right', render: r => fmt(r.mpg as number) },
  { key: 'ppg', label: 'PPG', align: 'right', render: r => fmt(r.ppg as number), highlight: true },
  { key: 'apg', label: 'APG', align: 'right', render: r => fmt(r.apg as number) },
  { key: 'rpg', label: 'RPG', align: 'right', render: r => fmt(r.rpg as number) },
  { key: 'spg', label: 'SPG', align: 'right', render: r => fmt(r.spg as number, 2) },
  { key: 'bpg', label: 'BPG', align: 'right', render: r => fmt(r.bpg as number, 2) },
  { key: 'tov_pg', label: 'TOV', align: 'right', render: r => fmt(r.tov_pg as number, 2) },
  { key: 'fg_pct', label: 'FG%', align: 'right', render: r => fmtPct(r.fg_pct as number) },
  { key: 'x3p_pct', label: '3P%', align: 'right', render: r => r.x3p_pct ? fmtPct(r.x3p_pct as number) : '—' },
]

const PROG_STATS: { key: 'ppg' | 'apg' | 'rpg' | 'spg' | 'bpg' | 'mpg' | 'fg_pct'; label: string; color: string }[] = [
  { key: 'ppg', label: 'PPG', color: '#f97316' },
  { key: 'apg', label: 'APG', color: '#06b6d4' },
  { key: 'rpg', label: 'RPG', color: '#8b5cf6' },
  { key: 'spg', label: 'SPG', color: '#eab308' },
  { key: 'bpg', label: 'BPG', color: '#10b981' },
  { key: 'mpg', label: 'MPG', color: '#64748b' },
  { key: 'fg_pct', label: 'FG%', color: '#ec4899' },
]

interface Props {
  playerName: string
}

export default function PlayerDashboardView({ playerName }: Props) {
  const [tab, setTab] = useState('overview')
  const [progStat, setProgStat] = useState<'ppg' | 'apg' | 'rpg' | 'spg' | 'bpg' | 'mpg' | 'fg_pct'>('ppg')
  const [selectedSeason, setSelectedSeason] = useState<number | null>(null)
  const { updatePlayerCard } = useThreeContext()

  const dashQ = usePlayerDashboard(playerName)
  const accQ = usePlayerAccolades(playerName)
  const pctQ = usePlayerSeasonPercentiles(playerName, selectedSeason)
  const rankQ = usePlayerSeasonRanks(playerName, selectedSeason)
  const pbpQ = usePlayerPlayByPlay(playerName)

  const dashboard = dashQ.data
  const accolades = accQ.data

  useEffect(() => {
    if (dashboard?.seasons?.length) {
      const latestSeason = Math.max(...dashboard.seasons.map(s => s.season))
      setSelectedSeason(latestSeason)
    }
  }, [dashboard])

  useEffect(() => {
    updatePlayerCard({ name: playerName, season: selectedSeason })
  }, [playerName, selectedSeason, updatePlayerCard])

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

  if (dashQ.isError) {
    return <ErrorState message="Failed to load player data" onRetry={() => dashQ.refetch()} />
  }

  if (!dashboard) return null

  const { career } = dashboard
  const seasons = dashboard.seasons as (PlayerSeason & Record<string, unknown>)[]
  const accs = accolades?.accolades

  const seasonOptions = seasons.map(s => String(s.season))

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Player Header */}
      <div className="glass-card p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
          style={{ background: `${teamColor(dashboard.current_team?.slice(0, 3) ?? '')}22` }}
        >
          👤
        </div>
        <div className="flex-1">
          <h2 className="font-display text-3xl text-white tracking-widest">{playerName.toUpperCase()}</h2>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            {dashboard.current_team && (
              <Badge label={dashboard.current_team} color={teamColor(dashboard.current_team.slice(0, 3))} />
            )}
            {dashboard.position && <Badge label={dashboard.position} color="#64748b" />}
            {accs && accs.mvps.length > 0 && <Badge label={`${accs.mvps.length}× MVP`} color="#eab308" />}
            {accs && accs.champion.length > 0 && <Badge label={`${accs.champion.length}× Champion`} color="#22c55e" />}
          </div>
        </div>

        {/* Season selector */}
        <div className="flex-shrink-0">
          <Select
            label="Season"
            value={String(selectedSeason ?? '')}
            onChange={v => setSelectedSeason(v ? Number(v) : null)}
            options={seasonOptions}
            placeholder="Career"
          />
        </div>
      </div>

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === 'overview' && (
        <div className="space-y-6">
          {/* Career stats */}
          <div>
            <h3 className="text-xs uppercase tracking-widest text-slate-500 mb-3">Career Averages</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard label="PPG" value={fmt(career.ppg)} accent />
              <StatCard label="APG" value={fmt(career.apg)} />
              <StatCard label="RPG" value={fmt(career.rpg)} />
              <StatCard label="SPG" value={fmt(career.spg, 2)} />
              <StatCard label="BPG" value={fmt(career.bpg, 2)} />
              <StatCard label="MPG" value={fmt(career.mpg)} />
              <StatCard label="Games" value={career.g} />
              <StatCard label="Seasons" value={career.seasons} />
            </div>
          </div>

          {/* Accolades */}
          {accs && (
            <div>
              <h3 className="text-xs uppercase tracking-widest text-slate-500 mb-3">Accolades</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {accs.mvps.length > 0 && (
                  <div className="glass-card p-4">
                    <div className="text-2xl mb-1">🏆</div>
                    <div className="stat-value text-2xl text-yellow-400">{accs.mvps.length}×</div>
                    <div className="text-xs text-slate-500">MVP</div>
                    <div className="text-xs text-slate-600 mt-1">{accs.mvps.map(m => fmtSeason(m.season)).join(', ')}</div>
                  </div>
                )}
                {accs.all_star.length > 0 && (
                  <div className="glass-card p-4">
                    <div className="text-2xl mb-1">⭐</div>
                    <div className="stat-value text-2xl text-cyan-400">{accs.all_star.length}×</div>
                    <div className="text-xs text-slate-500">All-Star</div>
                  </div>
                )}
                {accs.all_nba.length > 0 && (
                  <div className="glass-card p-4">
                    <div className="text-2xl mb-1">🎖️</div>
                    <div className="stat-value text-2xl text-purple-400">{accs.all_nba.length}×</div>
                    <div className="text-xs text-slate-500">All-NBA</div>
                    <div className="text-xs text-slate-600 mt-1">{accs.all_nba.filter(a => a.team === '1st').length}× First Team</div>
                  </div>
                )}
                {accs.champion.length > 0 && (
                  <div className="glass-card p-4">
                    <div className="text-2xl mb-1">💍</div>
                    <div className="stat-value text-2xl text-green-400">{accs.champion.length}×</div>
                    <div className="text-xs text-slate-500">Champion</div>
                    <div className="text-xs text-slate-600 mt-1">{accs.champion.map(c => c.team).join(', ')}</div>
                  </div>
                )}
                {accs.dpoy.length > 0 && (
                  <div className="glass-card p-4">
                    <div className="text-2xl mb-1">🛡️</div>
                    <div className="stat-value text-2xl text-blue-400">{accs.dpoy.length}×</div>
                    <div className="text-xs text-slate-500">DPOY</div>
                  </div>
                )}
                {accs.all_defense.length > 0 && (
                  <div className="glass-card p-4">
                    <div className="text-2xl mb-1">🔒</div>
                    <div className="stat-value text-2xl text-blue-300">{accs.all_defense.length}×</div>
                    <div className="text-xs text-slate-500">All-Defense</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'seasonal' && (
        <div className="glass-card overflow-hidden">
          <div className="p-3 border-b border-white/6">
            <h3 className="text-xs uppercase tracking-widest text-slate-500">Season-by-Season Stats</h3>
          </div>
          <SortableTable
            columns={SEASON_COLS}
            data={seasons}
            rowKey="season"
            maxHeight="500px"
          />
        </div>
      )}

      {tab === 'progression' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {PROG_STATS.map(s => (
              <button
                key={s.key}
                onClick={() => setProgStat(s.key)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${progStat === s.key ? 'text-white border-transparent' : 'text-slate-500 border-white/10 hover:border-white/20'}`}
                style={progStat === s.key ? { background: s.color, borderColor: s.color } : {}}
              >
                {s.label}
              </button>
            ))}
          </div>
          <div className="glass-card p-4">
            <h3 className="text-sm font-semibold text-white mb-4">
              {PROG_STATS.find(s => s.key === progStat)?.label} Progression
            </h3>
            <ProgressionChart
              seasons={dashboard.seasons}
              stat={progStat}
              color={PROG_STATS.find(s => s.key === progStat)?.color}
            />
          </div>
        </div>
      )}

      {tab === 'percentiles' && (
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-white">Season Percentiles</h3>
            <Select
              value={String(selectedSeason ?? '')}
              onChange={v => setSelectedSeason(v ? Number(v) : null)}
              options={seasonOptions}
              placeholder="Season"
            />
          </div>
          {pctQ.isLoading && <Skeleton height="200px" />}
          {pctQ.isError && <ErrorState message="Failed to load percentiles" onRetry={() => pctQ.refetch()} compact />}
          {pctQ.data && <PercentileChart data={pctQ.data} />}
        </div>
      )}

      {tab === 'ranks' && (
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-white">Season Rankings</h3>
            <Select
              value={String(selectedSeason ?? '')}
              onChange={v => setSelectedSeason(v ? Number(v) : null)}
              options={seasonOptions}
              placeholder="Season"
            />
          </div>
          {rankQ.isLoading && <Skeleton height="200px" />}
          {rankQ.isError && <ErrorState message="Failed to load rankings" onRetry={() => rankQ.refetch()} compact />}
          {rankQ.data && (
            <div className="space-y-3">
              {Object.entries(rankQ.data.ranks).map(([key, rank]) => {
                const label = key.replace('_rank', '').replace('_pg', '/g').replace('_pct', '%').toUpperCase()
                const pct = Math.round((1 - (rank - 1) / rankQ.data.pool_size) * 100)
                return (
                  <div key={key} className="flex items-center gap-3">
                    <div className="text-xs text-slate-500 w-20 text-right">{label}</div>
                    <div className="flex-1 h-5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #f97316aa, #f97316)' }}
                      />
                    </div>
                    <div className="font-mono text-xs text-orange-400 w-20">
                      {fmtRank(rank, rankQ.data.pool_size)}
                    </div>
                  </div>
                )
              })}
              <div className="text-xs text-slate-600 pt-2">Pool: {rankQ.data.pool_size} qualified players</div>
            </div>
          )}
        </div>
      )}

      {tab === 'timeline' && (
        <div className="glass-card overflow-hidden">
          <div className="p-3 border-b border-white/6 flex items-center justify-between">
            <h3 className="text-xs uppercase tracking-widest text-slate-500">Impact Timeline</h3>
            <div className="flex gap-2 flex-wrap">
              {Object.entries(EVENT_COLORS).slice(0, 6).map(([cat, color]) => (
                <div key={cat} className="flex items-center gap-1 text-xs text-slate-500">
                  <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                  {cat}
                </div>
              ))}
            </div>
          </div>
          {pbpQ.isLoading && <SkeletonTable rows={8} cols={4} />}
          {pbpQ.isError && <ErrorState message="Play-by-play not available" compact />}
          {pbpQ.data && (
            <div className="max-h-96 overflow-y-auto">
              {buildTeamEventTimeline(pbpQ.data as Parameters<typeof buildTeamEventTimeline>[0]).map((ev, i) => (
                <div key={i} className="flex items-start gap-3 px-4 py-2 border-b border-white/4 hover:bg-white/3 transition-all group">
                  <div className="text-xs font-mono text-slate-600 w-16 flex-shrink-0 pt-0.5">
                    Q{ev.period} {ev.clock}
                  </div>
                  <div className="w-5 h-5 rounded flex items-center justify-center text-sm flex-shrink-0"
                    style={{ background: `${EVENT_COLORS[ev.category] ?? '#64748b'}22` }}>
                    {EVENT_ICONS[ev.category] ?? '•'}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-white">{ev.description}</div>
                    <div className="text-xs text-slate-600">{fmtDate(ev.game_date)}</div>
                  </div>
                  {ev.shotResult && (
                    <div className={`text-xs font-semibold flex-shrink-0 ${ev.shotResult === 'Made' ? 'text-green-400' : 'text-red-400'}`}>
                      {ev.shotResult}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
