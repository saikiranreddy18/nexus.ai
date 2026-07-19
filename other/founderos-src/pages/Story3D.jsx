import { Suspense, useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Scene1, Scene2, Scene3, Scene4, Scene5, Scene6 } from '../components/story3d/scenes'
import { OUTCOME_STATS, PHASES, PHASE_COLORS, PROBLEMS, SCENES } from '../components/story3d/phaseData'

const TOTAL = SCENES.length

export default function Story3D() {
  const [scene, setScene] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [activeProblem, setActiveProblem] = useState(null)
  const [activeWaypoint, setActiveWaypoint] = useState(null)
  const [veil, setVeil] = useState(50)
  const [activePhase, setActivePhase] = useState(null)
  const [launched, setLaunched] = useState(false)

  const next = () => setScene((s) => Math.min(s + 1, TOTAL - 1))
  const prev = () => setScene((s) => Math.max(s - 1, 0))

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft') prev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const meta = SCENES[scene]

  return (
    <div className="fixed inset-0 bg-[#060609] text-white">
      <Canvas
        camera={{ position: [0, 1, 4], fov: 55 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        <color attach="background" args={['#060609']} />
        <Suspense fallback={null}>
          {scene === 0 && <Scene1 revealed={revealed} onReveal={setRevealed} />}
          {scene === 1 && <Scene2 activeProblem={activeProblem} onSelect={setActiveProblem} />}
          {scene === 2 && <Scene3 activeWaypoint={activeWaypoint} onSelect={setActiveWaypoint} autoplay />}
          {scene === 3 && <Scene4 veil={veil} />}
          {scene === 4 && <Scene5 activePhase={activePhase} onSelect={setActivePhase} />}
          {scene === 5 && <Scene6 launched={launched} />}
        </Suspense>
      </Canvas>

      {/* progress bar */}
      <div className="pointer-events-none absolute top-0 left-0 right-0 flex gap-1 p-3">
        {SCENES.map((_, i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-colors"
            style={{ background: i <= scene ? PHASE_COLORS[Math.min(i, 5)] : 'rgba(255,255,255,0.15)' }}
          />
        ))}
      </div>
      <div className="pointer-events-none absolute top-6 left-0 right-0 text-center text-xs tracking-widest text-white/50">
        SCENE {scene + 1} / {TOTAL}
      </div>

      {/* title + subtitle */}
      <div className="pointer-events-none absolute top-16 left-0 right-0 px-6 text-center">
        <h1 className="font-display text-2xl font-bold sm:text-4xl">{meta.title}</h1>
        <p className="mt-2 text-sm text-white/60 sm:text-base">{meta.subtitle}</p>
      </div>

      {/* scene-specific overlay content */}
      <div className="pointer-events-none absolute inset-x-0 bottom-24 flex justify-center px-4">
        <div className="pointer-events-auto glass w-full max-w-lg rounded-2xl p-4 sm:p-5">
          {scene === 0 && (
            revealed ? (
              <p className="text-sm italic text-lime-300 sm:text-base">
                "What if there was an AI assistant that helps remote workers find focus?"
                <span className="mt-1 block text-xs not-italic text-white/40">3:47 AM · Maya's apartment</span>
              </p>
            ) : (
              <p className="text-center text-xs text-white/50">{meta.hint}</p>
            )
          )}

          {scene === 1 && (
            activeProblem !== null ? (
              <div>
                <p className="text-sm font-semibold" style={{ color: PROBLEMS[activeProblem].color }}>
                  {PROBLEMS[activeProblem].emoji} {PROBLEMS[activeProblem].title}
                </p>
                <p className="mt-1 text-sm text-white/70">{PROBLEMS[activeProblem].text}</p>
              </div>
            ) : (
              <p className="text-center text-xs text-white/50">{meta.hint}</p>
            )
          )}

          {scene === 2 && (
            activeWaypoint !== null ? (
              <div>
                <p className="text-sm font-semibold" style={{ color: PHASE_COLORS[activeWaypoint] }}>
                  Phase {activeWaypoint + 1}: {PHASES[activeWaypoint].name}
                </p>
                <p className="mt-1 text-sm text-white/70">{PHASES[activeWaypoint].text}</p>
              </div>
            ) : (
              <p className="text-center text-xs text-white/50">{meta.hint}</p>
            )
          )}

          {scene === 3 && (
            <div>
              <div className="mb-3 flex justify-between text-xs">
                <span className="text-pink-400">Before</span>
                <span className="text-lime-400">After</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={veil}
                onChange={(e) => setVeil(Number(e.target.value))}
                className="w-full accent-lime-400"
              />
              <p className="mt-2 text-center text-xs text-white/50">{meta.hint}</p>
            </div>
          )}

          {scene === 4 && (
            activePhase !== null ? (
              <div>
                <p className="text-sm font-semibold" style={{ color: PHASE_COLORS[activePhase] }}>
                  {activePhase + 1}. {PHASES[activePhase].name}
                </p>
                <p className="mt-1 text-sm text-white/70">{PHASES[activePhase].text}</p>
              </div>
            ) : (
              <p className="text-center text-xs text-white/50">{meta.hint}</p>
            )
          )}

          {scene === 5 && (
            <div>
              {!launched ? (
                <button
                  onClick={() => setLaunched(true)}
                  className="press mx-auto block rounded-full bg-gradient-to-r from-lime-400 to-pink-400 px-6 py-2 text-sm font-bold text-black"
                >
                  🚀 Launch
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {OUTCOME_STATS.map((s) => (
                    <div key={s.label} className="text-center">
                      <div className="text-lg font-bold text-lime-400">{s.number}</div>
                      <div className="text-[10px] text-white/50">{s.label}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* nav buttons */}
      <div className="pointer-events-auto absolute bottom-6 left-0 right-0 flex items-center justify-center gap-4 px-6">
        <button
          onClick={prev}
          disabled={scene === 0}
          className="press rounded-full border border-white/15 px-4 py-2 text-xs text-white/70 disabled:opacity-30"
        >
          ← Previous
        </button>
        <button
          onClick={next}
          disabled={scene === TOTAL - 1}
          className="press rounded-full bg-white/10 px-4 py-2 text-xs text-white disabled:opacity-30"
        >
          Next →
        </button>
      </div>
    </div>
  )
}
