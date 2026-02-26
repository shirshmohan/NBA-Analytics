import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useSettings } from '@/context/SettingsContext'
import * as THREE from 'three'

// ─── NBA court constants (real proportions, scaled down ~1.9×) ───────────────
const CL = 28.65   // court length
const CW = 15.24   // court width
const Y  = 0.01   // line elevation offset

// ─── Line helpers ─────────────────────────────────────────────────────────────

function Line({ points, color = '#ffffff', opacity = 1 }: {
  points: [number, number, number][]
  color?: string
  opacity?: number
}) {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setFromPoints(points.map(([x, y, z]) => new THREE.Vector3(x, y, z)))
    return g
  }, [points])
  return (
    <line geometry={geo}>
      <lineBasicMaterial color={color} transparent={opacity < 1} opacity={opacity} />
    </line>
  )
}

function Rect({
  x1, z1, x2, z2, color = '#ffffff', opacity = 1
}: { x1: number; z1: number; x2: number; z2: number; color?: string; opacity?: number }) {
  return (
    <>
      <Line points={[[x1, Y, z1], [x2, Y, z1]]} color={color} opacity={opacity} />
      <Line points={[[x2, Y, z1], [x2, Y, z2]]} color={color} opacity={opacity} />
      <Line points={[[x2, Y, z2], [x1, Y, z2]]} color={color} opacity={opacity} />
      <Line points={[[x1, Y, z2], [x1, Y, z1]]} color={color} opacity={opacity} />
    </>
  )
}

function Circle({
  cx, cz, r, segments = 64, startAngle = 0, endAngle = Math.PI * 2,
  color = '#ffffff', opacity = 1
}: {
  cx: number; cz: number; r: number; segments?: number
  startAngle?: number; endAngle?: number; color?: string; opacity?: number
}) {
  const pts = useMemo<[number, number, number][]>(() => {
    const arr: [number, number, number][] = []
    const steps = Math.round(segments * (endAngle - startAngle) / (Math.PI * 2))
    for (let i = 0; i <= steps; i++) {
      const t = startAngle + (i / steps) * (endAngle - startAngle)
      arr.push([cx + Math.cos(t) * r, Y, cz + Math.sin(t) * r])
    }
    return arr
  }, [cx, cz, r, segments, startAngle, endAngle])
  return <Line points={pts} color={color} opacity={opacity} />
}

// ─── Painted key (filled rectangle) ──────────────────────────────────────────
function PaintRect({ z0, direction }: { z0: number; direction: 1 | -1 }) {
  const keyW = 4.88, keyL = 5.8
  const z1 = z0
  const z2 = z0 + direction * keyL
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, (z1 + z2) / 2]} receiveShadow>
      <planeGeometry args={[keyW, keyL]} />
      <meshStandardMaterial color="#1a3a6e" roughness={0.8} transparent opacity={0.85} />
    </mesh>
  )
}

