import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ThreeShell from '@/three/ThreeShell'
import { useSettings } from '@/context/SettingsContext'

const FEATURED_PLAYERS = ['LeBron James', 'Stephen Curry', 'Giannis Antetokounmpo', 'Luka Doncic', 'Joel Embiid']

const QUICK_STATS = [
  { label: 'Active Players', value: '450+', icon: '👤' },
  { label: 'Seasons Tracked', value: '25+', icon: '📅' },
  { label: 'Games Indexed', value: '30K+', icon: '🏀' },
  { label: 'Data Points', value: '1M+', icon: '📊' },
]

export default function HomePage() {
  const [playerInput, setPlayerInput] = useState('')
  const navigate = useNavigate()
  const { settings } = useSettings()

  function handlePlayerSearch(e: React.FormEvent) {
    e.preventDefault()
    if (playerInput.trim()) {
      navigate(`/players?player=${encodeURIComponent(playerInput.trim())}`)
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* 3D Background */}
        {settings.show3DBackground && (
          <div className="absolute inset-0">
            <ThreeShell />
          </div>
        )}

        {/* Gradient overlay */}
        <div
          className="absolute inset-0 z-10"
          style={{
            background: 'linear-gradient(180deg, rgba(7,15,26,0.4) 0%, rgba(7,15,26,0.6) 60%, rgba(7,15,26,0.95) 100%)',
          }}
        />

        {/* Content */}
        <div className="relative z-20 text-center px-4 max-w-3xl mx-auto">
          <h1 className="font-display text-6xl md:text-8xl text-white tracking-widest mb-4 leading-none">
            HOOPS
            <br />
            <span className="text-orange-500">INTEL</span>
          </h1>
          <p className="text-slate-400 text-lg md:text-xl mb-10 font-light max-w-xl mx-auto">
            Next-generation NBA analytics. Dive deep into player stats, game breakdowns, and historical trends.
          </p>

          {/* Search */}
          <form onSubmit={handlePlayerSearch} className="flex gap-2 max-w-md mx-auto mb-4">
            <input
              value={playerInput}
              onChange={e => setPlayerInput(e.target.value)}
              placeholder="Search a player (e.g. LeBron James)"
              className="input-dark flex-1 text-base py-3"
            />
            <button type="submit" className="btn-primary px-5 py-3 text-base flex-shrink-0">
              Analyze
            </button>
          </form>

          <div className="flex flex-wrap justify-center gap-2">
            {FEATURED_PLAYERS.map(p => (
              <button
                key={p}
                onClick={() => navigate(`/players?player=${encodeURIComponent(p)}`)}
                className="btn-ghost text-xs"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 text-slate-600">
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-slate-600 to-transparent" />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {QUICK_STATS.map(stat => (
            <div key={stat.label} className="glass-card p-5 text-center">
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="stat-value text-3xl text-white mb-1">{stat.value}</div>
              <div className="text-xs text-slate-500 uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Feature cards */}
        <h2 className="font-display text-3xl text-white tracking-widest mb-6">EXPLORE</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            {
              title: 'Player Analytics',
              desc: 'Deep dives into career stats, season progressions, percentile rankings, and accolades.',
              icon: '👤',
              href: '/players',
              color: '#f97316',
            },
            {
              title: 'Game Breakdown',
              desc: 'Play-by-play analysis, score timelines, shot profiles, and full box scores.',
              icon: '🏀',
              href: '/games',
              color: '#06b6d4',
            },
            {
              title: 'Player Compare',
              desc: 'Side-by-side comparison of two players across all stat categories.',
              icon: '⚖️',
              href: '/compare',
              color: '#8b5cf6',
            },
          ].map(card => (
            <button
              key={card.title}
              onClick={() => navigate(card.href)}
              className="glass-card-hover p-6 text-left group"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-4 transition-transform group-hover:scale-110"
                style={{ background: `${card.color}22` }}
              >
                {card.icon}
              </div>
              <h3 className="font-semibold text-white mb-2">{card.title}</h3>
              <p className="text-sm text-slate-500">{card.desc}</p>
              <div className="flex items-center gap-1 mt-4 text-sm" style={{ color: card.color }}>
                Explore →
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
