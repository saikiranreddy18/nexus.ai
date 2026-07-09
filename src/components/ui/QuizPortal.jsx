import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { QUESTIONS } from '../../utils/quizLogic'
import { generatePersona } from '../../utils/personaGenerator'
import WaitlistForm from './WaitlistForm'
import { useAnalytics } from '../../hooks/useAnalytics'
import { EVENTS } from '../../utils/analyticsEvents'

// Full-screen portal overlay: 5 questions -> persona constellation result.
export default function QuizPortal({ onClose }) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [burst, setBurst] = useState(false)
  const track = useAnalytics()

  const done = step >= QUESTIONS.length
  const persona = done ? generatePersona(answers) : null

  function answer(q, opt) {
    track(EVENTS.QUIZ_ANSWER, { question: q.id, answer: opt.key })
    const nextAnswers = { ...answers, [q.id]: opt.key }
    if (step + 1 >= QUESTIONS.length) {
      track(EVENTS.QUIZ_COMPLETE, nextAnswers)
    }
    setAnswers(nextAnswers)
    setBurst(true)
    setTimeout(() => {
      setBurst(false)
      setStep(step + 1)
    }, 450)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] flex items-center justify-center bg-exus-dark/85 px-5 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label="Onboarding quiz"
    >
      <button
        onClick={onClose}
        aria-label="Close quiz"
        className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full text-xl text-slate-400 hover:bg-white/10 hover:text-white"
      >
        ✕
      </button>

      {/* insight spark burst between questions */}
      <AnimatePresence>
        {burst && (
          <motion.div
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {Array.from({ length: 14 }).map((_, i) => (
              <motion.span
                key={i}
                className="absolute h-1.5 w-1.5 rounded-full bg-exus-cyan"
                initial={{ x: 0, y: 0, opacity: 1 }}
                animate={{
                  x: Math.cos((i / 14) * Math.PI * 2) * 130,
                  y: Math.sin((i / 14) * Math.PI * 2) * 130,
                  opacity: 0,
                }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full max-w-xl">
        {!done && (
          <div className="mb-8 flex gap-1.5" aria-hidden="true">
            {QUESTIONS.map((_, i) => (
              <span
                key={i}
                className={`h-1 flex-1 rounded-full ${i < step ? 'bg-exus-cyan' : i === step ? 'bg-exus-purple' : 'bg-white/10'}`}
              />
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">
          {!done ? (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 26, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -26, scale: 0.98 }}
              transition={{ duration: 0.35 }}
            >
              <p className="mb-2 font-display text-xs uppercase tracking-[0.3em] text-cyan-400">
                Question {step + 1} of {QUESTIONS.length}
              </p>
              <h2 className="mb-8 font-display text-2xl font-bold text-white md:text-3xl">
                {QUESTIONS[step].text}
              </h2>
              <div className="flex flex-col gap-3">
                {QUESTIONS[step].options.map((opt, i) => (
                  <motion.button
                    key={opt.key}
                    onClick={() => answer(QUESTIONS[step], opt)}
                    className="glass animate-float rounded-xl px-5 py-3.5 text-left text-slate-100 transition-colors hover:border-exus-cyan/60 hover:text-white"
                    style={{ animationDelay: `${i * 0.4}s`, animationDuration: '7s' }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {opt.label}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <motion.div
                className="relative mx-auto mb-6 h-24 w-24"
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                aria-hidden="true"
              >
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-exus-purple via-exus-pink to-exus-cyan opacity-80 blur-[2px]" />
                <div className="absolute inset-[6px] rounded-full bg-exus-dark" />
                <div className="absolute inset-[18px] rounded-full bg-gradient-to-br from-exus-purple to-exus-cyan" />
              </motion.div>
              <p className="font-display text-xs uppercase tracking-[0.3em] text-cyan-400">You are a</p>
              <h2 className="text-glow mt-2 font-display text-4xl font-bold text-white">{persona.name}</h2>
              <p className="mt-3 text-slate-300">{persona.tagline}</p>

              <div className="mt-8 text-left">
                <p className="mb-3 text-center font-display text-sm font-medium text-slate-400">Your Starter Stack</p>
                <div className="grid gap-3 sm:grid-cols-3">
                  {persona.stack.map((t) => (
                    <div key={t.name} className="glass rounded-xl p-4" style={{ borderColor: `${persona.category.light}44` }}>
                      <p className="font-display text-sm font-semibold text-white">{t.name}</p>
                      <p className="mt-1 text-xs text-slate-400">{t.blurb}</p>
                    </div>
                  ))}
                </div>
              </div>

              <p className="mt-6 text-sm text-slate-400">
                Suggested plan: <span className="font-semibold text-exus-cyan">{persona.suggestedPlan}</span>
              </p>

              <div className="mt-8 flex flex-col items-center gap-4">
                <WaitlistForm location="quiz_result" />
                <a href="#pricing" onClick={onClose} className="font-display text-sm text-cyan-300 underline decoration-exus-cyan/50 underline-offset-4 hover:text-white">
                  See the plans
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