// ─── Full court markings ──────────────────────────────────────────────────────
function CourtMarkings() {
  const keyW = 4.88, keyL = 5.8
  const hCL = CL / 2
  const hCW = CW / 2

  // Three-point arc radius (NBA: 7.24m from basket center)
  const tpR = 7.24
  // Basket is 1.575m from baseline
  const basketZ_neg = -hCL + 1.575
  const basketZ_pos =  hCL - 1.575

  return (
    <group>
      {/* ── Outer boundary ── */}
      <Rect x1={-hCW} z1={-hCL} x2={hCW} z2={hCL} />

      {/* ── Half-court line ── */}
      <Line points={[[-hCW, Y, 0], [hCW, Y, 0]]} />

      {/* ── Center circles ── */}
      <Circle cx={0} cz={0} r={1.8} />
      <Circle cx={0} cz={0} r={0.6} />

      {/* ── Paint / key boxes ── */}
      <PaintRect z0={-hCL} direction={1} />
      <PaintRect z0={hCL}  direction={-1} />

      <Rect x1={-keyW/2} z1={-hCL} x2={keyW/2} z2={-hCL + keyL} />
      <Rect x1={-keyW/2} z1={hCL - keyL} x2={keyW/2} z2={hCL} />

      {/* ── Free throw circles ── */}
      <Circle cx={0} cz={-hCL + keyL} r={1.8} />
      <Circle cx={0} cz={hCL - keyL}  r={1.8} />

      {/* ── Three-point arcs ──
           NBA: corner 3 lines run from baseline, arc connects at 7.24m from basket */}
      {/* Negative Z basket */}
      <Circle cx={0} cz={basketZ_neg} r={tpR}
        startAngle={-Math.PI / 2 + 0.41} endAngle={Math.PI / 2 - 0.41}
        segments={96}
      />
      {/* Corner 3 lines (negative Z) */}
      <Line points={[[-hCW + 0.9, Y, -hCL], [-hCW + 0.9, Y, basketZ_neg + Math.sin(0.41) * tpR + 0.05]]} />
      <Line points={[[ hCW - 0.9, Y, -hCL], [ hCW - 0.9, Y, basketZ_neg + Math.sin(0.41) * tpR + 0.05]]} />

      {/* Positive Z basket */}
      <Circle cx={0} cz={basketZ_pos} r={tpR}
        startAngle={Math.PI / 2 + 0.41} endAngle={Math.PI * 1.5 - 0.41}
        segments={96}
      />
      {/* Corner 3 lines (positive Z) */}
      <Line points={[[-hCW + 0.9, Y, hCL], [-hCW + 0.9, Y, basketZ_pos - Math.sin(0.41) * tpR - 0.05]]} />
      <Line points={[[ hCW - 0.9, Y, hCL], [ hCW - 0.9, Y, basketZ_pos - Math.sin(0.41) * tpR - 0.05]]} />

      {/* ── Restricted area arcs (1.22m from basket) ── */}
      <Circle cx={0} cz={basketZ_neg} r={1.22}
        startAngle={-Math.PI / 2 + 0.4} endAngle={Math.PI / 2 - 0.4} segments={48} />
      <Circle cx={0} cz={basketZ_pos} r={1.22}
        startAngle={Math.PI / 2 + 0.4} endAngle={Math.PI * 1.5 - 0.4} segments={48} />
    </group>
  )
}

// ─── Wood plank floor ─────────────────────────────────────────────────────────
function CourtFloor() {
  return (
    <group>
      {/* Main hardwood floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[CW + 4, CL + 4]} />
        <meshStandardMaterial color="#8B5E3C" roughness={0.85} metalness={0.0} />
      </mesh>

      {/* Playing surface — slightly lighter, glossier */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]} receiveShadow>
        <planeGeometry args={[CW, CL]} />
        <meshStandardMaterial color="#b57a3c" roughness={0.65} metalness={0.05} />
      </mesh>

      {/* Wood plank lines for texture */}
      {Array.from({ length: 30 }, (_, i) => {
        const x = -CW / 2 + (i / 29) * CW
        return (
          <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.004, 0]}>
            <planeGeometry args={[0.012, CL]} />
            <meshBasicMaterial color="#7a4e28" transparent opacity={0.35} />
          </mesh>
        )
      })}
    </group>
  )
}

// ─── Hoop assembly ────────────────────────────────────────────────────────────
function Hoop({ z, direction }: { z: number; direction: 1 | -1 }) {
  const rimZ   = z - direction * 1.575
  const boardZ = z - direction * 1.2
  const poleZ  = z - direction * 0.9

  return (
    <group>
      {/* Support pole */}
      <mesh position={[0, 1.75, poleZ]} castShadow>
        <cylinderGeometry args={[0.07, 0.09, 3.5, 8]} />
        <meshStandardMaterial color="#b0b8c8" roughness={0.3} metalness={0.85} />
      </mesh>

      {/* Horizontal arm */}
      <mesh
        position={[0, 3.35, (poleZ + boardZ) / 2]}
        rotation={[Math.PI / 2, 0, 0]}
        castShadow
      >
        <cylinderGeometry args={[0.04, 0.04, Math.abs(poleZ - boardZ) + 0.3, 8]} />
        <meshStandardMaterial color="#b0b8c8" roughness={0.3} metalness={0.85} />
      </mesh>

      {/* Backboard */}
      <mesh position={[0, 3.35, boardZ]} castShadow>
        <boxGeometry args={[1.83, 1.07, 0.05]} />
        <meshStandardMaterial color="#e8edf5" roughness={0.4} metalness={0.2} transparent opacity={0.92} />
      </mesh>
      {/* Backboard inner square */}
      <mesh position={[0, 3.2, boardZ + 0.03 * direction]}>
        <boxGeometry args={[0.59, 0.45, 0.01]} />
        <meshBasicMaterial color="#f97316" transparent opacity={0.0} />
      </mesh>
      {/* Backboard border */}
      <lineSegments position={[0, 3.35, boardZ + 0.03 * direction]}>
        <edgesGeometry args={[new THREE.BoxGeometry(1.83, 1.07, 0.01)]} />
        <lineBasicMaterial color="#f97316" transparent opacity={0.6} />
      </lineSegments>
      {/* Inner square outline */}
      <lineSegments position={[0, 3.2, boardZ + 0.04 * direction]}>
        <edgesGeometry args={[new THREE.BoxGeometry(0.59, 0.45, 0.01)]} />
        <lineBasicMaterial color="#f97316" transparent opacity={0.9} />
      </lineSegments>

      {/* Rim */}
      <mesh position={[0, 3.05, rimZ]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.23, 0.02, 16, 64]} />
        <meshStandardMaterial color="#f97316" roughness={0.3} metalness={0.7} emissive="#f97316" emissiveIntensity={0.2} />
      </mesh>

      {/* Net (simple cone approximation) */}
      <mesh position={[0, 2.75, rimZ]}>
        <coneGeometry args={[0.21, 0.45, 16, 1, true]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.25} wireframe />
      </mesh>
    </group>
  )
}

