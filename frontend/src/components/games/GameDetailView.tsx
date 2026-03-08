import { useState, useMemo } from 'react'
import {
  useGameTeamStats, useGamePlayerStats,
  useGamePbpSequence, useGameShotDistribution,
  useGameScoringRuns, useGameTeamEfficiency,
  useGameKeyEvents,
} from '@/api/hooks/useGames'
import { Tabs } from '@/components/ui/Tabs'
import { SortableTable, type Column } from '@/components/ui/SortableTable'
import { Skeleton, SkeletonTable } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/ErrorState'
import { Badge } from '@/components/ui/Badge'
import ScoreTimeline from '@/components/charts/ScoreTimeline'
import TeamEfficiencyChart from '@/components/charts/TeamEfficiencyChart'
import KeyEventsChart from '@/components/charts/KeyEventsChart'
import { fmt, fmtPct, teamColor } from '@/utils/formatters'
import type { PlayerGameStatEntry, ScoreTimelinePoint } from '@/types'

const GAME_TABS = [
  { id: 'scoreline',  label: 'Scoreline',      icon: '📈' },
  { id: 'boxscore',   label: 'Box Score',       icon: '📋' },
  { id: 'players',    label: 'Players',         icon: '👥' },
  { id: 'efficiency', label: 'Efficiency',      icon: '🎯' },
  { id: 'keyevents',  label: 'Key Events',      icon: '⚡' },
  { id: 'shots',      label: 'Shot Zones',      icon: '🏀' },
  { id: 'runs',       label: 'Scoring Runs',    icon: '🔥' },
]

type PlayerRow = PlayerGameStatEntry & Record<string, unknown>

const PLAYER_COLS: Column<PlayerRow>[] = [
  { key: 'player_name',    label: 'Player',  render: r => r.player_name ?? '—' },
  { key: 'num_minutes',    label: 'MIN',     align: 'right', render: r => fmt(r.num_minutes as number) },
  { key: 'points',         label: 'PTS',     align: 'right', highlight: true },
  { key: 'rebounds_total', label: 'REB',     align: 'right' },
  { key: 'assists',        label: 'AST',     align: 'right' },
  { key: 'steals',         label: 'STL',     align: 'right' },
  { key: 'blocks',         label: 'BLK',     align: 'right' },
  { key: 'turnovers',      label: 'TOV',     align: 'right' },
  {
    key: 'fgm', label: 'FG', align: 'right',
    render: r => { const s = r.shooting as PlayerGameStatEntry['shooting']; return `${s.fgm}/${s.fga}` }
  },
  {
    key: 'fg_pct', label: 'FG%', align: 'right',
    render: r => { const s = r.shooting as PlayerGameStatEntry['shooting']; return s.fg_pct != null ? fmtPct(s.fg_pct) : '—' }
  },
  {
    key: 'tpm', label: '3P', align: 'right',
    render: r => { const s = r.shooting as PlayerGameStatEntry['shooting']; return `${s.tpm}/${s.tpa}` }
  },
  {
    key: 'ftm', label: 'FT', align: 'right',
    render: r => { const s = r.shooting as PlayerGameStatEntry['shooting']; return `${s.ftm}/${s.fta}` }
  },
  {
    key: 'plus_minus', label: '+/-', align: 'right',
    render: r => {
      const pm = r.plus_minus as number | null
      if (pm == null) return '—'
      return <span style={{ color: pm > 0 ? '#22c55e' : pm < 0 ? '#ef4444' : '#64748b' }}>{pm > 0 ? `+${pm}` : pm}</span>
    }
  },
]

interface Props { gameId: number }

