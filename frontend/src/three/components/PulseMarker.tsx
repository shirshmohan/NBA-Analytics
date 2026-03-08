import { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useThreeContext } from '@/context/ThreeContext'

export default function PulseMarker() {
  const { pulseRef } = useThreeContext()
  const ringRef = useRef<THREE.Mesh>(null)
  const ring2Ref = useRef<THREE.Mesh>(null)
  const dotRef = useRef<THREE.Mesh>(null)
  const [active, setActive] = useState(false)
  const [pos, setPos] = useState<[number, number, number]>([0, 0.05, 0])
  const startTime = useRef(0)

  useEffect(() => {
    const interval = setInterval(() => {
      if (pulseRef.current.active && !active) {
        // Convert court coords (nba api units) to three.js units
        const x = (pulseRef.current.x / 250) * 14
        const z = (pulseRef.current.y / 250) * 12 - 5
        setPos([x, 0.05, z])
        setActive(true)
        startTime.current = Date.now()
      }
    }, 50)
    return () => clearInterval(interval)
  }, [active, pulseRef])

  useFrame(() => {
    if (!active) return
    const elapsed = (Date.now() - startTime.current) / 1000
    if (elapsed > 2) {
      setActive(false)
      return
    }

    const t = elapsed / 2
    const scale = 1 + t * 4
    const opacity = 1 - t

    if (ringRef.current) {
      ringRef.current.scale.setScalar(scale)
      ;(ringRef.current.material as THREE.MeshBasicMaterial).opacity = opacity * 0.7
    }
    if (ring2Ref.current) {
      const scale2 = 1 + ((t + 0.3) % 1) * 4
      ring2Ref.current.scale.setScalar(scale2)
      ;(ring2Ref.current.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 1 - ((t + 0.3) % 1)) * 0.5
    }
    if (dotRef.current) {
      ;(dotRef.current.material as THREE.MeshBasicMaterial).opacity = opacity
    }
  })

  if (!active) return null

  return (
    <group position={pos}>
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.15, 0.25, 32]} />
        <meshBasicMaterial color="#f97316" transparent opacity={0.8} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={ring2Ref} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.15, 0.25, 32]} />
        <meshBasicMaterial color="#f97316" transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={dotRef} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.12, 16]} />
        <meshBasicMaterial color="#f97316" transparent opacity={1} />
      </mesh>
    </group>
  )
}