// ─── Animated basketball ──────────────────────────────────────────────────────
function Basketball({ performanceMode }: { performanceMode: boolean }) {
  const ballRef = useRef<THREE.Mesh>(null)

  // Shot state machine
  const state = useRef({
    phase: 'idle' as 'idle' | 'rise' | 'arc' | 'fall' | 'bounce',
    t: 0,
    duration: 1.8,
    p0: new THREE.Vector3(2, 0.24, 3),
    p1: new THREE.Vector3(0, 9, 0),     // apex
    p2: new THREE.Vector3(0, 3.05, -CL / 2 + 1.575), // rim
    spinDir: 1,
    targetRim: new THREE.Vector3(0, 3.05, -CL / 2 + 1.575),
    idleTimer: 0,
  })

  const rims = useMemo(() => [
    new THREE.Vector3(0, 3.05, -CL / 2 + 1.575),
    new THREE.Vector3(0, 3.05,  CL / 2 - 1.575),
  ], [])

  function startShot(from: THREE.Vector3, to: THREE.Vector3) {
    const s = state.current
    s.p0 = from.clone()
    s.p2 = to.clone()
    s.p2.y += 0.04
    const mid = from.clone().lerp(to, 0.5)
    const dist = from.distanceTo(to)
    mid.y = Math.max(from.y, to.y) + 4.5 + dist * 0.18
    s.p1 = mid
    s.duration = 0.8 + dist * 0.032
    s.t = 0
    s.spinDir = Math.random() < 0.5 ? 1 : -1
    s.phase = 'arc'
  }

  function bezier3(p0: THREE.Vector3, p1: THREE.Vector3, p2: THREE.Vector3, t: number) {
    const a = p0.clone().multiplyScalar((1 - t) ** 2)
    const b = p1.clone().multiplyScalar(2 * (1 - t) * t)
    const c = p2.clone().multiplyScalar(t * t)
    return a.add(b).add(c)
  }

  useFrame(({ clock }, dt) => {
    if (!ballRef.current) return
    const s = state.current
    const mesh = ballRef.current

    if (s.phase === 'idle') {
      // Gentle idle bob + spin
      mesh.position.x = s.p0.x
      mesh.position.y = s.p0.y + Math.sin(clock.getElapsedTime() * 1.4) * 0.12
      mesh.position.z = s.p0.z
      mesh.rotation.y += dt * 0.7
      s.idleTimer += dt
      if (s.idleTimer > 2.5) {
        s.idleTimer = 0
        // Alternate between both rims
        const rim = rims[Math.floor(Math.random() * 2)]
        startShot(mesh.position.clone(), rim)
      }
    } else if (s.phase === 'arc') {
      s.t += dt / s.duration
      const t = Math.min(s.t, 1)
      const pos = bezier3(s.p0, s.p1, s.p2, t)
      mesh.position.copy(pos)
      mesh.rotation.x += dt * 9
      mesh.rotation.z += dt * 7 * s.spinDir
      if (t >= 1) {
        s.phase = 'bounce'
        s.t = 0
        s.duration = 0.35
        s.p0.copy(mesh.position)
      }
    } else if (s.phase === 'bounce') {
      s.t += dt / s.duration
      const t = Math.min(s.t, 1)
      // drop + small bounce
      mesh.position.y = s.p0.y * (1 - t) + 0.24 * t + Math.sin(t * Math.PI) * 0.6
      mesh.rotation.x += dt * 5
      if (t >= 1) {
        // Reset to random starting position on court
        const startX = (Math.random() - 0.5) * (CW - 3)
        const startZ = (Math.random() - 0.5) * (CL - 4)
        s.p0.set(startX, 0.24, startZ)
        mesh.position.set(startX, 0.24, startZ)
        s.phase = 'idle'
        s.idleTimer = 0
      }
    }
  })

  return (
    <mesh ref={ballRef} position={[2, 0.24, 3]} castShadow>
      <sphereGeometry args={[0.24, performanceMode ? 16 : 32, performanceMode ? 16 : 32]} />
      <meshStandardMaterial color="#d36a2d" roughness={0.72} metalness={0.05} />
    </mesh>
  )
}