export default function GameDetailView({ gameId }: Props) {
  const [tab, setTab] = useState('scoreline')

  const teamQ   = useGameTeamStats(gameId)
  const playerQ = useGamePlayerStats(gameId)
  const pbpQ    = useGamePbpSequence(gameId)
  const shotQ   = useGameShotDistribution(gameId)
  const runsQ   = useGameScoringRuns(gameId)
  const effQ    = useGameTeamEfficiency(gameId)
  const keyQ    = useGameKeyEvents(gameId)

  const homeTeam = teamQ.data?.home_team
  const awayTeam = teamQ.data?.away_team

  // Derive short abbreviations from team name for color lookup
  const homeAbbrev = homeTeam?.team?.abbrev ?? homeTeam?.team?.name?.slice(0,3).toUpperCase() ?? 'HOM'
  const awayAbbrev = awayTeam?.team?.abbrev ?? awayTeam?.team?.name?.slice(0,3).toUpperCase() ?? 'AWY'

  // Derive teamIds — use from team stats if available, else pick first 2 unique from key events
  const derivedTeamIds = useMemo(() => {
    if (homeTeam?.teamId && awayTeam?.teamId) return { home: homeTeam.teamId, away: awayTeam.teamId }
    if (!keyQ.data?.length) return { home: 0, away: 1 }
    const ids = [...new Set(keyQ.data.map(e => e.teamId))]
    return { home: ids[0] ?? 0, away: ids[1] ?? 1 }
  }, [homeTeam, awayTeam, keyQ.data])

  // Build score timeline from pbp-sequence using real period + clock
  const scoreTimeline = useMemo((): ScoreTimelinePoint[] => {
    if (!pbpQ.data?.length) return []
    return pbpQ.data
      .filter(p => p.scoreHome !== '' && p.scoreAway !== '')
      .map(p => ({
        actionNumber: p.actionNumber,
        period:       p.period,
        clock:        p.clock,
        home_score:   Number(p.scoreHome),
        away_score:   Number(p.scoreAway),
      }))
  }, [pbpQ.data])

  if (teamQ.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton height="6rem" className="rounded-2xl" />
        <Skeleton height="16rem" className="rounded-xl" />
      </div>
    )
  }

  if (teamQ.isError) {
    return <ErrorState message={`Failed to load game: ${(teamQ.error as Error)?.message}`} onRetry={() => teamQ.refetch()} />
  }

  return (
    <div className="space-y-4 animate-fade-in">

      {/* ── Game Header ── */}
      {homeTeam && awayTeam && (
        <div className="glass-card p-5">
          <div className="flex items-center justify-between">
            {/* Away */}
            <div className="flex-1 text-center">
              <div className="font-display text-4xl md:text-5xl" style={{ color: teamColor(awayAbbrev) }}>
                {awayAbbrev}
              </div>
              <div className="text-xs text-slate-500 mt-1">{awayTeam.team?.city} {awayTeam.team?.name}</div>
              <Badge label={awayTeam.win ? 'WIN' : 'LOSS'} color={awayTeam.win ? '#22c55e' : '#ef4444'} />
            </div>

            {/* Score */}
            <div className="flex-shrink-0 px-6 text-center">
              <div className="font-display text-5xl md:text-6xl text-white tracking-widest">
                {awayTeam.score?.team_score}
                <span className="text-slate-600 mx-2">–</span>
                {homeTeam.score?.team_score}
              </div>
              <div className="flex gap-3 justify-center mt-2 text-xs text-slate-500">
                {(['q1','q2','q3','q4'] as const).map(q => (
                  <div key={q} className="text-center">
                    <div className="font-mono">{awayTeam.score?.quarters?.[q] ?? '—'}–{homeTeam.score?.quarters?.[q] ?? '—'}</div>
                    <div className="text-slate-700">{q.toUpperCase()}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Home */}
            <div className="flex-1 text-center">
              <div className="font-display text-4xl md:text-5xl" style={{ color: teamColor(homeAbbrev) }}>
                {homeAbbrev}
              </div>
              <div className="text-xs text-slate-500 mt-1">{homeTeam.team?.city} {homeTeam.team?.name}</div>
              <Badge label={homeTeam.win ? 'WIN' : 'LOSS'} color={homeTeam.win ? '#22c55e' : '#ef4444'} />
            </div>
          </div>
        </div>
      )}

      <Tabs tabs={GAME_TABS} active={tab} onChange={setTab} />

      {/* ── Score Timeline ── */}
      {tab === 'scoreline' && (
        <div className="glass-card p-4">
          <h3 className="text-xs uppercase tracking-widest text-slate-500 mb-4">Score Progression</h3>
          {pbpQ.isLoading ? <Skeleton height="260px" /> : scoreTimeline.length > 0 ? (
            <ScoreTimeline data={scoreTimeline} homeTricode={homeAbbrev} awayTricode={awayAbbrev} />
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-600 text-sm">
              {pbpQ.isError ? `PBP error: ${(pbpQ.error as Error)?.message}` : 'Play-by-play parquet data not available'}
            </div>
          )}
        </div>
      )}

      {/* ── Box Score ── */}
      {tab === 'boxscore' && homeTeam && awayTeam && (
        <div className="grid md:grid-cols-2 gap-4">
          {[{ t: homeTeam, abbrev: homeAbbrev, label: 'Home' }, { t: awayTeam, abbrev: awayAbbrev, label: 'Away' }].map(({ t, abbrev, label }) => (
            <div key={abbrev} className="glass-card overflow-hidden">
              <div className="p-3 border-b border-white/6 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: teamColor(abbrev) }} />
                <span className="font-semibold text-sm text-white">{t.team?.city} {t.team?.name}</span>
                <span className="text-slate-600 text-xs ml-auto">{label}</span>
              </div>
              <div className="grid grid-cols-3 gap-0">
                {[
                  { label: 'PTS', value: t.score?.team_score },
                  { label: 'REB', value: t.box?.rebounds?.total },
                  { label: 'AST', value: t.box?.assists },
                  { label: 'STL', value: t.box?.steals },
                  { label: 'BLK', value: t.box?.blocks },
                  { label: 'TOV', value: t.box?.turnovers },
                  { label: 'FG%', value: t.shooting?.fg?.pct  != null ? fmtPct(t.shooting.fg.pct)  : '—' },
                  { label: '3P%', value: t.shooting?.['3p']?.pct != null ? fmtPct(t.shooting['3p'].pct) : '—' },
                  { label: 'FT%', value: t.shooting?.ft?.pct  != null ? fmtPct(t.shooting.ft.pct)  : '—' },
                ].map(stat => (
                  <div key={stat.label} className="p-3 border-b border-r border-white/4 text-center">
                    <div className="text-xl font-bold text-white">{stat.value ?? '—'}</div>
                    <div className="text-xs text-slate-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Players ── */}
      {tab === 'players' && (
        <div className="space-y-4">
          {playerQ.isLoading && <SkeletonTable rows={7} cols={8} />}
          {playerQ.isError && <ErrorState message={`Player stats error: ${(playerQ.error as Error)?.message}`} onRetry={() => playerQ.refetch()} compact />}
          {playerQ.data && [
            { players: playerQ.data.home_players, abbrev: homeAbbrev, label: 'Home' },
            { players: playerQ.data.away_players, abbrev: awayAbbrev, label: 'Away' },
          ].map(({ players, abbrev, label }) => (
            <div key={abbrev} className="glass-card overflow-hidden">
              <div className="p-3 border-b border-white/6 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: teamColor(abbrev) }} />
                <span className="font-semibold text-sm text-white">{abbrev}</span>
                <span className="text-slate-600 text-xs ml-auto">{label}</span>
              </div>
              <SortableTable columns={PLAYER_COLS} data={players as PlayerRow[]} rowKey="person_id" maxHeight="320px" />
            </div>
          ))}
        </div>
      )}

      {/* ── Team Efficiency ── */}
      {tab === 'efficiency' && (
        <div className="glass-card p-4">
          <h3 className="text-xs uppercase tracking-widest text-slate-500 mb-4">Shooting Efficiency Comparison</h3>
          {effQ.isLoading && <Skeleton height="300px" />}
          {effQ.isError && (
            <div className="text-slate-600 text-sm py-8 text-center">
              {`Efficiency error: ${(effQ.error as Error)?.message}`}
            </div>
          )}
          {effQ.data && effQ.data.length > 0 ? (
            <TeamEfficiencyChart data={effQ.data} homeTricode={homeAbbrev} awayTricode={awayAbbrev} />
          ) : effQ.data && (
            <div className="text-slate-600 text-sm py-8 text-center">Efficiency data requires parquet PBP files</div>
          )}
        </div>
      )}

      {/* ── Key Events ── */}
      {tab === 'keyevents' && (
        <div className="glass-card p-4">
          <h3 className="text-xs uppercase tracking-widest text-slate-500 mb-1">Cumulative Key Events Over Game Time</h3>
          <p className="text-xs text-slate-600 mb-4">Assists · Rebounds · Steals · Blocks · Turnovers — accumulated per quarter</p>
          {keyQ.isLoading && <Skeleton height="300px" />}
          {keyQ.isError && (
            <div className="text-slate-600 text-sm py-8 text-center">
              {`Key events error: ${(keyQ.error as Error)?.message}`}
            </div>
          )}
          {keyQ.data && keyQ.data.length > 0 && homeTeam && awayTeam ? (
            <KeyEventsChart
              data={keyQ.data}
              homeTeamId={derivedTeamIds.home}
              awayTeamId={derivedTeamIds.away}
              homeTricode={homeAbbrev}
              awayTricode={awayAbbrev}
            />
          ) : keyQ.data && (
            <div className="text-slate-600 text-sm py-8 text-center">Key events data requires parquet PBP files</div>
          )}
        </div>
      )}

      {/* ── Shot Zones ── */}
      {tab === 'shots' && (
        <div className="glass-card p-4">
          <h3 className="text-xs uppercase tracking-widest text-slate-500 mb-4">Shot Distribution by Area</h3>
          {shotQ.isLoading && <Skeleton height="200px" />}
          {shotQ.isError && <div className="text-slate-600 text-sm py-8 text-center">Shot data requires parquet PBP files</div>}
          {shotQ.data && shotQ.data.length > 0 && (() => {
            const teams = [...new Set(shotQ.data!.map(d => d.playerteamName))]
            return (
              <div className="space-y-6">
                {teams.map(team => {
                  const rows = shotQ.data!.filter(d => d.playerteamName === team)
                  const abbrev = team.length <= 4 ? team : team.slice(0,3).toUpperCase()
                  return (
                    <div key={team}>
                      <h4 className="text-sm font-semibold mb-3" style={{ color: teamColor(abbrev) }}>{team}</h4>
                      <div className="space-y-2">
                        {rows.map(row => {
                          const pct = row.attempts > 0 ? row.makes / row.attempts : 0
                          return (
                            <div key={row.area} className="flex items-center gap-3">
                              <div className="text-xs text-slate-500 w-28 truncate">{row.area}</div>
                              <div className="flex-1 h-4 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full rounded-full" style={{ width: `${Math.round(pct*100)}%`, background: teamColor(abbrev) + 'aa' }} />
                              </div>
                              <div className="text-xs font-mono text-slate-400 w-20 text-right">
                                {row.makes}/{row.attempts} ({Math.round(pct*100)}%)
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          })()}
        </div>
      )}

      {/* ── Scoring Runs ── */}
      {tab === 'runs' && (
        <div className="glass-card p-4">
          <h3 className="text-xs uppercase tracking-widest text-slate-500 mb-4">Scoring Runs (8+ pts)</h3>
          {runsQ.isLoading && <Skeleton height="200px" />}
          {runsQ.isError && <div className="text-slate-600 text-sm py-8 text-center">Scoring runs require parquet PBP files</div>}
          {runsQ.data && runsQ.data.length > 0 && (
            <div className="space-y-2">
              {runsQ.data.map((run, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-white/4 hover:bg-white/6 transition-all">
                  <div className="flex-shrink-0 text-center">
                    <div className="text-xs font-bold" style={{ color: teamColor(run.teamTricode) }}>{run.teamTricode}</div>
                    <div className="text-xs text-slate-600">Q{run.periodStart}</div>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="text-2xl font-display text-white">{run.runPoints}</div>
                    <div className="text-xs text-slate-600">pt run</div>
                  </div>
                  <div className="flex-1 text-xs text-slate-500">
                    {run.scoreBeforeHome}–{run.scoreBeforeAway} → {run.scoreAfterHome}–{run.scoreAfterAway}
                  </div>
                  <div className="text-xs text-slate-600">{run.scoringEvents} events</div>
                </div>
              ))}
            </div>
          )}
          {runsQ.data?.length === 0 && <div className="text-slate-600 text-sm py-8 text-center">No runs of 8+ points found</div>}
        </div>
      )}
    </div>
  )
}
