import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { Suspense, useRef } from 'react'
import ArenaScene from './scenes/ArenaScene'
import { useSettings } from '@/context/SettingsContext'
import type { OrbitControls as OrbitControlsType } from 'three-stdlib'

interface ThreeShellProps {
  className?: string
}

export default function ThreeShell({ className = '' }: ThreeShellProps) {
  const { settings } = useSettings()
  const controlsRef = useRef<OrbitControlsType>(null)

  if (!settings.show3DBackground) {
    return null
  }

  return (
    <div className={`w-full h-full ${className}`} style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
      <Canvas
        shadows={!settings.performanceMode}
        dpr={settings.performanceMode ? 1 : [1, 1.5]}
        gl={{ antialias: !settings.performanceMode, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <PerspectiveCamera makeDefault position={[0, 22, 32]} fov={52} near={0.1} far={200} />
        <OrbitControls
          ref={controlsRef}
          target={[0, 0, 0]}
          enablePan={false}
          enableZoom={true}
          enableRotate={true}
          minDistance={18}
          maxDistance={55}
          minPolarAngle={Math.PI / 8}
          maxPolarAngle={Math.PI / 2.4}
          minAzimuthAngle={-Math.PI / 3}
          maxAzimuthAngle={Math.PI / 3}
          autoRotate={!settings.performanceMode}
          autoRotateSpeed={0.25}
        />
        <Suspense fallback={null}>
          <ArenaScene />
        </Suspense>
      </Canvas>
    </div>
  )
}
