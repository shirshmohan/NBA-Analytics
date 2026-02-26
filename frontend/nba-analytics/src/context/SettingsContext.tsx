import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { AppSettings } from '@/types'

interface SettingsContextValue {
  settings: AppSettings
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void
  toggleSetting: (key: keyof Pick<AppSettings, 'darkMode' | 'performanceMode' | 'show3DBackground' | 'useMockData'>) => void
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

const DEFAULT_SETTINGS: AppSettings = {
  darkMode: true,
  performanceMode: false,
  show3DBackground: true,
  useMockData: import.meta.env.VITE_USE_MOCKS === 'true',
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const stored = localStorage.getItem('nba-settings')
      if (stored) return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) }
    } catch {}
    return DEFAULT_SETTINGS
  })

  useEffect(() => {
    localStorage.setItem('nba-settings', JSON.stringify(settings))

    // dark mode
    const root = document.documentElement
    if (settings.darkMode) root.classList.add('dark')
    else root.classList.remove('dark')

    // better built-in rendering (scrollbars, form controls)
    root.style.colorScheme = settings.darkMode ? 'dark' : 'light'
  }, [settings])

  const updateSetting = useCallback(<K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }, [])

  const toggleSetting = useCallback((key: keyof SettingsContextValue['settings']) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] } as AppSettings))
  }, [])

  return (
    <SettingsContext.Provider value={{ settings, updateSetting, toggleSetting }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider')
  return ctx
}