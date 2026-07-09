import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { galaxyState, GALAXY_CENTER } from '../../state/galaxyStore'

// Scroll-driven flight over the galaxy. Waypoints are [progress, x, y, z].
// The galaxy disk sits in the XZ plane, so altitude (y) sets how edge-on
// the view is; the path banks around the disk and returns to the opening shot.
const WAYPOINTS = [
  [0.0, 0, 7.5, 14],   // hero: elevated three-quarter view
  [0.22, 5.5, 4.6, 11.5], // descend and bank right
  [0.45, 9.5, 2.4, 5],  // skim low across the disk plane
  [0.68, 4.5, 6.5, -8.5], // swing behind the galaxy
  [1.0, 0, 8.5, 13.5], // final CTA: pull back to the portal view
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

export default function CameraController({ reduced }) {
  const { camera } = useThree()
  const mouse = useRef({ x: 0, y: 0 })
  const target = useRef(new THREE.Vector3())

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
    if (!reduced) {
      mouse.current.x += (pointer.x - mouse.current.x) * 0.04
      mouse.current.y += (pointer.y - mouse.current.y) * 0.04
    }
    target.current.set(x + mouse.current.x * 0.9, y + mouse.current.y * 0.6, z)
    camera.position.lerp(target.current, 0.055)
    camera.lookAt(0, 0, 0)
  })

  return null
}
