import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { AI_TOOLS } from '../../utils/aiTools'

// From orbit these are simply brighter, twinkling stars in the arms.
// Hover one and the tool's name pops up above it; fly close and the
// name resolves in-scene as crisp high-resolution type.

function makeStarTexture(color) {
  const s = 128
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = s
  const ctx = canvas.getContext('2d')
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.25, `${color}dd`)
  g.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, s, s)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

function makeNameTexture(tool) {
  const w = 1024
  const h = 256
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')

  let size = 116
  ctx.font = `700 ${size}px "Space Grotesk", system-ui, sans-serif`
  while (ctx.measureText(tool.name).width > w - 120 && size > 48) {
    size -= 6
    ctx.font = `700 ${size}px "Space Grotesk", system-ui, sans-serif`
  }
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.shadowColor = tool.color
  ctx.shadowBlur = 42
  ctx.fillStyle = '#ffffff'
  ctx.fillText(tool.name, w / 2, h / 2)
  ctx.shadowBlur = 0
  ctx.fillText(tool.name, w / 2, h / 2) // second pass keeps the core sharp

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  return tex
}

const RADIUS = 12
const BRANCHES = 5
const SPIN = 1.15
const REVEAL_FAR = 7 // in-scene name starts fading in
const REVEAL_NEAR = 3.2 // fully readable
const HOVER_PX = 30 // pointer-to-star hit radius on screen

export default function ToolStars() {
  const starRefs = useRef([])
  const nameRefs = useRef([])
  const worldPos = useRef(new THREE.Vector3())
  const ndc = useRef(new THREE.Vector3())
  const pointer = useRef({ x: -9999, y: -9999 })
  const hovered = useRef(-1)

  useEffect(() => {
    function onMove(e) {
      pointer.current.x = e.clientX
      pointer.current.y = e.clientY
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  const items = useMemo(
    () =>
      AI_TOOLS.map((tool, i) => {
        const r = 3.2 + (i / AI_TOOLS.length) * (RADIUS - 3.2)
        const branchAngle = ((i % BRANCHES) / BRANCHES) * Math.PI * 2
        const spinAngle = r * SPIN
        const jitter = ((i * 2654435761) % 100) / 100 - 0.5 // deterministic
        return {
          tool,
          position: [
            Math.cos(branchAngle + spinAngle) * r + jitter * 1.4,
            jitter * 0.8,
            Math.sin(branchAngle + spinAngle) * r + jitter * 1.2,
          ],
          phase: (i * 1.7) % (Math.PI * 2),
          speed: 0.6 + ((i * 37) % 10) / 10,
          starTex: makeStarTexture(tool.color),
          nameTex: makeNameTexture(tool),
        }
      }),
    [],
  )

  useFrame(({ clock, camera }) => {
    const t = clock.elapsedTime
    const tooltip = document.getElementById('tool-tooltip')
    let best = -1
    let bestDist = HOVER_PX
    let bestX = 0
    let bestY = 0

    for (let i = 0; i < items.length; i++) {
      const star = starRefs.current[i]
      const name = nameRefs.current[i]
      if (!star || !name) continue

      star.getWorldPosition(worldPos.current)

      // screen-space hit test against the pointer
      ndc.current.copy(worldPos.current).project(camera)
      if (ndc.current.z < 1) {
        const sx = ((ndc.current.x + 1) / 2) * window.innerWidth
        const sy = ((1 - ndc.current.y) / 2) * window.innerHeight
        const dPx = Math.hypot(sx - pointer.current.x, sy - pointer.current.y)
        if (dPx < bestDist) {
          best = i
          bestDist = dPx
          bestX = sx
          bestY = sy
        }
      }

      // twinkle: slow breathing plus an occasional sharp glint
      const { phase, speed } = items[i]
      const breathe = 0.55 + 0.35 * Math.sin(t * speed + phase)
      const glint = Math.max(0, Math.sin(t * 0.31 + phase * 3.7) - 0.965) * 14
      const isHover = i === hovered.current
      star.material.opacity = isHover ? 1 : Math.min(1, breathe + glint)
      const s = (isHover ? 0.55 : 0.32) + glint * 0.25
      star.scale.set(s, s, 1)

      // reveal the in-scene name when the camera flies close (or on hover)
      const d = camera.position.distanceTo(worldPos.current)
      const reveal = THREE.MathUtils.clamp((REVEAL_FAR - d) / (REVEAL_FAR - REVEAL_NEAR), 0, 1)
      name.material.opacity = isHover ? Math.max(0.9, reveal) : reveal * reveal
    }

    hovered.current = best
    if (tooltip) {
      if (best >= 0) {
        tooltip.textContent = items[best].tool.name
        tooltip.style.borderColor = `${items[best].tool.color}88`
        tooltip.style.left = `${bestX}px`
        tooltip.style.top = `${bestY - 18}px`
        tooltip.style.opacity = '1'
      } else {
        tooltip.style.opacity = '0'
      }
    }
  })

  return (
    <group>
      {items.map(({ tool, position, starTex, nameTex }, i) => (
        <group key={tool.name} position={position}>
          <sprite ref={(el) => (starRefs.current[i] = el)} scale={[0.32, 0.32, 1]}>
            <spriteMaterial map={starTex} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
          </sprite>
          <sprite ref={(el) => (nameRefs.current[i] = el)} position={[0, 0.34, 0]} scale={[2.3, 0.575, 1]}>
            <spriteMaterial map={nameTex} transparent opacity={0} depthWrite={false} />
          </sprite>
        </group>
      ))}
    </group>
  )
}
