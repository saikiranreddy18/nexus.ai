import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Edges, Html } from '@react-three/drei'
import * as THREE from 'three'
import { MODULES } from './founderosData'

// Scroll-driven "idea explosion": a single glowing Idea Core fractures into
// six phase modules arranged as a hexagonal blueprint, then converges into
// the glowing Build Prompt. All motion is damped toward progressRef.current
// (0..1), mirroring the CameraController scroll-progress pattern.

const clamp01 = (x) => Math.min(1, Math.max(0, x))
const smoothstep = (a, b, x) => {
  const t = clamp01((x - a) / (b - a))
  return t * t * (3 - 2 * t)
}

function makeGlowTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const g = c.getContext('2d')
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64)
  grad.addColorStop(0, 'rgba(255,255,255,1)')
  grad.addColorStop(0.3, 'rgba(255,255,255,0.35)')
  grad.addColorStop(1, 'rgba(255,255,255,0)')
  g.fillStyle = grad
  g.fillRect(0, 0, 128, 128)
  return new THREE.CanvasTexture(c)
}

// Honeycomb of hexagon outlines for the blueprint ground plane.
function makeHoneycomb(rings = 3, cell = 0.55) {
  const verts = []
  const w = Math.sqrt(3) * cell
  for (let q = -rings; q <= rings; q++) {
    for (let r = Math.max(-rings, -q - rings); r <= Math.min(rings, -q + rings); r++) {
      const cx = w * (q + r / 2)
      const cy = 1.5 * cell * r
      for (let i = 0; i < 6; i++) {
        const a1 = (Math.PI / 3) * i + Math.PI / 6
        const a2 = (Math.PI / 3) * (i + 1) + Math.PI / 6
        verts.push(
          cx + Math.cos(a1) * cell * 0.92, cy + Math.sin(a1) * cell * 0.92, 0,
          cx + Math.cos(a2) * cell * 0.92, cy + Math.sin(a2) * cell * 0.92, 0,
        )
      }
    }
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(verts), 3))
  return geo
}

const STREAM_PER_MODULE = 10

