import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { galaxyState, GALAXY_CENTER } from '../../state/galaxyStore'

// PRECISE camera implementation matching reference video:
// Reference shows: Spiral galaxy at ~28° tilt, orbiting view with smooth approach
// Camera behavior: Start far, rotate around galaxy, approach slightly, maintain tilt

export default function CameraController({ reduced }) {
  const { camera } = useThree()
  const smoothPos = useRef(new THREE.Vector3())
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
    const p = max > 0 ? Math.min(1, window.scrollY / max) : 0

    // Minimal mouse parallax
    if (!reduced) {
      mouseX.current += (pointer.x - mouseX.current) * 0.006
      mouseY.current += (pointer.y - mouseY.current) * 0.006
    } else {
      mouseX.current *= 0.90
      mouseY.current *= 0.90
    }

    // REFERENCE VIDEO PARAMETERS:
    // The galaxy should be viewed from a tilted angle that shows the spiral clearly
    // Start at a fixed distance and rotate smoothly around the galaxy center
    // Subtle approach toward the galaxy creates depth perception

    // Distance from galaxy center: slight variation for depth (18 → 11)
    const orbitRadius = 18 - p * 7

    // Rotation: smooth orbit around Y-axis (0 → 360°)
    const orbitAngle = p * Math.PI * 2

    // Camera position in orbit
    const posX = Math.cos(orbitAngle) * orbitRadius
    const posY = 7.2 // Elevated view
    const posZ = Math.sin(orbitAngle) * orbitRadius

    // Add subtle mouse parallax
    const targetX = posX + mouseX.current * 0.06
    const targetY = posY + mouseY.current * 0.04
    const targetZ = posZ + mouseY.current * 0.06

    // Smooth camera position
    smoothPos.current.set(targetX, targetY, targetZ)
    camera.position.lerp(smoothPos.current, 0.15)

    // Precise tilt angle: ~28° from horizontal (matches reference spiral view)
    // This angle shows the spiral structure clearly
    const tiltX = 0.28  // ~28° tilt for spiral visibility
    const rotY = orbitAngle  // Rotate around Y as you scroll

    // Create target rotation
    const euler = new THREE.Euler(tiltX, rotY, 0, 'YXZ')
    const targetQuat = new THREE.Quaternion().setFromEuler(euler)

    // Smooth quaternion interpolation
    smoothQuat.current.slerp(targetQuat, 0.15)
    camera.quaternion.copy(smoothQuat.current)

    camera.lookAt(0, 0, 0)
  })

  return null
}
