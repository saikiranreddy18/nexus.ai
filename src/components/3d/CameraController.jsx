import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { galaxyState, GALAXY_CENTER } from '../../state/galaxyStore'

// Reference video shows: galaxy at ~30° tilt, rotating around center as you scroll
// Camera orbits around galaxy maintaining the tilted perspective
const ORBIT_RADIUS = 14
const CAMERA_HEIGHT = 6.5
const TILT_ANGLE = 0.35 // ~30° tilt (matches reference video)

export default function CameraController({ reduced }) {
  const { camera } = useThree()
  const smoothPos = useRef(new THREE.Vector3(0, CAMERA_HEIGHT, ORBIT_RADIUS))
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

    // Minimal mouse parallax (only subtle shifts, no major tilt changes)
    if (!reduced) {
      mouseX.current += (pointer.x - mouseX.current) * 0.01
      mouseY.current += (pointer.y - mouseY.current) * 0.01
    } else {
      mouseX.current *= 0.95
      mouseY.current *= 0.95
    }

    // Camera orbits around galaxy while maintaining tilt
    // Rotate around Y-axis as you scroll (horizontal rotation around galaxy)
    const orbitAngle = scrollProgress * Math.PI * 2 // Full rotation as you scroll
    const orbitX = Math.cos(orbitAngle) * ORBIT_RADIUS + mouseX.current * 0.1
    const orbitZ = Math.sin(orbitAngle) * ORBIT_RADIUS + mouseY.current * 0.1
    const camY = CAMERA_HEIGHT

    // Smooth camera position
    smoothPos.current.set(orbitX, camY, orbitZ)
    camera.position.lerp(smoothPos.current, 0.12)

    // Fixed tilt angle (maintain ~30° perspective like reference video)
    // Only rotate around Y-axis, keep X tilt constant
    const euler = new THREE.Euler(TILT_ANGLE, orbitAngle, 0, 'YXZ')
    const targetQuat = new THREE.Quaternion().setFromEuler(euler)

    // Smooth rotation
    camera.quaternion.slerp(targetQuat, 0.12)

    camera.lookAt(0, 0, 0)
  })

  return null
}
