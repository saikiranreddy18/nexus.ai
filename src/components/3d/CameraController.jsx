import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { galaxyState, GALAXY_CENTER } from '../../state/galaxyStore'

// Scroll-driven camera flight through galaxy
// Smooth easing: start normal, rotate gradually as you scroll deeper
const WAYPOINTS = [
  [0.0, 0, 7.5, 14],     // start: normal elevated view
  [0.25, 4, 6, 12],      // gentle descent
  [0.5, 7, 3, 7],        // deep into galaxy
  [0.75, 3, 6, -9],      // behind the galaxy
  [1.0, 0, 8, 13],       // return to origin
]

function sampleWaypoints(p) {
  for (let i = 0; i < WAYPOINTS.length - 1; i++) {
    const [pa, ...a] = WAYPOINTS[i]
    const [pb, ...b] = WAYPOINTS[i + 1]
    if (p >= pa && p <= pb) {
      const t = (p - pa) / (pb - pa)
      const e = t * t * (3 - 2 * t)
      return a.map((v, k) => v + (b[k] - v) * e)
    }
  }
  return WAYPOINTS[WAYPOINTS.length - 1].slice(1)
}

export default function CameraController({ reduced }) {
  const { camera } = useThree()
  const smoothPos = useRef(new THREE.Vector3(0, 7.5, 14))
  const smoothQuat = useRef(new THREE.Quaternion())
  const mouseX = useRef(0)
  const mouseY = useRef(0)

  useFrame(({ pointer }) => {
    if (galaxyState.explore) {
      const { zoom, rotY } = galaxyState
      const rotX = Math.max(0.05, Math.min(1.25, galaxyState.rotX))
      const [cx, cy, cz] = GALAXY_CENTER
      const targetPos = new THREE.Vector3(
        cx + Math.sin(rotY) * Math.cos(rotX) * zoom,
        cy + Math.sin(rotX) * zoom,
        cz + Math.cos(rotY) * Math.cos(rotX) * zoom,
      )
      camera.position.lerp(targetPos, 0.1)
      camera.lookAt(cx, cy, cz)
      return
    }

    const doc = document.documentElement
    const max = doc.scrollHeight - window.innerHeight
    const scrollProgress = max > 0 ? Math.min(1, window.scrollY / max) : 0

    // Get waypoint position
    const [wpX, wpY, wpZ] = sampleWaypoints(scrollProgress)

    // Smooth mouse input (very subtle, minimal jitter)
    if (!reduced) {
      mouseX.current += (pointer.x - mouseX.current) * 0.015
      mouseY.current += (pointer.y - mouseY.current) * 0.015
    } else {
      mouseX.current *= 0.95
      mouseY.current *= 0.95
    }

    // Target position with minimal parallax
    const targetX = wpX + mouseX.current * 0.2
    const targetY = wpY + mouseY.current * 0.15
    const targetZ = wpZ

    // Smooth position interpolation
    smoothPos.current.set(targetX, targetY, targetZ)
    camera.position.lerp(smoothPos.current, 0.12)

    // Smooth rotation (starts level, rotates smoothly around galaxy)
    const tiltX = 0.05 + scrollProgress * 0.6 // tilt down gradually
    const rotY = scrollProgress * Math.PI * 1.8 // rotate around galaxy
    const tiltZ = Math.sin(scrollProgress * Math.PI) * 0.06 // subtle roll

    const targetEuler = new THREE.Euler(tiltX, rotY, tiltZ, 'YXZ')
    const targetQuat = new THREE.Quaternion().setFromEuler(targetEuler)

    // Very smooth quaternion interpolation
    smoothQuat.current.slerp(targetQuat, 0.12)
    camera.quaternion.copy(smoothQuat.current)

    camera.lookAt(0, 0, 0)
  })

  return null
}
