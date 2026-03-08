import { useState, useRef, useEffect } from 'react'
import {
  LineChart, Line, BarChart, Bar, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts'

// ── Types ────────────────────────────────────────────────────────────────────

interface ChartSpec {
  type: 'bar' | 'line' | 'radar'
  title: string
  data: Record<string, string | number>[]
  keys: string[]
  xKey: string
}

interface ToolCall {
  tool: string
  args: Record<string, unknown>
  success?: boolean
}

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  chart?: ChartSpec
  toolCalls?: ToolCall[]
  isStreaming?: boolean
}

// ── Tool display helpers ─────────────────────────────────────────────────────

const TOOL_LABELS: Record<string, string> = {
  search_players:       'Searching players',
  get_player_dashboard: 'Loading player dashboard',
  get_player_accolades: 'Fetching accolades',
  get_season_percentiles: 'Computing percentiles',
  get_season_ranks:     'Fetching season rankings',
  search_games:         'Searching games',
  get_game_team_stats:  'Loading team box score',
  get_game_player_stats:'Loading player stats',
  get_pbp_sequence:     'Reading play-by-play',
  get_shot_distribution:'Analyzing shot distribution',
  get_team_efficiency:  'Computing team efficiency',
  get_key_events:       'Fetching key events',
  get_scoring_runs:     'Finding scoring runs',
}

const TOOL_ICONS: Record<string, string> = {
  search_players:       '🔍',
  get_player_dashboard: '👤',
  get_player_accolades: '🏆',
  get_season_percentiles:'📊',
  get_season_ranks:     '🏅',
  search_games:         '🔍',
  get_game_team_stats:  '📋',
  get_game_player_stats:'👥',
  get_pbp_sequence:     '⏱️',
  get_shot_distribution:'🎯',
  get_team_efficiency:  '📈',
  get_key_events:       '⚡',
  get_scoring_runs:     '🔥',
}

const CHART_COLORS = ['#f97316', '#06b6d4', '#8b5cf6', '#22c55e', '#eab308', '#ec4899']

// ── Parse chart from message content ─────────────────────────────────────────

function parseChart(content: string): { text: string; chart: ChartSpec | null } {
  const match = content.match(/<chart>([\s\S]*?)<\/chart>/)
  if (!match) return { text: content, chart: null }
  try {
    const chart = JSON.parse(match[1]) as ChartSpec
    const text = content.replace(/<chart>[\s\S]*?<\/chart>/, '').trim()
    return { text, chart }
  } catch {
    return { text: content, chart: null }
  }
}

// ── Chart renderer ───────────────────────────────────────────────────────────

