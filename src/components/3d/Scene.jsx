import { Suspense, useEffect, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import ParticleField from './ParticleField'
import Galaxy from './Galaxy'
import CameraController from './CameraController'

export default function Scene({ reduced }) {
  const wrapRef = useRef(null)

  // Dim the universe while reading content sections; full brightness at the
  // hero and the final CTA where the galaxy is the star.
  useEffect(() => {
    function onScroll() {
      const el = wrapRef.current
      if (!el) return
      const max = document.documentElement.scrollHeight - window.innerHeight
      const p = max > 0 ? window.scrollY / max : 0
      const mid = Math.min(p / 0.14, (1 - p) / 0.12, 1)
      el.style.opacity = String(1 - 0.55 * Math.max(0, Math.min(1, mid)))
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div ref={wrapRef} className="fixed inset-0 z-0" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 7.5, 14], fov: 52 }}
        dpr={[1, reduced ? 1.25 : 2]}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        <color attach="background" args={['#060609']} />
        <Suspense fallback={null}>
          <ParticleField reduced={reduced} />
          <Galaxy reduced={reduced} />
        </Suspense>
        <CameraController reduced={reduced} />
      </Canvas>
      {/* cinematic vignette */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 90% 75% at 50% 45%, transparent 55%, rgba(4,4,8,0.55) 100%)',
        }}
      />
    </div>
  )
}
