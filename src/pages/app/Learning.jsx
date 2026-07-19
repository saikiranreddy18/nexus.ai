import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { generateRoadmap } from '../../utils/roadmapGenerator'
import { CATEGORY_META } from '../../utils/toolsCatalog'
import {
  loadRoadmapProgress,
  toggleStep,
  isStepDone,
  milestoneComplete,
} from '../../state/roadmapStore'
import { haptic } from '../../utils/haptics'
import Scene from '../../components/3d/Scene'

function CheckStep({ done, label, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className="press flex w-full items-start gap-3 py-2 text-left"
      aria-pressed={done}
    >
      <span
        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
        style={{
          border: '2px solid #000',
          background: done ? '#a3ff2e' : 'rgba(255,255,255,0.05)',
          boxShadow: done ? '0 0 8px #a3ff2e' : 'none',
          color: '#000',
        }}
        aria-hidden="true"
      >
        {done && (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        )}
      </span>
      <span className={`text-sm leading-relaxed font-medium ${done ? 'text-slate-500 line-through' : 'text-white'}`}>
        {label}
      </span>
    </button>
  )
}

export default function Learning() {
  const roadmap = useMemo(generateRoadmap, [])
  const [progress, setProgress] = useState(loadRoadmapProgress)

  if (!roadmap) {
    return (
      <div className="relative z-10 flex min-h-[70dvh] flex-col items-center justify-center px-5 text-center">
        <h1 className="arcade-heading text-2xl">ROADMAP NEEDS A PERSONA</h1>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-300">
          Take the 60-second quiz and we'll chart a 4-week path through the exact
          tools that fit how you work.
        </p>
        <Link to="/quiz" className="nb-btn mt-8 px-8 py-4 text-base">
          ⚡ FIND MY PATH
        </Link>
      </div>
    )
  }

  const { milestones } = roadmap
  const totalSteps = milestones.reduce((n, m) => n + m.steps.length, 0)
  const doneSteps = Object.keys(progress).filter((k) =>
    milestones.some((m) => m.steps.some((_, i) => `${m.id}:${i}` === k)),
  ).length
  const pct = Math.round((doneSteps / totalSteps) * 100)

  const firstIncomplete = milestones.findIndex((m) => !milestoneComplete(progress, m))
  const unlockedThrough = firstIncomplete === -1 ? milestones.length : firstIncomplete

  function onToggle(m, i) {
    haptic.tap()
    const next = toggleStep(m.id, i)
    setProgress({ ...next })
    if (milestoneComplete(next, m)) haptic.success()
  }

  return (
    <>
      {/* Galaxy background with scroll-driven camera shake */}
      <Scene mode="full" descend={false} scrollShake={true} />

      {/* Content overlay */}
      <div className="relative z-10 mx-auto max-w-2xl px-5 py-6 lg:py-10">
        <p className="font-display text-xs uppercase tracking-[0.2em] font-black" style={{ color: '#a3ff2e' }}>▸ LEARN</p>
        <h1 className="arcade-heading mt-2 text-3xl sm:text-4xl">YOUR 4-WEEK<br/>ORBIT</h1>

        {/* overall progress — chunky arcade bar */}
        <div className="sticker mt-6 p-4 backdrop-blur-sm bg-black/20" style={{ transform: 'rotate(0)' }}>
          <div className="flex items-center justify-between">
            <span className="font-display text-xs font-black uppercase tracking-widest text-white">
              {doneSteps} OF {totalSteps} STEPS
            </span>
            <span className="font-display text-sm font-black" style={{ color: '#a3ff2e' }}>
              {pct}%
            </span>
          </div>
          <div
            className="mt-3 h-3 overflow-hidden rounded-full"
            style={{ border: '2px solid #000', background: 'rgba(255,255,255,0.06)', boxShadow: '2px 2px 0 #000' }}
          >
            <motion.div
              className="h-full"
              style={{ background: 'linear-gradient(90deg, #a3ff2e, #ff2ea3)' }}
              initial={false}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* timeline */}
        <div className="relative mt-8 pl-8">
          <div className="absolute bottom-2 left-[11px] top-2 w-0.5" style={{ background: '#2a2740' }} aria-hidden="true" />
          {milestones.map((m, mi) => {
            const locked = mi > unlockedThrough
            const complete = milestoneComplete(progress, m)
            const meta = m.tool ? CATEGORY_META[m.tool.category] : null
            const statusLabel = complete ? 'CLEARED' : locked ? 'LOCKED' : 'IN PLAY'
            const statusColor = complete ? '#a3ff2e' : locked ? '#6b6690' : '#ff2ea3'

            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: mi * 0.06, ease: [0.16, 1, 0.3, 1] }}
                className="relative mb-6"
              >
                {/* node with glow effect */}
                <span
                  className="absolute -left-8 top-1 flex h-6 w-6 items-center justify-center rounded-full"
                  style={{
                    border: '2px solid #000',
                    background: complete ? '#a3ff2e' : locked ? '#0a0a0f' : '#ff2ea3',
                    boxShadow: complete
                      ? '0 0 10px #a3ff2e, 2px 2px 0 #000'
                      : locked
                        ? '2px 2px 0 #2a2740'
                        : '0 0 10px #ff2ea3, 2px 2px 0 #000',
                    color: '#000',
                  }}
                  aria-hidden="true"
                >
                  {complete ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                  ) : locked ? (
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#a3ff2e" strokeWidth="2"><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
                  ) : null}
                </span>

                {/* milestone card with backdrop blur */}
                <div className={`sticker p-5 backdrop-blur-sm bg-black/20 ${locked ? 'opacity-50' : ''}`} style={{ transform: 'rotate(0)' }}>
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-display text-xs font-black uppercase tracking-widest" style={{ color: statusColor }}>
                      WEEK {m.week} · {statusLabel}
                    </span>
                    {meta && (
                      <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-slate-400">
                        <span className="h-2 w-2 rounded-full" style={{ background: meta.color }} aria-hidden="true" />
                        {meta.name}
                      </span>
                    )}
                  </div>
                  <h2 className="arcade-heading lime mt-2 text-lg">{m.title.toUpperCase()}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300">{m.focus}</p>

                  {locked ? (
                    <p className="mt-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                      🔒 Finish week {m.week - 1} to unlock.
                    </p>
                  ) : (
                    <div className="mt-3 border-t-2 pt-3" style={{ borderColor: 'rgba(163,255,46,0.15)' }}>
                      {m.steps.map((step, i) => (
                        <CheckStep
                          key={i}
                          done={isStepDone(progress, m.id, i)}
                          label={step}
                          onToggle={() => onToggle(m, i)}
                        />
                      ))}
                      {m.tool && (
                        <Link
                          to={`/app/tools/${m.tool.slug}`}
                          className="press mt-3 inline-block font-display text-xs font-black uppercase tracking-wider underline underline-offset-4"
                          style={{ color: '#a3ff2e' }}
                        >
                          OPEN {m.tool.name.toUpperCase()} →
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>

        {pct === 100 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="sticker mt-2 p-5 text-center backdrop-blur-sm bg-black/20"
            style={{ transform: 'rotate(-1deg)' }}
          >
            <p className="arcade-heading lime text-lg">🏆 ORBIT CLEARED</p>
            <p className="mt-2 text-sm text-slate-300">
              You've mastered your starter stack. Add more in{' '}
              <Link to="/app/discover" className="font-black underline underline-offset-2" style={{ color: '#a3ff2e' }}>
                FIND
              </Link>{' '}
              to chart a new path.
            </p>
          </motion.div>
        )}
      </div>
    </>
  )
}
