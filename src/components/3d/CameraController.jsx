import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { galaxyState, GALAXY_CENTER } from '../../state/galaxyStore'

// Corrected camera based on reference video analysis:
// - Start elevated at distance
// - Travel TOWARD galaxy while scrolling (get closer)
// - Rotate AROUND galaxy horizontally
// - Maintain consistent tilt angle (~28-32°)
// - Creates sense of "flying through" the spiral

export default function CameraController({ reduced }) {
  const { camera } = useThree()
  const smoothPos = useRef(new THREE.Vector3())
  const mouseX = useRef(0)
  const mouseY = useRef(0)

  useFrame(({ pointer, clock }) => {
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

    // Minimal mouse input for parallax
    if (!reduced) {
      mouseX.current += (pointer.x - mouseX.current) * 0.008
      mouseY.current += (pointer.y - mouseY.current) * 0.008
    } else {
      mouseX.current *= 0.92
      mouseY.current *= 0.92
    }

    // Reference video analysis:
    // - Start: far from galaxy (distance ~15-16), elevated (y ~7)
    // - End: closer to galaxy (distance ~7-8), similar height
    // - Rotation: smooth rotation around galaxy center (0 to 2π)
    // - Tilt: stays relatively constant (~0.3-0.35 rad)

    // Distance: starts far, comes closer as you scroll
    const startDist = 16
    const endDist = 8
    const distance = startDist - (startDist - endDist) * scrollProgress

    // Rotation angle around galaxy (full rotation as you scroll)
    const rotationAngle = scrollProgress * Math.PI * 2

    // Camera position: orbit around galaxy center at scrolling distance
    const camX = Math.cos(rotationAngle) * distance + mouseX.current * 0.08
    const camY = 6.8 + mouseY.current * 0.06 // Slight height variation
    const camZ = Math.sin(rotationAngle) * distance + mouseY.current * 0.08

    // Smooth position update
    smoothPos.current.set(camX, camY, camZ)
    camera.position.lerp(smoothPos.current, 0.14)

    // Rotation: maintain ~30° tilt while rotating around Y
    // The tilt angle stays mostly constant, only Y-axis rotates
    const tiltX = 0.32 // ~30° constant tilt (matches reference)
    const rotY = rotationAngle // Rotate around galaxy

    const euler = new THREE.Euler(tiltX, rotY, 0, 'YXZ')
    const targetQuat = new THREE.Quaternion().setFromEuler(euler)

    // Smooth quaternion interpolation
    camera.quaternion.slerp(targetQuat, 0.14)

    camera.lookAt(0, 0, 0)
  })

  return null
}
