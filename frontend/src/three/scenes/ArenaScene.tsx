import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useSettings } from '@/context/SettingsContext'
import * as THREE from 'three'

// ─── Court constants ──────────────────────────────────────────────────────────
const CL = 28.65
const CW = 15.24
const Y  = 0.01

// ═════════════════════════════════════════════════════════════════════════════
// V2 COURT — every line exactly as original
// ═════════════════════════════════════════════════════════════════════════════

function Line({ points, color = '#ffffff', opacity = 1 }: {
  points: [number, number, number][]
  color?: string; opacity?: number
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

function Rect({ x1, z1, x2, z2, color='#ffffff', opacity=1 }:
  { x1:number; z1:number; x2:number; z2:number; color?:string; opacity?:number }) {
  return (
    <>
      <Line points={[[x1,Y,z1],[x2,Y,z1]]} color={color} opacity={opacity} />
      <Line points={[[x2,Y,z1],[x2,Y,z2]]} color={color} opacity={opacity} />
      <Line points={[[x2,Y,z2],[x1,Y,z2]]} color={color} opacity={opacity} />
      <Line points={[[x1,Y,z2],[x1,Y,z1]]} color={color} opacity={opacity} />
    </>
  )
}

function Circle({ cx, cz, r, segments=64, startAngle=0, endAngle=Math.PI*2, color='#ffffff', opacity=1 }:
  { cx:number; cz:number; r:number; segments?:number; startAngle?:number; endAngle?:number; color?:string; opacity?:number }) {
  const pts = useMemo<[number,number,number][]>(() => {
    const arr:[number,number,number][] = []
    const steps = Math.round(segments*(endAngle-startAngle)/(Math.PI*2))
    for (let i=0; i<=steps; i++) {
      const t = startAngle+(i/steps)*(endAngle-startAngle)
      arr.push([cx+Math.cos(t)*r, Y, cz+Math.sin(t)*r])
    }
    return arr
  }, [cx,cz,r,segments,startAngle,endAngle])
  return <Line points={pts} color={color} opacity={opacity} />
}

function PaintRect({ z0, direction }: { z0:number; direction:1|-1 }) {
  const keyW=4.88, keyL=5.8
  const z2 = z0+direction*keyL
  return (
    <mesh rotation={[-Math.PI/2,0,0]} position={[0,0.005,(z0+z2)/2]} receiveShadow>
      <planeGeometry args={[keyW,keyL]} />
      <meshStandardMaterial color="#1a3a6e" roughness={0.8} transparent opacity={0.85} />
    </mesh>
  )
}

function CourtMarkings() {
  const keyW=4.88, keyL=5.8, hCL=CL/2, hCW=CW/2
  const tpR=7.24
  const bN=-hCL+1.575, bP=hCL-1.575
  return (
    <group>
      <Rect x1={-hCW} z1={-hCL} x2={hCW} z2={hCL} />
      <Line points={[[-hCW,Y,0],[hCW,Y,0]]} />
      <Circle cx={0} cz={0} r={1.8} /><Circle cx={0} cz={0} r={0.6} />
      <PaintRect z0={-hCL} direction={1} /><PaintRect z0={hCL} direction={-1} />
      <Rect x1={-keyW/2} z1={-hCL}      x2={keyW/2} z2={-hCL+keyL} />
      <Rect x1={-keyW/2} z1={hCL-keyL}  x2={keyW/2} z2={hCL} />
      <Circle cx={0} cz={-hCL+keyL} r={1.8} />
      <Circle cx={0} cz={ hCL-keyL} r={1.8} />
      <Circle cx={0} cz={bN} r={tpR} startAngle={-Math.PI/2+0.41} endAngle={Math.PI/2-0.41} segments={96} />
      <Line points={[[-hCW+0.9,Y,-hCL],[-hCW+0.9,Y,bN+Math.sin(0.41)*tpR+0.05]]} />
      <Line points={[[ hCW-0.9,Y,-hCL],[ hCW-0.9,Y,bN+Math.sin(0.41)*tpR+0.05]]} />
      <Circle cx={0} cz={bP} r={tpR} startAngle={Math.PI/2+0.41} endAngle={Math.PI*1.5-0.41} segments={96} />
      <Line points={[[-hCW+0.9,Y,hCL],[-hCW+0.9,Y,bP-Math.sin(0.41)*tpR-0.05]]} />
      <Line points={[[ hCW-0.9,Y,hCL],[ hCW-0.9,Y,bP-Math.sin(0.41)*tpR-0.05]]} />
      <Circle cx={0} cz={bN} r={1.22} startAngle={-Math.PI/2+0.4} endAngle={Math.PI/2-0.4} segments={48} />
      <Circle cx={0} cz={bP} r={1.22} startAngle={Math.PI/2+0.4} endAngle={Math.PI*1.5-0.4} segments={48} />
    </group>
  )
}

function CourtFloor() {
  return (
    <group>
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,0,0]} receiveShadow>
        <planeGeometry args={[CW+4,CL+4]} />
        <meshStandardMaterial color="#8B5E3C" roughness={0.85} metalness={0.0} />
      </mesh>
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,0.002,0]} receiveShadow>
        <planeGeometry args={[CW,CL]} />
        <meshStandardMaterial color="#b57a3c" roughness={0.65} metalness={0.05} />
      </mesh>
      {Array.from({ length:30 }, (_,i) => {
        const x=-CW/2+(i/29)*CW
        return (
          <mesh key={i} rotation={[-Math.PI/2,0,0]} position={[x,0.004,0]}>
            <planeGeometry args={[0.012,CL]} />
            <meshBasicMaterial color="#7a4e28" transparent opacity={0.35} />
          </mesh>
        )
      })}
    </group>
  )
}