function Rig({ progressRef }) {
  const glowTex = useMemo(makeGlowTexture, [])
  const gridGeo = useMemo(() => makeHoneycomb(3, 0.55), [])

  const smooth = useRef(0)
  const mouse = useRef({ x: 0, y: 0 })
  const seps = useRef(new Array(MODULES.length).fill(0))

  const coreRef = useRef()
  const coreMatRef = useRef()
  const coreHaloRef = useRef()
  const moduleRefs = useRef([])
  const haloRefs = useRef([])
  const labelRefs = useRef([])
  const streamRef = useRef()
  const gridRef = useRef()
  const termHaloRef = useRef()
  const termCoreRef = useRef()
  const dustRef = useRef()

  const streamGeo = useMemo(() => {
    const count = MODULES.length * STREAM_PER_MODULE
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)
    MODULES.forEach((m, i) => {
      const c = new THREE.Color(m.color)
      for (let j = 0; j < STREAM_PER_MODULE; j++) {
        const k = (i * STREAM_PER_MODULE + j) * 3
        col[k] = c.r
        col[k + 1] = c.g
        col[k + 2] = c.b
      }
    })
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3))
    return geo
  }, [])

  const dustGeo = useMemo(() => {
    const count = 260
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 15
      pos[i * 3 + 1] = (Math.random() - 0.5) * 9
      pos[i * 3 + 2] = -6 + Math.random() * 7
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    return geo
  }, [])

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    smooth.current += (progressRef.current - smooth.current) * Math.min(1, delta * 5.5)
    const p = smooth.current
    const conv = smoothstep(0.84, 0.97, p)

    // Responsive blueprint radius + module scale
    const vw = state.viewport.width
    const r = Math.min(2.35, Math.max(1.45, vw * 0.26))
    const ms = Math.min(1, Math.max(0.6, vw * 0.12))

    // --- Idea Core: pulse, shake (crack), then fade as modules separate ---
    const coreVis = 1 - smoothstep(0.12, 0.42, p)
    const shake = smoothstep(0.06, 0.12, p) * (1 - smoothstep(0.16, 0.26, p))
    if (coreRef.current) {
      coreRef.current.visible = coreVis > 0.01
      coreRef.current.position.set(Math.sin(t * 41) * 0.02 * shake, Math.cos(t * 37) * 0.02 * shake, 0)
      coreRef.current.rotation.y += delta * (0.25 + shake * 1.6)
      coreRef.current.rotation.x = 0.35 + Math.sin(t * 0.4) * 0.08
      const cs = (0.92 + Math.sin(t * 2) * 0.045) * (0.45 + 0.55 * coreVis)
      coreRef.current.scale.setScalar(cs)
    }
    if (coreMatRef.current) coreMatRef.current.emissiveIntensity = 1.05 + Math.sin(t * 2) * 0.25 + shake * 1.1
    if (coreHaloRef.current) coreHaloRef.current.material.opacity = (0.42 + Math.sin(t * 2) * 0.08 + shake * 0.25) * coreVis

    // --- Six phase modules: separate on their windows, converge at the end ---
    MODULES.forEach((m, i) => {
      const out = smoothstep(m.window[0], m.window[1], p)
      const sep = out * (1 - conv)
      seps.current[i] = sep
      const g = moduleRefs.current[i]
      if (!g) return
      const a = (m.angle * Math.PI) / 180
      const wob = Math.sin(t * 1.2 + i * 1.7) * 0.06 * sep
      g.position.set(Math.cos(a) * r * sep, Math.sin(a) * r * sep + wob, (1 - out) * -0.35)
      const s = (0.35 + 0.65 * out) * (1 - conv) * ms
      g.scale.setScalar(Math.max(0.0001, s))
      g.rotation.y = Math.sin(t * 0.6 + i) * 0.13 * sep
      g.rotation.x = Math.cos(t * 0.5 + i * 2) * 0.09 * sep
      g.visible = out > 0.02 && s > 0.02
      const halo = haloRefs.current[i]
      if (halo) halo.material.opacity = 0.4 * sep
      const lb = labelRefs.current[i]
      if (lb) lb.style.opacity = clamp01(out * 1.4 - 0.35) * (1 - conv)
    })

    // --- Data streams from modules toward the center at the peak state ---
    const streamOn = smoothstep(0.48, 0.66, p) * (1 - smoothstep(0.82, 0.92, p))
    if (streamRef.current) {
      streamRef.current.visible = streamOn > 0.01
      streamRef.current.material.opacity = streamOn * 0.85
      if (streamOn > 0.01) {
        const pos = streamGeo.attributes.position.array
        MODULES.forEach((m, i) => {
          const a = (m.angle * Math.PI) / 180
          const mx = Math.cos(a) * r * seps.current[i]
          const my = Math.sin(a) * r * seps.current[i]
          for (let j = 0; j < STREAM_PER_MODULE; j++) {
            const tt = (t * 0.2 + j / STREAM_PER_MODULE + i * 0.13) % 1
            const k = (i * STREAM_PER_MODULE + j) * 3
            pos[k] = mx * (1 - tt)
            pos[k + 1] = my * (1 - tt)
            pos[k + 2] = 0.1
          }
        })
        streamGeo.attributes.position.needsUpdate = true
      }
    }

    // --- Hexagonal blueprint ground plane beneath the peak state ---
    const gridOn = smoothstep(0.32, 0.55, p) * (1 - smoothstep(0.84, 0.96, p))
    if (gridRef.current) {
      gridRef.current.visible = gridOn > 0.01
      gridRef.current.material.opacity = gridOn * 0.13
      gridRef.current.rotation.z += delta * 0.02
    }

    // --- Build Prompt convergence glow ---
    const tOn = smoothstep(0.86, 0.98, p)
    if (termHaloRef.current) {
      termHaloRef.current.visible = tOn > 0.01
      termHaloRef.current.material.opacity = tOn * (0.5 + Math.sin(t * 1.6) * 0.06)
      termHaloRef.current.scale.set(4.6 + Math.sin(t * 1.6) * 0.15, 3.1, 1)
    }
    if (termCoreRef.current) {
      termCoreRef.current.visible = tOn > 0.01
      termCoreRef.current.material.opacity = tOn * 0.85
    }

    if (dustRef.current) dustRef.current.rotation.y = t * 0.015

    // --- Camera: dolly out to the diagram, back in for the convergence ---
    mouse.current.x += (state.pointer.x - mouse.current.x) * 0.05
    mouse.current.y += (state.pointer.y - mouse.current.y) * 0.05
    const z = 6.4 + 3.4 * smoothstep(0.08, 0.6, p) - 2.9 * conv
    state.camera.position.x += (mouse.current.x * 0.55 - state.camera.position.x) * 0.08
    state.camera.position.y += (mouse.current.y * 0.35 - state.camera.position.y) * 0.08
    state.camera.position.z += (z - state.camera.position.z) * 0.08
    state.camera.lookAt(0, 0, 0)
  })

  return (
    <group>
      <ambientLight intensity={0.35} />
      <pointLight position={[-6, 3, 4]} intensity={0.5} color="#7c3aed" />
      <pointLight position={[6, -2, 4]} intensity={0.4} color="#06b6d4" />
      <pointLight position={[0, 0, 5]} intensity={0.7} color="#ffffff" />

      {/* ambient dust */}
      <points ref={dustRef} geometry={dustGeo}>
        <pointsMaterial size={0.04} map={glowTex} color="#8f9bbd" transparent opacity={0.3} depthWrite={false} blending={THREE.AdditiveBlending} sizeAttenuation />
      </points>

      {/* the Idea Core */}
      <group ref={coreRef}>
        <mesh>
          <icosahedronGeometry args={[0.5, 0]} />
          <meshStandardMaterial ref={coreMatRef} color="#101408" emissive="#84cc16" emissiveIntensity={1.1} roughness={0.25} metalness={0.15} flatShading />
        </mesh>
        <mesh>
          <icosahedronGeometry args={[0.66, 1]} />
          <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.12} />
        </mesh>
      </group>
      <sprite ref={coreHaloRef} scale={[3.1, 3.1, 1]}>
        <spriteMaterial map={glowTex} color="#84cc16" transparent opacity={0.42} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>

      {/* six phase modules */}
      {MODULES.map((m, i) => (
        <group key={m.key} ref={(el) => { moduleRefs.current[i] = el }} visible={false}>
          <sprite ref={(el) => { haloRefs.current[i] = el }} scale={[2.4, 1.8, 1]} position={[0, 0, -0.2]}>
            <spriteMaterial map={glowTex} color={m.color} transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} />
          </sprite>
          <mesh>
            <boxGeometry args={[1.14, 0.74, 0.06]} />
            <meshStandardMaterial color="#12121c" emissive={m.color} emissiveIntensity={0.14} roughness={0.35} metalness={0.2} />
            <Edges color={m.color} />
          </mesh>
          {/* schematic face details */}
          <mesh position={[-0.06, 0.2, 0.036]}>
            <planeGeometry args={[0.58, 0.05]} />
            <meshBasicMaterial color={m.color} transparent opacity={0.9} />
          </mesh>
          <mesh position={[-0.02, 0.07, 0.036]}>
            <planeGeometry args={[0.82, 0.042]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.26} />
          </mesh>
          <mesh position={[-0.14, -0.05, 0.036]}>
            <planeGeometry args={[0.58, 0.042]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.15} />
          </mesh>
          <mesh position={[0.32, -0.22, 0.036]}>
            <planeGeometry args={[0.34, 0.1]} />
            <meshBasicMaterial color={m.key === 'feasibility' ? '#fb7185' : m.color} transparent opacity={0.5} />
          </mesh>
          <mesh position={[-0.45, 0.2, 0.037]}>
            <circleGeometry args={[0.032, 12]} />
            <meshBasicMaterial color={m.color} />
          </mesh>
          <Html center position={[0, -0.64, 0]} distanceFactor={8} style={{ pointerEvents: 'none' }} zIndexRange={[10, 0]}>
            <div
              ref={(el) => { labelRefs.current[i] = el }}
              style={{
                opacity: 0,
                color: m.color,
                fontFamily: "ui-monospace, 'Cascadia Mono', 'SF Mono', monospace",
                fontSize: '11px',
                letterSpacing: '0.28em',
                whiteSpace: 'nowrap',
                textShadow: `0 0 14px ${m.color}55`,
              }}
            >
              {String(i + 1).padStart(2, '0')}·{m.label}
            </div>
          </Html>
        </group>
      ))}

      {/* data streams toward the center */}
      <points ref={streamRef} geometry={streamGeo} visible={false}>
        <pointsMaterial size={0.055} map={glowTex} vertexColors transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} sizeAttenuation />
      </points>

      {/* hexagonal blueprint ground plane */}
      <lineSegments ref={gridRef} geometry={gridGeo} position={[0, -2.2, -0.6]} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
        <lineBasicMaterial color="#06b6d4" transparent opacity={0} depthWrite={false} />
      </lineSegments>

      {/* Build Prompt convergence glow (the DOM terminal fades in on top) */}
      <sprite ref={termHaloRef} visible={false} scale={[4.6, 3.1, 1]}>
        <spriteMaterial map={glowTex} color="#84cc16" transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
      <sprite ref={termCoreRef} visible={false} scale={[1.5, 1, 1]}>
        <spriteMaterial map={glowTex} color="#d9f99d" transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
    </group>
  )
}

export default function ExplosionScene({ progressRef }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 6.4], fov: 50 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
    >
      {/* pixel-identical to the page background — zero visible seams */}
      <color attach="background" args={['#0a0a0f']} />
      <Rig progressRef={progressRef} />
    </Canvas>
  )
}
