import React, { createContext, useContext, useRef, useCallback } from 'react'

export interface PulseMarkerState {
  x: number
  y: number
  startedAt: number // ms
}

export interface PlayerCardData {
  name: string
  season: number | null
}

interface ThreeContextValue {
  triggerPulse: (x?: number, y?: number) => void
  nudgeCamera: () => void
  updatePlayerCard: (data: PlayerCardData) => void

  pulseRef: React.MutableRefObject<PulseMarkerState | null>
  playerCardRef: React.MutableRefObject<PlayerCardData>
  cameraNudgeRef: React.MutableRefObject<number> // ms
}

const ThreeContext = createContext<ThreeContextValue | null>(null)

export function ThreeProvider({ children }: { children: React.ReactNode }) {
  const pulseRef = useRef<PulseMarkerState | null>(null)
  const playerCardRef = useRef<PlayerCardData>({ name: '', season: null })
  const cameraNudgeRef = useRef<number>(0)

  const triggerPulse = useCallback((x = 0, y = 0) => {
    pulseRef.current = { x, y, startedAt: Date.now() }
  }, [])

  const nudgeCamera = useCallback(() => {
    cameraNudgeRef.current = Date.now()
  }, [])

  const updatePlayerCard = useCallback((data: PlayerCardData) => {
    playerCardRef.current = data
  }, [])

  return (
    <ThreeContext.Provider
      value={{ triggerPulse, nudgeCamera, updatePlayerCard, pulseRef, playerCardRef, cameraNudgeRef }}
    >
      {children}
    </ThreeContext.Provider>
  )
}

export function useThreeContext() {
  const ctx = useContext(ThreeContext)
  if (!ctx) throw new Error('useThreeContext must be used within ThreeProvider')
  return ctx
}