import { useRef, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'
import { useThreeContext } from '@/context/ThreeContext'

export default function PlayerCard3D() {
  const { playerCardRef } = useThreeContext()
  const groupRef = useRef<THREE.Group>(null)
  const cardRef = useRef<THREE.Mesh>(null)
  const [displayData, setDisplayData] = useState({ name: '', season: null as number | null })
  const targetY = useRef(4)
  const floatPhase = useRef(Math.random() * Math.PI * 2)

  useEffect(() => {
    const interval = setInterval(() => {
      const data = playerCardRef.current
      if (data.name !== displayData.name || data.season !== displayData.season) {
        setDisplayData({ name: data.name, season: data.season })
        // Nudge effect
        targetY.current = 5.5
        setTimeout(() => { targetY.current = 4 }, 600)
      }
    }, 100)
    return () => clearInterval(interval)
  }, [displayData, playerCardRef])

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.getElapsedTime()
    const floatY = 4 + Math.sin(t * 0.8 + floatPhase.current) * 0.2
    groupRef.current.position.y += (floatY - groupRef.current.position.y) * 0.05
    groupRef.current.rotation.y = Math.sin(t * 0.4) * 0.15

    if (cardRef.current) {
      const mat = cardRef.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 0.15 + Math.sin(t * 1.5) * 0.05
    }
  })

  if (!displayData.name) return null

  return (
    <group ref={groupRef} position={[9, 4, -2]}>
      {/* Pedestal */}
      <mesh position={[0, -1.8, 0]} castShadow>
        <cylinderGeometry args={[0.6, 0.8, 0.3, 16]} />
        <meshStandardMaterial color="#1e3a5f" roughness={0.3} metalness={0.8} />
      </mesh>
      <mesh position={[0, -1.65, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 3.2, 8]} />
        <meshStandardMaterial color="#2a4a7f" roughness={0.3} metalness={0.9} />
      </mesh>

      {/* Card */}
      <mesh ref={cardRef} castShadow>
        <boxGeometry args={[2.2, 3.0, 0.08]} />
        <meshStandardMaterial
          color="#0c1a2e"
          roughness={0.4}
          metalness={0.5}
          emissive="#f97316"
          emissiveIntensity={0.15}
        />
      </mesh>

      {/* Card border */}
      <mesh>
        <boxGeometry args={[2.24, 3.04, 0.06]} />
        <meshBasicMaterial color="#f97316" transparent opacity={0.4} wireframe={false} />
      </mesh>

      {/* Orange top bar */}
      <mesh position={[0, 1.1, 0.05]}>
        <boxGeometry args={[2.2, 0.4, 0.02]} />
        <meshStandardMaterial color="#f97316" roughness={0.2} metalness={0.3} emissive="#f97316" emissiveIntensity={0.5} />
      </mesh>

      {/* Player name text */}
      <Text
        position={[0, 0.35, 0.06]}
        fontSize={0.22}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        maxWidth={2.0}
        font="https://fonts.gstatic.com/s/bebas_neue/v14/JTUSjIg69CK48gW7PXoo9WdhyyTh89ZNpQ.woff2"
      >
        {displayData.name.toUpperCase()}
      </Text>

      {/* Season text */}
      {displayData.season && (
        <Text
          position={[0, -0.05, 0.06]}
          fontSize={0.16}
          color="#f97316"
          anchorX="center"
          anchorY="middle"
        >
          {`${displayData.season}-${String(displayData.season + 1).slice(-2)} SEASON`}
        </Text>
      )}

      {/* Decorative lines */}
      {[-0.5, -0.7, -0.9].map((y, i) => (
        <mesh key={i} position={[0, y, 0.06]}>
          <planeGeometry args={[1.6 - i * 0.2, 0.015]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.12 - i * 0.03} />
        </mesh>
      ))}

      {/* Glow beneath */}
      <mesh position={[0, -1.65, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2, 32]} />
        <meshBasicMaterial color="#f97316" transparent opacity={0.04} />
      </mesh>
    </group>
  )
}
