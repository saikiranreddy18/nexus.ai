import { useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, Html, OrbitControls, Sparkles, Stars } from '@react-three/drei'
import * as THREE from 'three'
import { PHASES, PHASE_COLORS, PROBLEMS } from './phaseData'

/* ---------- Scene 1: The 3 AM Idea (bedroom) ---------- */
export function Scene1({ revealed, onReveal }) {
  const screenRef = useRef()
  useFrame(({ clock }) => {
    if (screenRef.current) {
      screenRef.current.material.emissiveIntensity = revealed
        ? 1.6
        : 0.9 + Math.sin(clock.elapsedTime * 2) * 0.15
    }
  })

  return (
    <group>
      <ambientLight intensity={0.25} />
      <pointLight position={[-2.5, 2.5, 1.5]} intensity={0.6} color="#ffb347" />
      <directionalLight position={[0, 4, -3]} intensity={0.3} color="#7c3aed" />

      {/* desk */}
      <mesh position={[0, -0.55, -0.6]} receiveShadow>
        <boxGeometry args={[2.4, 0.1, 1]} />
        <meshStandardMaterial color="#1c1c2a" roughness={0.8} />
      </mesh>

      {/* laptop base */}
      <mesh position={[0, -0.42, -0.5]}>
        <boxGeometry args={[0.9, 0.05, 0.6]} />
        <meshStandardMaterial color="#2a2a3d" />
      </mesh>
      {/* laptop screen (clickable) */}
      <mesh
        ref={screenRef}
        position={[0, -0.02, -0.78]}
        rotation={[-0.25, 0, 0]}
        onClick={(e) => {
          e.stopPropagation()
          onReveal(true)
        }}
      >
        <boxGeometry args={[0.9, 0.55, 0.03]} />
        <meshStandardMaterial color="#050510" emissive="#84cc16" emissiveIntensity={0.9} />
      </mesh>

      {/* window */}
      <mesh position={[1.6, 1, -2]}>
        <planeGeometry args={[1.2, 1.6]} />
        <meshStandardMaterial color="#0b1030" emissive="#3b5bdb" emissiveIntensity={0.25} />
      </mesh>

      {/* floating idea orbs */}
      {Array.from({ length: 10 }).map((_, i) => (
        <Float key={i} speed={1.2 + i * 0.05} rotationIntensity={0.4} floatIntensity={1.2}>
          <mesh position={[(Math.random() - 0.5) * 2.4, 0.4 + Math.random() * 1.2, -1 - Math.random() * 1.5]}>
            <sphereGeometry args={[0.035, 12, 12]} />
            <meshStandardMaterial color="#84cc16" emissive="#84cc16" emissiveIntensity={1.2} />
          </mesh>
        </Float>
      ))}

      {!revealed && (
        <Html center position={[0, -0.25, -0.7]} distanceFactor={6}>
          <div className="pointer-events-none rounded-full bg-black/60 px-3 py-1 text-[10px] tracking-wide text-lime-300 backdrop-blur">
            click the screen
          </div>
        </Html>
      )}

      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.6} maxPolarAngle={Math.PI / 2} minPolarAngle={Math.PI / 3} />
    </group>
  )
}

/* ---------- Scene 2: The Problem (chaos shapes) ---------- */
function ProblemShape({ index, color, position, active, onClick }) {
  const ref = useRef()
  useFrame((_, delta) => {
    if (!ref.current) return
    ref.current.rotation.x += delta * (0.3 + index * 0.15)
    ref.current.rotation.y += delta * (0.4 + index * 0.1)
    const target = active ? 1.4 : 1
    ref.current.scale.lerp(new THREE.Vector3(target, target, target), 0.1)
  })
  const geo = index === 0 ? 'icosahedron' : index === 1 ? 'octahedron' : 'box'
  return (
    <group position={position} onClick={(e) => { e.stopPropagation(); onClick(index) }}>
      <mesh ref={ref}>
        {geo === 'icosahedron' && <icosahedronGeometry args={[0.5, 0]} />}
        {geo === 'octahedron' && <octahedronGeometry args={[0.55, 0]} />}
        {geo === 'box' && <boxGeometry args={[0.7, 0.9, 0.1]} />}
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={active ? 0.9 : 0.4} wireframe={index !== 2} />
      </mesh>
    </group>
  )
}