function Hoop({ z, direction }: { z:number; direction:1|-1 }) {
  const rimZ=z-direction*1.575, boardZ=z-direction*1.2, poleZ=z-direction*0.9
  return (
    <group>
      <mesh position={[0,1.75,poleZ]} castShadow>
        <cylinderGeometry args={[0.07,0.09,3.5,8]} />
        <meshStandardMaterial color="#b0b8c8" roughness={0.3} metalness={0.85} />
      </mesh>
      <mesh position={[0,3.35,(poleZ+boardZ)/2]} rotation={[Math.PI/2,0,0]} castShadow>
        <cylinderGeometry args={[0.04,0.04,Math.abs(poleZ-boardZ)+0.3,8]} />
        <meshStandardMaterial color="#b0b8c8" roughness={0.3} metalness={0.85} />
      </mesh>
      <mesh position={[0,3.35,boardZ]} castShadow>
        <boxGeometry args={[1.83,1.07,0.05]} />
        <meshStandardMaterial color="#e8edf5" roughness={0.4} metalness={0.2} transparent opacity={0.92} />
      </mesh>
      <lineSegments position={[0,3.35,boardZ+0.03*direction]}>
        <edgesGeometry args={[new THREE.BoxGeometry(1.83,1.07,0.01)]} />
        <lineBasicMaterial color="#f97316" transparent opacity={0.6} />
      </lineSegments>
      <lineSegments position={[0,3.2,boardZ+0.04*direction]}>
        <edgesGeometry args={[new THREE.BoxGeometry(0.59,0.45,0.01)]} />
        <lineBasicMaterial color="#f97316" transparent opacity={0.9} />
      </lineSegments>
      <mesh position={[0,3.05,rimZ]} rotation={[Math.PI/2,0,0]} castShadow>
        <torusGeometry args={[0.23,0.02,16,64]} />
        <meshStandardMaterial color="#f97316" roughness={0.3} metalness={0.7} emissive="#f97316" emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[0,2.75,rimZ]}>
        <coneGeometry args={[0.21,0.45,16,1,true]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.25} wireframe />
      </mesh>
    </group>
  )
}

