import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import SettingsDrawer from './SettingsDrawer'
import GlobalSearch from './GlobalSearch'

const NAV_LINKS = [
  { to: '/', label: 'Home', icon: '🏠' },
  { to: '/players', label: 'Players', icon: '👤' },
  { to: '/games', label: 'Games', icon: '🏀' },
  { to: '/compare', label: 'Compare', icon: '⚖️' },
  { to: '/agent',   label: 'Agent',   icon: '🤖' },
]

export default function Navbar() {
  const location = useLocation()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center px-4 md:px-8 gap-6"
        style={{ background: 'rgba(7,15,26,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}>
            <span className="text-white font-black text-sm">N</span>
          </div>
          <span className="font-display text-white tracking-widest text-lg hidden sm:block">HOOPS</span>
          <span className="hidden sm:block text-orange-500 font-display tracking-widest text-lg">INTEL</span>
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`nav-link ${location.pathname === link.to ? 'active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Search */}
        <button
          onClick={() => setSearchOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-slate-400 border border-white/10 hover:border-orange-500/30 transition-all"
          style={{ background: 'rgba(255,255,255,0.04)' }}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="hidden sm:block">Search...</span>
          <span className="hidden sm:block text-xs text-slate-600">⌘K</span>
        </button>

        {/* Settings */}
        <button
          onClick={() => setSettingsOpen(true)}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white border border-white/10 hover:border-white/20 transition-all"
          style={{ background: 'rgba(255,255,255,0.04)' }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>

        {/* Mobile menu */}
        <div className="md:hidden flex gap-1">
          {NAV_LINKS.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`p-2 rounded text-lg ${location.pathname === link.to ? 'text-orange-500' : 'text-slate-500'}`}
              title={link.label}
            >
              {link.icon}
            </Link>
          ))}
        </div>
      </nav>

      <SettingsDrawer open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      {searchOpen && <GlobalSearch onClose={() => setSearchOpen(false)} />}
    </>
  )
}