export function Scene2({ activeProblem, onSelect }) {
  const positions = [
    [-1.6, 0.4, 0],
    [0, -0.3, -0.5],
    [1.6, 0.4, 0],
  ]
  return (
    <group>
      <ambientLight intensity={0.35} />
      <pointLight position={[0, 3, 3]} intensity={0.6} />
      {/* confused avatar at center */}
      <group position={[0, -0.9, -1.2]}>
        <mesh>
          <capsuleGeometry args={[0.28, 0.5, 4, 8]} />
          <meshStandardMaterial color="#3a3a4d" />
        </mesh>
        <mesh position={[0, 0.55, 0]}>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial color="#4a4a5f" />
        </mesh>
      </group>

      {PROBLEMS.map((p, i) => (
        <ProblemShape
          key={p.title}
          index={i}
          color={p.color}
          position={positions[i]}
          active={activeProblem === i}
          onClick={onSelect}
        />
      ))}

      <Sparkles count={60} scale={[4, 3, 2]} size={2} speed={0.4} opacity={0.5} />
      <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.8} />
    </group>
  )
}

/* ---------- Scene 3: The Journey (curve path + waypoint crystals) ---------- */
const journeyPoints = [
  [-4, 0, 0],
  [-2.2, 1.2, -1.5],
  [-0.4, -0.6, -3],
  [1.6, 1.4, -4.2],
  [3.4, -0.4, -5.6],
  [5, 1, -7],
]

export function Scene3({ activeWaypoint, onSelect, autoplay }) {
  const curve = useMemo(() => new THREE.CatmullRomCurve3(journeyPoints.map((p) => new THREE.Vector3(...p))), [])
  const camGroup = useRef()
  const t = useRef(0)

  useFrame((state, delta) => {
    if (autoplay && activeWaypoint === null) {
      t.current = (t.current + delta * 0.03) % 1
    }
    const point = curve.getPointAt(t.current)
    const ahead = curve.getPointAt((t.current + 0.01) % 1)
    state.camera.position.lerp(new THREE.Vector3(point.x, point.y + 0.6, point.z + 3), 0.05)
    state.camera.lookAt(ahead)
  })

  return (
    <group ref={camGroup}>
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 4, 2]} intensity={0.5} />
      <Stars radius={40} depth={30} count={1200} factor={2} fade speed={0.5} />

      {journeyPoints.map((p, i) => (
        <Float key={i} speed={1.5} floatIntensity={0.6}>
          <mesh
            position={p}
            onClick={(e) => { e.stopPropagation(); onSelect(activeWaypoint === i ? null : i) }}
          >
            <octahedronGeometry args={[activeWaypoint === i ? 0.55 : 0.4, 0]} />
            <meshStandardMaterial
              color={PHASE_COLORS[i]}
              emissive={PHASE_COLORS[i]}
              emissiveIntensity={activeWaypoint === i ? 1.4 : 0.7}
            />
          </mesh>
          <Html position={[p[0], p[1] + 0.6, p[2]]} center distanceFactor={10}>
            <div className="pointer-events-none whitespace-nowrap rounded-full bg-black/50 px-2 py-0.5 text-[9px] text-white/80 backdrop-blur">
              {i + 1}. {PHASES[i].name}
            </div>
          </Html>
        </Float>
      ))}
    </group>
  )
}

/* ---------- Scene 4: The Transformation (split world) ---------- */
export function Scene4({ veil }) {
  const veilX = (veil / 100) * 4 - 2 // -2..2
  const leftGroup = useRef()
  const rightGroup = useRef()

  useFrame((_, delta) => {
    if (leftGroup.current) leftGroup.current.rotation.y += delta * 0.3
    if (rightGroup.current) rightGroup.current.rotation.y -= delta * 0.2
  })

  return (
    <group>
      <ambientLight intensity={0.35} />
      <pointLight position={[-3, 2, 2]} intensity={0.5} color="#ec4899" />
      <pointLight position={[3, 2, 2]} intensity={0.5} color="#84cc16" />

      {/* before: chaotic shapes, left of veil */}
      <group ref={leftGroup} position={[-2.2, 0, -1]}>
        {Array.from({ length: 6 }).map((_, i) => (
          <mesh key={i} position={[Math.sin(i) * 0.8, Math.cos(i * 1.3) * 0.8, Math.sin(i * 2) * 0.5]}>
            <torusGeometry args={[0.2, 0.06, 8, 16]} />
            <meshStandardMaterial color="#ec4899" emissive="#ec4899" emissiveIntensity={0.5} wireframe />
          </mesh>
        ))}
      </group>

      {/* after: ordered grid, right of veil */}
      <group ref={rightGroup} position={[2.2, 0, -1]}>
        {Array.from({ length: 6 }).map((_, i) => (
          <mesh key={i} position={[((i % 3) - 1) * 0.5, Math.floor(i / 3) * 0.6 - 0.3, 0]}>
            <boxGeometry args={[0.35, 0.35, 0.35]} />
            <meshStandardMaterial color="#84cc16" emissive="#84cc16" emissiveIntensity={0.6} />
          </mesh>
        ))}
      </group>

      {/* veil plane */}
      <mesh position={[veilX, 0, 0]} rotation={[0, 0, 0]}>
        <planeGeometry args={[0.05, 4]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1} transparent opacity={0.35} />
      </mesh>

      <OrbitControls enableZoom={false} enablePan={false} autoRotate={false} />
    </group>
  )
}

