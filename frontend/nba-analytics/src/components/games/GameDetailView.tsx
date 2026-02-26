import { useState, useMemo } from 'react'
import { useGameTeamStats, useGamePlayerStats, useGamePlayByPlay } from '@/api/hooks/useGames'
import { Tabs } from '@/components/ui/Tabs'
import { SortableTable, type Column } from '@/components/ui/SortableTable'
import { Skeleton, SkeletonTable } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/ErrorState'
import { Select } from '@/components/ui/Select'
import ScoreTimeline from '@/components/charts/ScoreTimeline'
import ShotZoneChart from '@/components/charts/ShotZoneChart'
import { fmt, fmtPct, teamColor, fmtDate } from '@/utils/formatters'
import { buildScoreTimeline, buildShotZones, buildTeamEventTimeline, EVENT_ICONS, EVENT_COLORS } from '@/utils/pbpAdapters'
import type { PlayerBoxScore, PlayByPlayEvent } from '@/types'
import { useThreeContext } from '@/context/ThreeContext'

const GAME_TABS = [
  { id: 'scoreline', label: 'Scoreline', icon: '📈' },
  { id: 'boxscore', label: 'Box Score', icon: '📋' },
  { id: 'players', label: 'Players', icon: '👥' },
  { id: 'pbp', label: 'Play-by-Play', icon: '⚡' },
  { id: 'shots', label: 'Shot Profile', icon: '🎯' },
]

type PlayerRow = PlayerBoxScore & Record<string, unknown>

const PLAYER_COLS: Column<PlayerRow>[] = [
  { key: 'player', label: 'Player' },
  { key: 'min', label: 'MIN' },
  { key: 'pts', label: 'PTS', align: 'right', highlight: true },
  { key: 'reb', label: 'REB', align: 'right' },
  { key: 'ast', label: 'AST', align: 'right' },
  { key: 'stl', label: 'STL', align: 'right' },
  { key: 'blk', label: 'BLK', align: 'right' },
  { key: 'tov', label: 'TOV', align: 'right' },
  { key: 'fgm', label: 'FGM', align: 'right' },
  { key: 'fga', label: 'FGA', align: 'right' },
  {
    key: 'fg_pct', label: 'FG%', align: 'right',
    render: r => fmtPct(r.fgm as number / (r.fga as number) || 0)
  },
  { key: 'x3pm', label: '3PM', align: 'right' },
  { key: 'x3pa', label: '3PA', align: 'right' },
  { key: 'ftm', label: 'FTM', align: 'right' },
  { key: 'fta', label: 'FTA', align: 'right' },
  {
    key: 'plus_minus', label: '+/-', align: 'right',
    render: r => {
      const pm = r.plus_minus as number | null
      if (pm === null) return '—'
      return (
        <span style={{ color: pm > 0 ? '#22c55e' : pm < 0 ? '#ef4444' : '#64748b' }}>
          {pm > 0 ? '+' : ''}{pm}
        </span>
      )
    }
  },
]

interface Props {
  gameId: string
}

