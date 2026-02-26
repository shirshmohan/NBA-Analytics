import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface TeamLogoDiscProps {
  index: number
  total: number
  performanceMode: boolean
}

const DISC_COLORS = [
  '#552583', // LAL purple
  '#1D428A', // GSW blue
  '#007A33', // BOS green
  '#CE1141', // HOU red
  '#C8102E', // LAC
  '#006BB6', // NYK
]

export default function TeamLogoDisc({ index, total, performanceMode }: TeamLogoDiscProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const innerRef = useRef<THREE.Mesh>(null)

  const { position, speed, rotSpeed, color } = useMemo(() => {
    const angle = (index / total) * Math.PI * 2
    const radius = 8 + (index % 2) * 3
    return {
      position: new THREE.Vector3(
        Math.cos(angle) * radius,
        3 + index * 0.8,
        Math.sin(angle) * radius - 2
      ),
      speed: 0.3 + index * 0.07,
      rotSpeed: 0.2 + index * 0.05,
      color: DISC_COLORS[index % DISC_COLORS.length],
    }
  }, [index, total])

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const t = clock.getElapsedTime()
    meshRef.current.position.y = position.y + Math.sin(t * speed + index) * 0.5
    meshRef.current.rotation.y += rotSpeed * (performanceMode ? 0.3 : 0.5) * 0.016
    meshRef.current.rotation.x = Math.sin(t * 0.3 + index) * 0.15

    if (innerRef.current) {
      innerRef.current.rotation.z -= 0.01
    }
  })

  return (
    <group position={position}>
      <mesh ref={meshRef} castShadow>
        <cylinderGeometry args={[0.8, 0.8, 0.12, 32]} />
        <meshStandardMaterial
          color={color}
          roughness={0.2}
          metalness={0.7}
          emissive={color}
          emissiveIntensity={0.15}
        />
        {/* Rim ring */}
        <mesh position={[0, 0.07, 0]}>
          <torusGeometry args={[0.8, 0.03, 8, 32]} />
          <meshStandardMaterial color="#ffffff" roughness={0.1} metalness={1.0} transparent opacity={0.4} />
        </mesh>
        {/* Inner decoration */}
        <mesh ref={innerRef} position={[0, 0.07, 0]}>
          <ringGeometry args={[0.4, 0.55, 6]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.2} side={THREE.DoubleSide} />
        </mesh>
        {/* Center dot */}
        <mesh position={[0, 0.07, 0]}>
          <circleGeometry args={[0.15, 12]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.5} />
        </mesh>
      </mesh>
      {/* Glow halo */}
      {!performanceMode && (
        <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.8, 1.4, 32]} />
          <meshBasicMaterial color={color} transparent opacity={0.06} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  )
}