/* ---------- Scene 5: The Six Phases (hexagon crystal chamber) ---------- */
function PhaseCrystal({ index, position, active, onSelect }) {
  const ref = useRef()
  useFrame((_, delta) => {
    if (!ref.current) return
    ref.current.rotation.y += delta * 0.4
    const targetScale = active === index ? 1.3 : 1
    ref.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1)
  })
  return (
    <group position={position}>
      <mesh
        ref={ref}
        onPointerOver={(e) => { e.stopPropagation(); onSelect(index) }}
        onClick={(e) => { e.stopPropagation(); onSelect(index) }}
      >
        <cylinderGeometry args={[0.3, 0.4, 1.4, 6]} />
        <meshStandardMaterial
          color={PHASE_COLORS[index]}
          emissive={PHASE_COLORS[index]}
          emissiveIntensity={active === index ? 1.2 : 0.55}
        />
      </mesh>
      <Html position={[0, 1.1, 0]} center distanceFactor={9}>
        <div className="pointer-events-none whitespace-nowrap rounded bg-black/50 px-2 py-0.5 text-[9px] text-white/80 backdrop-blur">
          {index + 1}. {PHASES[index].name}
        </div>
      </Html>
    </group>
  )
}

export function Scene5({ activePhase, onSelect }) {
  const radius = 3
  const positions = Array.from({ length: 6 }).map((_, i) => {
    const angle = (i / 6) * Math.PI * 2
    return [Math.cos(angle) * radius, 0, Math.sin(angle) * radius]
  })
  return (
    <group>
      <ambientLight intensity={0.35} />
      <pointLight position={[0, 3, 0]} intensity={0.8} />
      {positions.map((p, i) => (
        <PhaseCrystal key={i} index={i} position={p} active={activePhase} onSelect={onSelect} />
      ))}
      {/* center hologram wire sphere */}
      <mesh>
        <icosahedronGeometry args={[0.6, 1]} />
        <meshStandardMaterial color="#ffffff" wireframe transparent opacity={0.25} />
      </mesh>
      <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
    </group>
  )
}

/* ---------- Scene 6: The Outcome (rocket launch) ---------- */
export function Scene6({ launched }) {
  const rocketRef = useRef()
  const flameRef = useRef()

  useFrame((_, delta) => {
    if (!rocketRef.current) return
    if (launched) {
      rocketRef.current.position.y = THREE.MathUtils.lerp(rocketRef.current.position.y, 6, delta * 0.6)
      if (flameRef.current) flameRef.current.scale.y = 1 + Math.sin(Date.now() * 0.02) * 0.4
    }
  })

  return (
    <group>
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 2, 3]} intensity={0.6} />
      <Stars radius={50} depth={40} count={launched ? 2000 : 400} factor={2.5} fade speed={launched ? 1.5 : 0.3} />

      <group ref={rocketRef} position={[0, -1, 0]}>
        <mesh position={[0, 0.6, 0]}>
          <coneGeometry args={[0.25, 0.6, 12]} />
          <meshStandardMaterial color="#fb7185" emissive="#fb7185" emissiveIntensity={0.4} />
        </mesh>
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.25, 0.25, 1, 12]} />
          <meshStandardMaterial color="#e2e8f0" />
        </mesh>
        <mesh ref={flameRef} position={[0, -0.7, 0]} visible={launched}>
          <coneGeometry args={[0.18, 0.5, 8]} />
          <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={1.5} />
        </mesh>
      </group>

      {/* ground */}
      <mesh position={[0, -1.6, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[3, 32]} />
        <meshStandardMaterial color="#12121c" />
      </mesh>

      <OrbitControls enableZoom={false} enablePan={false} autoRotate={!launched} autoRotateSpeed={0.4} />
    </group>
  )
}