function InlineChart({ spec }: { spec: ChartSpec }) {
  const { type, title, data, keys, xKey } = spec

  return (
    <div className="mt-4 rounded-xl overflow-hidden" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="px-4 pt-3 pb-1">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{title}</div>
      </div>
      <div className="p-3">
        <ResponsiveContainer width="100%" height={220}>
          {type === 'line' ? (
            <LineChart data={data} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey={xKey} stroke="#334155" tick={{ fill: '#475569', fontSize: 10 }} />
              <YAxis stroke="#334155" tick={{ fill: '#475569', fontSize: 10 }} />
              <Tooltip contentStyle={{ background: '#0c1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 11 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {keys.map((k, i) => (
                <Line key={k} type="monotone" dataKey={k} stroke={CHART_COLORS[i % CHART_COLORS.length]}
                  strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              ))}
            </LineChart>
          ) : type === 'radar' ? (
            <RadarChart data={data}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey={xKey} tick={{ fill: '#475569', fontSize: 10 }} />
              {keys.map((k, i) => (
                <Radar key={k} name={k} dataKey={k} stroke={CHART_COLORS[i % CHART_COLORS.length]}
                  fill={CHART_COLORS[i % CHART_COLORS.length]} fillOpacity={0.15} />
              ))}
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#0c1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 11 }} />
            </RadarChart>
          ) : (
            <BarChart data={data} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey={xKey} stroke="#334155" tick={{ fill: '#475569', fontSize: 10 }} />
              <YAxis stroke="#334155" tick={{ fill: '#475569', fontSize: 10 }} />
              <Tooltip contentStyle={{ background: '#0c1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 11 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {keys.map((k, i) => (
                <Bar key={k} dataKey={k} radius={[4, 4, 0, 0]}>
                  {data.map((_, ci) => (
                    <Cell key={ci} fill={CHART_COLORS[(i + ci) % CHART_COLORS.length]} fillOpacity={0.85} />
                  ))}
                </Bar>
              ))}
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// ── Message renderer ─────────────────────────────────────────────────────────

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === 'user'
  const { text, chart } = parseChart(msg.content)

  // Simple markdown: **bold**, `code`, newlines
  function renderText(t: string) {
    return t.split('\n').map((line, i) => {
      const parts = line.split(/(\*\*.*?\*\*|`.*?`)/g).map((p, j) => {
        if (p.startsWith('**') && p.endsWith('**'))
          return <strong key={j} className="text-white font-semibold">{p.slice(2, -2)}</strong>
        if (p.startsWith('`') && p.endsWith('`'))
          return <code key={j} className="text-orange-300 font-mono text-xs bg-orange-500/10 px-1 rounded">{p.slice(1, -1)}</code>
        return p
      })
      return <span key={i}>{parts}{i < t.split('\n').length - 1 && <br />}</span>
    })
  }

  if (isUser) {
    return (
      <div className="flex justify-end mb-4">
        <div className="max-w-lg px-4 py-3 rounded-2xl rounded-tr-sm text-sm text-white"
          style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}>
          {msg.content}
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-3 mb-6">
      {/* Avatar */}
      <div className="w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center text-base"
        style={{ background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.2)' }}>
        🏀
      </div>

      <div className="flex-1 min-w-0">
        {/* Tool calls */}
        {msg.toolCalls && msg.toolCalls.length > 0 && (
          <div className="mb-3 space-y-1">
            {msg.toolCalls.map((tc, i) => (
              <div key={i} className="flex items-center gap-2 text-xs"
                style={{ color: tc.success === false ? '#ef4444' : tc.success ? '#22c55e' : '#64748b' }}>
                <span>{TOOL_ICONS[tc.tool] ?? '🔧'}</span>
                <span>{TOOL_LABELS[tc.tool] ?? tc.tool}</span>
                {tc.args.player_name && <span className="text-slate-600">· {String(tc.args.player_name)}</span>}
                {tc.args.team1 && <span className="text-slate-600">· {String(tc.args.team1)}</span>}
                {tc.success === true  && <span className="text-green-500 ml-auto">✓</span>}
                {tc.success === false && <span className="text-red-500 ml-auto">✗</span>}
                {tc.success === undefined && (
                  <span className="ml-auto">
                    <span className="inline-block w-3 h-3 border border-slate-500 border-t-transparent rounded-full animate-spin" />
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Content */}
        {msg.isStreaming && !text ? (
          <div className="flex gap-1 items-center h-6">
            {[0,1,2].map(i => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        ) : text ? (
          <div className="text-sm text-slate-200 leading-relaxed">{renderText(text)}</div>
        ) : null}

        {/* Inline chart */}
        {chart && <InlineChart spec={chart} />}
      </div>
    </div>
  )
}

// ── Suggested prompts ────────────────────────────────────────────────────────

const SUGGESTIONS = [
  "How has Stephen Curry's PPG trended over his career?",
  "Compare LeBron James and Kevin Durant career stats",
  "Find Warriors vs Celtics playoff games",
  "Who had the best shooting efficiency last season?",
  "Show me Nikola Jokic's accolades and peak season",
]

// ── Main Agent Page ──────────────────────────────────────────────────────────

const BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL ?? 'http://localhost:8000'

export default function AgentPage() {
  const [messages, setMessages]   = useState<ChatMessage[]>([])
  const [input, setInput]         = useState('')
  const [loading, setLoading]     = useState(false)
  const bottomRef                 = useRef<HTMLDivElement>(null)
  const inputRef                  = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return
    setInput('')
    setLoading(true)

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: text }
    const assistantId = (Date.now() + 1).toString()
    const assistantMsg: ChatMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      toolCalls: [],
      isStreaming: true,
    }

    setMessages(prev => [...prev, userMsg, assistantMsg])

    // Build conversation history for the API
    const history = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }))

    try {
      const resp = await fetch(`${BASE_URL}/agent/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      })

      if (!resp.ok) throw new Error(`HTTP ${resp.status}`)

      const reader = resp.body!.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })

        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const event = JSON.parse(line.slice(6))

            setMessages(prev => prev.map(m => {
              if (m.id !== assistantId) return m

              if (event.type === 'tool_call') {
                return { ...m, toolCalls: [...(m.toolCalls ?? []), { tool: event.tool, args: event.args }] }
              }

              if (event.type === 'tool_result') {
                const updated = (m.toolCalls ?? []).map(tc =>
                  tc.tool === event.tool && tc.success === undefined
                    ? { ...tc, success: event.success }
                    : tc
                )
                return { ...m, toolCalls: updated }
              }

              if (event.type === 'answer') {
                return { ...m, content: event.content, isStreaming: false }
              }

              if (event.type === 'error') {
                return { ...m, content: `⚠️ ${event.content}`, isStreaming: false }
              }

              return m
            }))
          } catch {}
        }
      }
    } catch (e) {
      setMessages(prev => prev.map(m =>
        m.id === assistantId
          ? { ...m, content: `⚠️ Failed to reach agent: ${(e as Error).message}`, isStreaming: false }
          : m
      ))
    } finally {
      setLoading(false)
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const isEmpty = messages.length === 0

  return (
    <div className="min-h-screen pt-14 flex flex-col" style={{ background: 'transparent' }}>

      {/* Header */}
      <div className="border-b border-white/6 py-4 px-4 md:px-8 flex-shrink-0"
        style={{ background: 'rgba(7,15,26,0.9)', backdropFilter: 'blur(10px)' }}>
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <span className="text-2xl">🤖</span>
          <div>
            <h1 className="font-display text-2xl text-white tracking-widest">NBA AGENT</h1>
            <p className="text-xs text-slate-500">Ask anything — powered by GPT-4o mini + live data</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-green-500">Live</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
        <div className="max-w-3xl mx-auto">

          {/* Empty state */}
          {isEmpty && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="text-6xl mb-6 opacity-60">🏀</div>
              <h2 className="font-display text-3xl text-white tracking-widest mb-2">WHAT DO YOU WANT TO KNOW?</h2>
              <p className="text-slate-500 text-sm mb-10 max-w-md">
                Ask about players, games, stats, comparisons — the agent fetches real data and visualizes it for you.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-xl">
                {SUGGESTIONS.map(s => (
                  <button key={s} onClick={() => sendMessage(s)}
                    className="text-left text-xs px-4 py-3 rounded-xl text-slate-400 hover:text-white transition-all hover:border-orange-500/30"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message list */}
          {messages.map(msg => <MessageBubble key={msg.id} msg={msg} />)}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div className="flex-shrink-0 border-t border-white/6 px-4 md:px-8 py-4"
        style={{ background: 'rgba(7,15,26,0.95)', backdropFilter: 'blur(10px)' }}>
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-3 items-end rounded-2xl p-2"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask about players, games, stats..."
              rows={1}
              disabled={loading}
              className="flex-1 bg-transparent text-white text-sm outline-none resize-none placeholder-slate-600 px-2 py-1.5 max-h-32"
              style={{ lineHeight: '1.5' }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={loading || !input.trim()}
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
              style={{
                background: loading || !input.trim() ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg,#f97316,#ea580c)',
                color: loading || !input.trim() ? '#475569' : '#fff',
              }}>
              {loading ? (
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              )}
            </button>
          </div>
          <p className="text-xs text-slate-700 text-center mt-2">Enter to send · Shift+Enter for new line</p>
        </div>
      </div>
    </div>
  )
}