// ─── Ball seam lines ──────────────────────────────────────────────────────────
function BallSeams() {
  // Two perpendicular great-circle seams on a unit sphere, rendered as curves
  // (decorative, attached to the ball group in Basketball above —
  //  here we skip for simplicity since THREE lines don't follow mesh rotation;
  //  the plain orange sphere looks great already)
  return null
}

// ─── Ambient glow particles ───────────────────────────────────────────────────
function Particles({ count }: { count: number }) {
  const ref = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const data = useMemo(() => Array.from({ length: count }, () => ({
    x: (Math.random() - 0.5) * (CW + 6),
    y: Math.random() * 7 + 1,
    z: (Math.random() - 0.5) * (CL + 6),
    s: Math.random() * 0.05 + 0.025,
    sp: Math.random() * 0.4 + 0.15,
    ph: Math.random() * Math.PI * 2,
  })), [count])

  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.getElapsedTime()
    data.forEach((p, i) => {
      dummy.position.set(p.x, p.y + Math.sin(t * p.sp + p.ph) * 0.4, p.z)
      dummy.scale.setScalar(p.s)
      dummy.updateMatrix()
      ref.current!.setMatrixAt(i, dummy.matrix)
    })
    ref.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 4, 4]} />
      <meshBasicMaterial color="#f97316" transparent opacity={0.3} />
    </instancedMesh>
  )
}

// ─── Arena walls / bleachers suggestion ──────────────────────────────────────
function ArenaShell() {
  return (
    <group>
      {/* Dark floor surround outside court */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.005, 0]}>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color="#050c18" roughness={1} />
      </mesh>

      {/* Subtle arena rim lights */}
      {[-1, 1].map((side, i) => (
        <pointLight
          key={i}
          position={[side * (CW / 2 + 3), 9, 0]}
          intensity={1.2}
          distance={30}
          color="#f97316"
          decay={2}
        />
      ))}
      {[-1, 1].map((side, i) => (
        <pointLight
          key={i + 2}
          position={[0, 9, side * (CL / 2 + 3)]}
          intensity={0.8}
          distance={28}
          color="#4477ff"
          decay={2}
        />
      ))}
    </group>
  )
}

// ─── Root export ──────────────────────────────────────────────────────────────
export default function ArenaScene() {
  const { settings } = useSettings()
  const particleCount = settings.performanceMode ? 8 : 22

  return (
    <>
      {/* ── Lighting ── */}
      <hemisphereLight color="#ffffff" groundColor="#2a1500" intensity={0.6} />
      <directionalLight
        position={[12, 22, 10]}
        intensity={1.2}
        castShadow={!settings.performanceMode}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.5}
        shadow-camera-far={80}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
        color="#fff8ee"
      />
      {/* Overhead spotlights — arena feeling */}
      <pointLight position={[0, 18, 0]}  intensity={1.5} color="#fffaf0" distance={50} decay={1.5} />
      <pointLight position={[0, 16, -CL / 4]} intensity={0.9} color="#fff5e0" distance={30} decay={2} />
      <pointLight position={[0, 16,  CL / 4]} intensity={0.9} color="#fff5e0" distance={30} decay={2} />

      {/* Fog */}
      <fog attach="fog" args={['#080f1e', 30, 80]} />

      <ArenaShell />
      <CourtFloor />
      <CourtMarkings />

      {/* Both hoops */}
      <Hoop z={-CL / 2} direction={-1} />
      <Hoop z={ CL / 2} direction={ 1} />

      {/* Animated ball */}
      <Basketball performanceMode={settings.performanceMode} />

      {/* Ambient particles */}
      <Particles count={particleCount} />
    </>
  )
}
