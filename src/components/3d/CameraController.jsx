import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { galaxyState, GALAXY_CENTER } from '../../state/galaxyStore'

// Scroll-driven flight over the galaxy. Waypoints are [progress, x, y, z].
// The galaxy disk sits in the XZ plane, tilted at ~25° for immersive depth.
// Camera path creates the sensation of flying through the galaxy as user scrolls.
const WAYPOINTS = [
  [0.0, 0, 6.5, 15],   // hero: elevated view, far from galaxy
  [0.22, 4.5, 5.2, 12], // descend and approach from side
  [0.45, 8, 3.2, 6],    // skim low across the disk plane
  [0.68, 5, 5.8, -7],   // swing around behind the galaxy
  [1.0, 0, 7, 14],      // final: retreat to portal view
]

function sampleWaypoints(p) {
  for (let i = 0; i < WAYPOINTS.length - 1; i++) {
    const [pa, ...a] = WAYPOINTS[i]
    const [pb, ...b] = WAYPOINTS[i + 1]
    if (p >= pa && p <= pb) {
      const t = (p - pa) / (pb - pa)
      const e = t * t * (3 - 2 * t) // smoothstep between stops
      return a.map((v, k) => v + (b[k] - v) * e)
    }
  }
  return WAYPOINTS[WAYPOINTS.length - 1].slice(1)
}

export default function CameraController({ reduced, scrollShake = false }) {
  const { camera } = useThree()
  const mouse = useRef({ x: 0, y: 0 })
  const target = useRef(new THREE.Vector3())
  const targetRotation = useRef(new THREE.Quaternion())
  const currentRotation = useRef(new THREE.Quaternion())

  useFrame(({ pointer }) => {
    if (galaxyState.explore) {
      // free-orbit around the galaxy: drag sets angles, wheel/pinch sets zoom
      const { zoom, rotY } = galaxyState
      const rotX = Math.max(0.05, Math.min(1.25, galaxyState.rotX))
      const [cx, cy, cz] = GALAXY_CENTER
      target.current.set(
        cx + Math.sin(rotY) * Math.cos(rotX) * zoom,
        cy + Math.sin(rotX) * zoom,
        cz + Math.cos(rotY) * Math.cos(rotX) * zoom,
      )
      camera.position.lerp(target.current, 0.08)
      camera.lookAt(cx, cy, cz)
      return
    }

    const doc = document.documentElement
    const max = doc.scrollHeight - window.innerHeight
    const p = max > 0 ? Math.min(1, window.scrollY / max) : 0

    const [x, y, z] = sampleWaypoints(p)

    // Smooth mouse parallax (subtle)
    if (!reduced) {
      mouse.current.x += (pointer.x - mouse.current.x) * 0.03
      mouse.current.y += (pointer.y - mouse.current.y) * 0.03
    }

    // Target camera position with very smooth easing
    target.current.set(
      x + mouse.current.x * 0.6,
      y + mouse.current.y * 0.4,
      z
    )

    // Ultra-smooth position lerp (very slow to feel floaty/traveling)
    camera.position.lerp(target.current, 0.035)

    // Smooth axis tilt based on scroll progress
    // This creates the rotating/tilting effect as you scroll through the galaxy
    const tiltX = 0.12 + p * 0.35 // Gradually tilt down as you scroll
    const tiltY = p * 2.8 // Rotate around Y axis smoothly
    const tiltZ = Math.sin(p * Math.PI) * 0.15 // Subtle rolling motion

    // Create smooth rotation quaternion
    const euler = new THREE.Euler(tiltX, tiltY, tiltZ, 'YXZ')
    targetRotation.current.setFromEuler(euler)

    // Smoothly interpolate camera rotation
    currentRotation.current.slerp(targetRotation.current, 0.04)
    camera.quaternion.copy(currentRotation.current)

    camera.lookAt(0, 0, 0)
  })

  return null
}