function Basketball({ performanceMode }: { performanceMode:boolean }) {
  const ballRef = useRef<THREE.Mesh>(null)
  const state = useRef({
    phase:'idle' as 'idle'|'arc'|'bounce',
    t:0, duration:1.8,
    p0:new THREE.Vector3(2,0.24,3),
    p1:new THREE.Vector3(0,9,0),
    p2:new THREE.Vector3(0,3.05,-CL/2+1.575),
    spinDir:1, idleTimer:0,
  })
  const rims = useMemo(() => [
    new THREE.Vector3(0,3.05,-CL/2+1.575),
    new THREE.Vector3(0,3.05, CL/2-1.575),
  ], [])
  function startShot(from:THREE.Vector3, to:THREE.Vector3) {
    const s=state.current
    s.p0=from.clone(); s.p2=to.clone(); s.p2.y+=0.04
    const mid=from.clone().lerp(to,0.5)
    mid.y=Math.max(from.y,to.y)+4.5+from.distanceTo(to)*0.18
    s.p1=mid; s.duration=0.8+from.distanceTo(to)*0.032
    s.t=0; s.spinDir=Math.random()<0.5?1:-1; s.phase='arc'
  }
  function bezier3(p0:THREE.Vector3,p1:THREE.Vector3,p2:THREE.Vector3,t:number) {
    return p0.clone().multiplyScalar((1-t)**2)
      .add(p1.clone().multiplyScalar(2*(1-t)*t))
      .add(p2.clone().multiplyScalar(t*t))
  }
  useFrame(({clock},dt) => {
    if (!ballRef.current) return
    const s=state.current, m=ballRef.current
    if (s.phase==='idle') {
      m.position.x=s.p0.x; m.position.y=s.p0.y+Math.sin(clock.getElapsedTime()*1.4)*0.12; m.position.z=s.p0.z
      m.rotation.y+=dt*0.7; s.idleTimer+=dt
      if (s.idleTimer>2.5) { s.idleTimer=0; startShot(m.position.clone(),rims[Math.floor(Math.random()*2)]) }
    } else if (s.phase==='arc') {
      s.t+=dt/s.duration; const t=Math.min(s.t,1)
      m.position.copy(bezier3(s.p0,s.p1,s.p2,t))
      m.rotation.x+=dt*9; m.rotation.z+=dt*7*s.spinDir
      if (t>=1) { s.phase='bounce'; s.t=0; s.duration=0.35; s.p0.copy(m.position) }
    } else {
      s.t+=dt/s.duration; const t=Math.min(s.t,1)
      m.position.y=s.p0.y*(1-t)+0.24*t+Math.sin(t*Math.PI)*0.6; m.rotation.x+=dt*5
      if (t>=1) {
        const sx=(Math.random()-0.5)*(CW-3), sz=(Math.random()-0.5)*(CL-4)
        s.p0.set(sx,0.24,sz); m.position.set(sx,0.24,sz); s.phase='idle'; s.idleTimer=0
      }
    }
  })
  return (
    <mesh ref={ballRef} position={[2,0.24,3]} castShadow>
      <sphereGeometry args={[0.24,performanceMode?16:32,performanceMode?16:32]} />
      <meshStandardMaterial color="#d36a2d" roughness={0.72} metalness={0.05} />
    </mesh>
  )
}

function Particles({ count }: { count:number }) {
  const ref = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const data = useMemo(() => Array.from({ length:count }, () => ({
    x:(Math.random()-0.5)*(CW+6), y:Math.random()*7+1, z:(Math.random()-0.5)*(CL+6),
    s:Math.random()*0.05+0.025, sp:Math.random()*0.4+0.15, ph:Math.random()*Math.PI*2,
  })), [count])
  useFrame(({clock}) => {
    if (!ref.current) return
    const t=clock.getElapsedTime()
    data.forEach((p,i) => {
      dummy.position.set(p.x,p.y+Math.sin(t*p.sp+p.ph)*0.4,p.z)
      dummy.scale.setScalar(p.s); dummy.updateMatrix()
      ref.current!.setMatrixAt(i,dummy.matrix)
    })
    ref.current.instanceMatrix.needsUpdate=true
  })
  return (
    <instancedMesh ref={ref} args={[undefined,undefined,count]}>
      <sphereGeometry args={[1,4,4]} />
      <meshBasicMaterial color="#f97316" transparent opacity={0.3} />
    </instancedMesh>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
// ATMOSPHERE — emissive-only, ZERO extra lights
// ═════════════════════════════════════════════════════════════════════════════

// ── Open arena atmosphere — no walls, no ceiling ─────────────────────────────
function ArenaShell() {
  return (
    <group>
      {/* Infinite dark floor — fades into fog, never feels like a box */}
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,-0.01,0]}>
        <planeGeometry args={[300,300]} />
        <meshStandardMaterial color="#03060d" roughness={1} />
      </mesh>

      {/* Catwalk truss — floating overhead, open air all around */}
      <mesh position={[0,15.5,0]}>
        <boxGeometry args={[0.3,0.3,CL+2]} />
        <meshStandardMaterial color="#0c1830" roughness={0.6} metalness={0.6} />
      </mesh>
      <mesh position={[0,15.5,0]}>
        <boxGeometry args={[CW+2,0.3,0.3]} />
        <meshStandardMaterial color="#0c1830" roughness={0.6} metalness={0.6} />
      </mesh>

      {/* Floating orange accent lines — thin rods low beside the court,
          give depth without enclosing the space */}
      {([-1,1] as const).map((s,i) => (
        <group key={i}>
          <mesh position={[s*(CW/2+1.4), 0.4, 0]}>
            <boxGeometry args={[0.022, 0.022, CL+1]} />
            <meshStandardMaterial color="#f97316" emissive="#f97316" emissiveIntensity={2.2} roughness={0.1} />
          </mesh>
          <mesh position={[s*(CW/2+2.2), 3.8, 0]}>
            <boxGeometry args={[0.016, 0.016, CL*0.65]} />
            <meshStandardMaterial color="#f97316" emissive="#f97316" emissiveIntensity={1.3} roughness={0.1} />
          </mesh>
        </group>
      ))}
      {/* Blue baseline accent rods */}
      {([-1,1] as const).map((s,i) => (
        <mesh key={i} position={[0, 0.4, s*(CL/2+1.4)]}>
          <boxGeometry args={[CW+1, 0.022, 0.022]} />
          <meshStandardMaterial color="#4477ff" emissive="#4477ff" emissiveIntensity={1.8} roughness={0.1} />
        </mesh>
      ))}
    </group>
  )
}

