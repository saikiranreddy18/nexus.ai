import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { galaxyState } from '../../state/galaxyStore'

const ZOOM_MIN = 2.4
const ZOOM_MAX = 16

// Full-screen input layer for explore mode: drag orbits, wheel/pinch zooms.
export default function GalaxyExplorer({ onClose }) {
  const surface = useRef(null)

  useEffect(() => {
    const el = surface.current
    const pointers = new Map()
    let lastPinch = 0

    function onWheel(e) {
      e.preventDefault()
      const next = galaxyState.zoom * (1 + e.deltaY * 0.0012)
      galaxyState.zoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, next))
    }
    function onDown(e) {
      el.setPointerCapture(e.pointerId)
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
    }
    function onMove(e) {
      const prev = pointers.get(e.pointerId)
      if (!prev) return
      const curr = { x: e.clientX, y: e.clientY }
      pointers.set(e.pointerId, curr)
      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()]
        const dist = Math.hypot(a.x - b.x, a.y - b.y)
        if (lastPinch) {
          const next = galaxyState.zoom * (lastPinch / dist)
          galaxyState.zoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, next))
        }
        lastPinch = dist
      } else {
        galaxyState.rotY -= (curr.x - prev.x) * 0.005
        galaxyState.rotX += (curr.y - prev.y) * 0.003
        galaxyState.rotX = Math.max(0.05, Math.min(1.25, galaxyState.rotX))
      }
    }
    function onUp(e) {
      pointers.delete(e.pointerId)
      if (pointers.size < 2) lastPinch = 0
    }
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }

    el.addEventListener('wheel', onWheel, { passive: false })
    el.addEventListener('pointerdown', onDown)
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerup', onUp)
    el.addEventListener('pointercancel', onUp)
    window.addEventListener('keydown', onKey)
    return () => {
      el.removeEventListener('wheel', onWheel)
      el.removeEventListener('pointerdown', onDown)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerup', onUp)
      el.removeEventListener('pointercancel', onUp)
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  function zoomBy(f) {
    galaxyState.zoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, galaxyState.zoom * f))
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[75]"
    >
      <div ref={surface} className="absolute inset-0 cursor-grab active:cursor-grabbing" style={{ touchAction: 'none' }} />

      <button
        onClick={onClose}
        aria-label="Exit galaxy exploration"
        className="nb-btn dark absolute right-6 top-6 flex h-11 w-11 items-center justify-center !rounded-full !p-0 text-lg"
      >
        ✕
      </button>

      <div className="absolute right-6 top-1/2 flex -translate-y-1/2 flex-col gap-2">
        <button onClick={() => zoomBy(0.8)} aria-label="Zoom in" className="nb-btn dark h-11 w-11 !rounded-full !p-0 text-xl">+</button>
        <button onClick={() => zoomBy(1.25)} aria-label="Zoom out" className="nb-btn dark h-11 w-11 !rounded-full !p-0 text-xl">−</button>
      </div>

      <p className="tape-label pointer-events-none absolute bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px]" style={{ transform: 'translateX(-50%) rotate(-1.5deg)' }}>
        Drag to orbit · Scroll to zoom · Zoom in to meet the tools
      </p>
    </motion.div>
  )
}