export default function GameDetailView({ gameId }: Props) {
  const [tab, setTab] = useState('scoreline')
  const [pbpPeriod, setPbpPeriod] = useState('')
  const [pbpTeam, setPbpTeam] = useState('')
  const [pbpAction, setPbpAction] = useState('')
  const [highlightedEvent, setHighlightedEvent] = useState<PlayByPlayEvent | null>(null)
  const { triggerPulse } = useThreeContext()

  const teamQ = useGameTeamStats(gameId)
  const playerQ = useGamePlayerStats(gameId)
  const pbpQ = useGamePlayByPlay(gameId)

  const home = teamQ.data?.home
  const away = teamQ.data?.away

  const scoreTimeline = useMemo(() => {
    if (!pbpQ.data || !home) return []
    return buildScoreTimeline(pbpQ.data, home.tricode)
  }, [pbpQ.data, home])

  const shotZones = useMemo(() => {
    if (!pbpQ.data) return []
    return buildShotZones(pbpQ.data)
  }, [pbpQ.data])

  const filteredPbp = useMemo(() => {
    if (!pbpQ.data) return []
    return pbpQ.data.filter(ev => {
      if (pbpPeriod && ev.period !== Number(pbpPeriod)) return false
      if (pbpTeam && ev.teamTricode !== pbpTeam) return false
      if (pbpAction && ev.actionType !== pbpAction) return false
      return true
    })
  }, [pbpQ.data, pbpPeriod, pbpTeam, pbpAction])

  const actionTypes = useMemo(() => {
    if (!pbpQ.data) return []
    return [...new Set(pbpQ.data.map(e => e.actionType))].sort()
  }, [pbpQ.data])

  function handleEventHover(ev: PlayByPlayEvent | null) {
    setHighlightedEvent(ev)
    if (ev) {
      triggerPulse(ev.x ?? 0, ev.y ?? 0)
    }
  }

  if (teamQ.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton height="6rem" className="rounded-2xl" />
        <Skeleton height="16rem" className="rounded-xl" />
      </div>
    )
  }

  if (teamQ.isError) {
    return <ErrorState message="Failed to load game data" onRetry={() => teamQ.refetch()} />
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Game header */}
      {home && away && (
        <div className="glass-card p-5">
          <div className="flex items-center justify-between">
            {/* Away */}
            <div className="flex-1 text-center">
              <div className="font-display text-4xl md:text-5xl" style={{ color: teamColor(away.tricode) }}>
                {away.tricode}
              </div>
              <div className="text-xs text-slate-500 mt-1">{away.team}</div>
            </div>

            {/* Score */}
            <div className="flex-shrink-0 px-6 text-center">
              <div className="font-display text-5xl md:text-6xl text-white tracking-widest">
                {away.pts}
                <span className="text-slate-600 mx-2">-</span>
                {home.pts}
              </div>
              <div className="text-xs text-slate-500 mt-1">FINAL</div>
            </div>

            {/* Home */}
            <div className="flex-1 text-center">
              <div className="font-display text-4xl md:text-5xl" style={{ color: teamColor(home.tricode) }}>
                {home.tricode}
              </div>
              <div className="text-xs text-slate-500 mt-1">{home.team}</div>
            </div>
          </div>
        </div>
      )}

      <Tabs tabs={GAME_TABS} active={tab} onChange={setTab} />

      {tab === 'scoreline' && (
        <div className="glass-card p-4">
          <h3 className="text-xs uppercase tracking-widest text-slate-500 mb-4">Score Timeline</h3>
          {pbpQ.isLoading ? (
            <Skeleton height="240px" />
          ) : scoreTimeline.length > 0 ? (
            <ScoreTimeline
              data={scoreTimeline}
              homeTricode={home?.tricode ?? 'HOME'}
              awayTricode={away?.tricode ?? 'AWAY'}
            />
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-600 text-sm">
              Score timeline not available
            </div>
          )}
        </div>
      )}

      {tab === 'boxscore' && home && away && (
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { team: home, label: 'Home' },
            { team: away, label: 'Away' },
          ].map(({ team, label }) => (
            <div key={team.tricode} className="glass-card overflow-hidden">
              <div className="p-3 border-b border-white/6 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: teamColor(team.tricode) }} />
                <span className="font-semibold text-sm text-white">{team.team}</span>
                <span className="text-slate-600 text-xs ml-auto">{label}</span>
              </div>
              <div className="grid grid-cols-3 gap-0">
                {[
                  { label: 'PTS', value: team.pts },
                  { label: 'REB', value: team.reb },
                  { label: 'AST', value: team.ast },
                  { label: 'STL', value: team.stl },
                  { label: 'BLK', value: team.blk },
                  { label: 'TOV', value: team.tov },
                  { label: 'FG%', value: fmtPct(team.fg_pct) },
                  { label: '3P%', value: fmtPct(team.x3p_pct) },
                  { label: 'FT%', value: fmtPct(team.ft_pct) },
                ].map(stat => (
                  <div key={stat.label} className="p-3 border-b border-r border-white/4 text-center">
                    <div className="text-xl font-bold text-white">{stat.value}</div>
                    <div className="text-xs text-slate-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'players' && (
        <div className="space-y-4">
          {playerQ.isLoading && <SkeletonTable rows={7} cols={8} />}
          {playerQ.isError && <ErrorState message="Failed to load player stats" onRetry={() => playerQ.refetch()} compact />}
          {playerQ.data && (
            <>
              {[
                { players: playerQ.data.home_players, tricode: playerQ.data.home_tricode, label: 'Home' },
                { players: playerQ.data.away_players, tricode: playerQ.data.away_tricode, label: 'Away' },
              ].map(({ players, tricode, label }) => (
                <div key={tricode} className="glass-card overflow-hidden">
                  <div className="p-3 border-b border-white/6 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: teamColor(tricode) }} />
                    <span className="font-semibold text-sm text-white">{tricode}</span>
                    <span className="text-slate-600 text-xs ml-auto">{label}</span>
                  </div>
                  <SortableTable
                    columns={PLAYER_COLS}
                    data={players as PlayerRow[]}
                    rowKey="person_id"
                    maxHeight="320px"
                  />
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {tab === 'pbp' && (
        <div className="space-y-3">
          {/* PBP Filters */}
          <div className="glass-card p-3 grid grid-cols-2 md:grid-cols-4 gap-3">
            <Select
              value={pbpPeriod}
              onChange={setPbpPeriod}
              options={['1', '2', '3', '4']}
              placeholder="All Periods"
            />
            <Select
              value={pbpTeam}
              onChange={setPbpTeam}
              options={[home?.tricode ?? '', away?.tricode ?? ''].filter(Boolean)}
              placeholder="All Teams"
            />
            <Select
              value={pbpAction}
              onChange={setPbpAction}
              options={actionTypes}
              placeholder="All Actions"
            />
            <div className="flex items-center">
              <button
                onClick={() => { setPbpPeriod(''); setPbpTeam(''); setPbpAction('') }}
                className="btn-ghost text-xs w-full"
              >
                Clear Filters
              </button>
            </div>
          </div>

          <div className="glass-card overflow-hidden">
            <div className="p-3 border-b border-white/6 flex items-center gap-3">
              <div className="text-xs text-slate-500 uppercase tracking-widest">
                {filteredPbp.length} events
              </div>
              {home && away && (
                <div className="flex gap-3 ml-auto">
                  {Object.entries(EVENT_COLORS).slice(0, 5).map(([cat, color]) => (
                    <div key={cat} className="flex items-center gap-1 text-xs text-slate-500">
                      <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                      {cat}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {pbpQ.isLoading ? (
              <SkeletonTable rows={10} cols={4} />
            ) : (
              <div className="max-h-[500px] overflow-y-auto">
                {filteredPbp.map((ev, i) => {
                  const category = categorizeEv(ev.actionType)
                  const isHighlighted = highlightedEvent === ev
                  return (
                    <div
                      key={i}
                      onMouseEnter={() => handleEventHover(ev)}
                      onMouseLeave={() => handleEventHover(null)}
                      className="flex items-start gap-3 px-4 py-2 border-b border-white/4 transition-all cursor-default"
                      style={{
                        background: isHighlighted ? 'rgba(249,115,22,0.08)' : undefined,
                      }}
                    >
                      <div className="text-xs font-mono text-slate-600 w-20 flex-shrink-0 pt-0.5">
                        Q{ev.period} {ev.clock}
                      </div>
                      <div
                        className="w-5 h-5 rounded text-sm flex items-center justify-center flex-shrink-0"
                        style={{ background: `${EVENT_COLORS[category] ?? '#64748b'}22` }}
                      >
                        {EVENT_ICONS[category] ?? '•'}
                      </div>
                      <div className="flex-1">
                        <span className="text-sm text-white">{ev.description}</span>
                        {ev.playerName && (
                          <span className="ml-2 text-xs text-slate-500">{ev.playerName}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {ev.teamTricode && (
                          <span
                            className="text-xs font-bold"
                            style={{ color: teamColor(ev.teamTricode) }}
                          >
                            {ev.teamTricode}
                          </span>
                        )}
                        {ev.shotResult && (
                          <span className={`text-xs font-semibold ${ev.shotResult === 'Made' ? 'text-green-400' : 'text-red-400'}`}>
                            {ev.shotResult}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'shots' && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="glass-card p-4">
            <h3 className="text-xs uppercase tracking-widest text-slate-500 mb-4">Shot Zone FG%</h3>
            {pbpQ.isLoading ? <Skeleton height="200px" /> : <ShotZoneChart data={shotZones} />}
          </div>
          <div className="glass-card p-4">
            <h3 className="text-xs uppercase tracking-widest text-slate-500 mb-4">2PT vs 3PT Distribution</h3>
            {pbpQ.isLoading ? <Skeleton height="200px" /> : (
              <div className="space-y-4 mt-6">
                {(() => {
                  if (!pbpQ.data) return null
                  const shots = pbpQ.data.filter(e => e.shotValue !== null)
                  const twos = shots.filter(e => e.shotValue === 2)
                  const threes = shots.filter(e => e.shotValue === 3)
                  const twoPct = twos.length > 0 ? twos.filter(e => e.shotResult === 'Made').length / twos.length : 0
                  const threePct = threes.length > 0 ? threes.filter(e => e.shotResult === 'Made').length / threes.length : 0
                  const total = shots.length
                  return (
                    <>
                      <div>
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="text-slate-500">2-Pointers</span>
                          <span className="text-orange-400">{twos.length} att · {fmtPct(twoPct)}</span>
                        </div>
                        <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-orange-500" style={{ width: `${(twos.length / (total || 1)) * 100}%` }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="text-slate-500">3-Pointers</span>
                          <span className="text-cyan-400">{threes.length} att · {fmtPct(threePct)}</span>
                        </div>
                        <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-cyan-500" style={{ width: `${(threes.length / (total || 1)) * 100}%` }} />
                        </div>
                      </div>
                      <div className="text-xs text-slate-600 pt-2">Total: {total} field goal attempts</div>
                    </>
                  )
                })()}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function categorizeEv(actionType: string): string {
  const t = actionType.toLowerCase()
  if (t === '2pt' || t === '3pt') return 'shot'
  if (t === 'assist') return 'assist'
  if (t === 'turnover') return 'turnover'
  if (t.includes('foul')) return 'foul'
  if (t.includes('rebound')) return 'rebound'
  if (t.includes('block')) return 'block'
  if (t.includes('steal')) return 'steal'
  return 'other'
}