// ── Center court glow rings ──────────────────────────────────────────────────
function CenterGlow() {
  const matRef = useRef<THREE.MeshBasicMaterial>(null)
  useFrame(({ clock }) => {
    if (matRef.current) matRef.current.opacity = 0.09 + Math.sin(clock.getElapsedTime()*0.7)*0.03
  })
  return (
    <group position={[0,0.009,0]} rotation={[-Math.PI/2,0,0]}>
      <mesh>
        <ringGeometry args={[5.4,6.6,64]} />
        <meshBasicMaterial ref={matRef} color="#f97316" transparent opacity={0.09} side={THREE.DoubleSide} />
      </mesh>
      <mesh>
        <ringGeometry args={[5.85,6.0,64]} />
        <meshBasicMaterial color="#f97316" transparent opacity={0.22} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

// ── Spotlight housings on truss (EMISSIVE ONLY — no actual lights) ───────────
function SpotlightHousings() {
  const positions: [number,number,number][] = [
    [-CW/2+0.5, 15.3, -CL/3], [ CW/2-0.5, 15.3, -CL/3],
    [-CW/2+0.5, 15.3,  CL/3], [ CW/2-0.5, 15.3,  CL/3],
    [-CW/2+0.5, 15.3,  0],    [ CW/2-0.5, 15.3,  0],
    [0,         15.3, -CL/4], [0,         15.3,  CL/4],
  ]
  return (
    <group>
      {positions.map((pos,i) => (
        <group key={i} position={pos}>
          <mesh>
            <cylinderGeometry args={[0.16,0.20,0.38,8]} />
            <meshStandardMaterial color="#162035" roughness={0.5} metalness={0.9} />
          </mesh>
          {/* Glowing lens — emissive, no light */}
          <mesh position={[0,-0.21,0]}>
            <cylinderGeometry args={[0.12,0.12,0.04,12]} />
            <meshStandardMaterial color="#fffaf0" emissive="#fffaf0" emissiveIntensity={2.5} roughness={0} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

// ── Championship banners — emissive fabric, no lights ───────────────────────
const BANNERS = [
  { x:-CW/2-6.6, z:-CL/2+3,  color:'#c8102e' },  // red
  { x:-CW/2-6.6, z:-CL/6,    color:'#006bb6' },  // blue
  { x:-CW/2-6.6, z: CL/6,    color:'#007a33' },  // green
  { x:-CW/2-6.6, z: CL/2-3,  color:'#ffc72c' },  // gold
  { x: CW/2+6.6, z:-CL/2+3,  color:'#8b5cf6' },  // purple
  { x: CW/2+6.6, z:-CL/6,    color:'#f97316' },  // orange
  { x: CW/2+6.6, z: CL/6,    color:'#00b4d8' },  // cyan
  { x: CW/2+6.6, z: CL/2-3,  color:'#c8102e' },  // red
]

function Banners() {
  const groupRefs = useRef<(THREE.Group|null)[]>([])
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    groupRefs.current.forEach((g,i) => {
      if (g) g.rotation.y = Math.sin(t*0.14+i*0.85)*0.035
    })
  })
  return (
    <group>
      {BANNERS.map((b,i) => (
        <group key={i} ref={el => { groupRefs.current[i]=el }}
          position={[b.x,10.5,b.z]}>
          {/* Rod */}
          <mesh position={[0,0.9,0]} rotation={[0,0,Math.PI/2]}>
            <cylinderGeometry args={[0.022,0.022,0.65,6]} />
            <meshStandardMaterial color="#7a8898" roughness={0.3} metalness={0.9} />
          </mesh>
          {/* Cloth */}
          <mesh position={[0,-0.55,0]}>
            <boxGeometry args={[0.52,1.5,0.018]} />
            <meshStandardMaterial color={b.color} roughness={0.7} emissive={b.color} emissiveIntensity={0.12} />
          </mesh>
          {/* Gold stripe bottom */}
          <mesh position={[0,-1.22,0.012]}>
            <planeGeometry args={[0.43,0.15]} />
            <meshBasicMaterial color="#ffd700" transparent opacity={0.9} />
          </mesh>
          {/* Trophy diamond */}
          <mesh position={[0,-0.32,0.012]} rotation={[0,0,Math.PI/4]}>
            <planeGeometry args={[0.12,0.12]} />
            <meshBasicMaterial color="#ffd700" transparent opacity={0.85} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

// ── Shot clock poles — geometry only, emissive display ──────────────────────
function ShotClocks() {
  const corners: [number,number,number][] = [
    [-CW/2-1, 0, -CL/2+1.8],
    [ CW/2+1, 0, -CL/2+1.8],
    [-CW/2-1, 0,  CL/2-1.8],
    [ CW/2+1, 0,  CL/2-1.8],
  ]
  return (
    <group>
      {corners.map((pos,i) => (
        <group key={i} position={pos}>
          <mesh position={[0,4,0]}>
            <cylinderGeometry args={[0.055,0.055,8,8]} />
            <meshStandardMaterial color="#8a9ab0" roughness={0.3} metalness={0.9} />
          </mesh>
          <mesh position={[0,8.1,0]}>
            <boxGeometry args={[0.55,0.22,0.20]} />
            <meshStandardMaterial color="#0d1625" roughness={0.5} metalness={0.5} />
          </mesh>
          <mesh position={[0,8.1,0.11]}>
            <planeGeometry args={[0.44,0.16]} />
            <meshBasicMaterial color="#ff2800" transparent opacity={0.95} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

// ── Scorer's table ───────────────────────────────────────────────────────────
function ScorersTable() {
  return (
    <group position={[CW/2+1.6,0,0]}>
      <mesh position={[0,0.68,0]}>
        <boxGeometry args={[1.1,0.055,3.8]} />
        <meshStandardMaterial color="#0a1628" roughness={0.35} metalness={0.4} />
      </mesh>
      {[[-0.42,-1.7],[0.42,-1.7],[-0.42,1.7],[0.42,1.7]].map(([lx,lz],i) => (
        <mesh key={i} position={[lx,0.33,lz]}>
          <cylinderGeometry args={[0.035,0.035,0.66,6]} />
          <meshStandardMaterial color="#162035" roughness={0.5} metalness={0.8} />
        </mesh>
      ))}
      {[-1.1,0,1.1].map((z,i) => (
        <mesh key={i} position={[0,1.02,z]}>
          <boxGeometry args={[0.5,0.3,0.035]} />
          <meshStandardMaterial color="#050e1c" emissive="#1a44cc" emissiveIntensity={0.5} roughness={0.3} />
        </mesh>
      ))}
      {/* Orange LED strip on table face */}
      <mesh position={[0.535,0.7,0]}>
        <boxGeometry args={[0.018,0.035,3.8]} />
        <meshStandardMaterial color="#f97316" emissive="#f97316" emissiveIntensity={2.0} roughness={0.1} />
      </mesh>
    </group>
  )
}

// ── Animated floating color orbs — emissive spheres, NO point lights ─────────
const ORB_CFG = [
  { x:-CW/2-9,  y:6,  z:-CL/2-7,  c:'#c8102e', sp:0.28, ph:0   },
  { x: CW/2+9,  y:7,  z:-CL/2-7,  c:'#006bb6', sp:0.22, ph:1.3 },
  { x:-CW/2-9,  y:5,  z: CL/2+7,  c:'#007a33', sp:0.31, ph:2.5 },
  { x: CW/2+9,  y:6,  z: CL/2+7,  c:'#ffc72c', sp:0.25, ph:3.7 },
  { x:0,         y:9,  z:-CL/2-9,  c:'#f97316', sp:0.18, ph:0.9 },
  { x:0,         y:9,  z: CL/2+9,  c:'#8b5cf6', sp:0.20, ph:1.9 },
]

function FloatingOrbs() {
  const refs = useRef<(THREE.Group|null)[]>([])
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    refs.current.forEach((g,i) => {
      if (!g) return
      const c = ORB_CFG[i]
      g.position.y = c.y+Math.sin(t*c.sp+c.ph)*1.1
      g.position.x = c.x+Math.cos(t*c.sp*0.6+c.ph)*0.35
    })
  })
  return (
    <group>
      {ORB_CFG.map((c,i) => (
        <group key={i} ref={el => { refs.current[i]=el }} position={[c.x,c.y,c.z]}>
          {/* Core sphere — smaller, more transparent, sits behind fog */}
          <mesh>
            <sphereGeometry args={[1.4,10,10]} />
            <meshStandardMaterial
              color={c.c} emissive={c.c} emissiveIntensity={0.9}
              roughness={0.1} transparent opacity={0.25}
            />
          </mesh>
          {/* Large soft halo */}
          <mesh>
            <sphereGeometry args={[3.5,8,8]} />
            <meshBasicMaterial color={c.c} transparent opacity={0.04} side={THREE.BackSide} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
// ROOT — v2 lights exactly, NO new lights added
// ═════════════════════════════════════════════════════════════════════════════

export default function ArenaScene() {
  const { settings } = useSettings()
  const pm = settings.performanceMode

  return (
    <>
      {/* ── V2 ORIGINAL LIGHTS (unchanged) ── */}
      <hemisphereLight color="#ffffff" groundColor="#2a1500" intensity={0.6} />
      <directionalLight
        position={[12,22,10]} intensity={1.2}
        castShadow={!pm}
        shadow-mapSize-width={1024} shadow-mapSize-height={1024}
        shadow-camera-near={0.5} shadow-camera-far={80}
        shadow-camera-left={-20} shadow-camera-right={20}
        shadow-camera-top={20}  shadow-camera-bottom={-20}
        color="#fff8ee"
      />
      <pointLight position={[0,18,0]}       intensity={1.5} color="#fffaf0" distance={50} decay={1.5} />
      <pointLight position={[0,16,-CL/4]}   intensity={0.9} color="#fff5e0" distance={30} decay={2} />
      <pointLight position={[0,16, CL/4]}   intensity={0.9} color="#fff5e0" distance={30} decay={2} />
      {/* v2 arena rim lights */}
      <pointLight position={[-CW/2-3,9,0]}  intensity={1.2} color="#f97316" distance={30} decay={2} />
      <pointLight position={[ CW/2+3,9,0]}  intensity={1.2} color="#f97316" distance={30} decay={2} />
      <pointLight position={[0,9,-CL/2-3]}  intensity={0.8} color="#4477ff" distance={28} decay={2} />
      <pointLight position={[0,9, CL/2+3]}  intensity={0.8} color="#4477ff" distance={28} decay={2} />

      {/* ── V2 FOG ── */}
      <fog attach="fog" args={['#080f1e', 30, 80]} />

      {/* ── V2 COURT OBJECTS ── */}
      <CourtFloor />
      <CourtMarkings />
      <Hoop z={-CL/2} direction={-1} />
      <Hoop z={ CL/2} direction={ 1} />
      <Basketball performanceMode={pm} />
      <Particles count={pm?8:22} />

      {/* ── ATMOSPHERE (emissive only, no extra lights) ── */}
      <ArenaShell />
      <CenterGlow />
      <SpotlightHousings />
      <FloatingOrbs />
      {!pm && (
        <>
          <Banners />
          <ShotClocks />
          <ScorersTable />
        </>
      )}
    </>
  )
}
