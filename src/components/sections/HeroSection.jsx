import { motion } from 'framer-motion'
import { BRAND } from '../../config'
import WaitlistForm from '../ui/WaitlistForm'
import { useAnalytics, useSectionView } from '../../hooks/useAnalytics'
import { EVENTS } from '../../utils/analyticsEvents'

export default function HeroSection({ onEnter }) {
  const track = useAnalytics()
  const ref = useSectionView('hero')
  const letters = BRAND.split('')

  return (
    <section id="hero" ref={ref} className="pointer-events-none relative z-10 flex min-h-screen flex-col items-center justify-center px-5 text-center">
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.6 }}
        className="mb-5 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 font-display text-[11px] font-medium uppercase tracking-[0.35em] text-slate-300 backdrop-blur-sm"
      >
        Launching soon
      </motion.p>

      <motion.p
        className="mb-6 font-display text-base font-semibold tracking-[0.55em] text-cyan-300 md:text-xl"
        aria-label={BRAND}
      >
        {letters.map((ch, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3 + i * 0.08, duration: 0.4 }}
            aria-hidden="true"
          >
            {ch === ' ' ? ' ' : ch}
          </motion.span>
        ))}
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 26 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.2, duration: 0.8, ease: 'easeOut' }}
        className="text-glow max-w-5xl font-display text-5xl font-bold leading-[1.05] tracking-tight text-white md:text-8xl"
      >
        Your AI Stack,{' '}
        <span className="bg-gradient-to-r from-exus-purple via-exus-pink to-exus-cyan bg-clip-text text-transparent">
          Personalized
        </span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.6, duration: 0.7 }}
        className="mt-7 max-w-2xl text-base leading-relaxed text-slate-300 md:text-lg"
      >
        The AI universe is expanding faster than any one person can track.
        {' '}{BRAND} maps it to your role — for students building their edge and
        professionals with no time to fall behind.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.9, duration: 0.7 }}
        className="pointer-events-auto mt-10 flex flex-col items-center gap-5"
      >
        <WaitlistForm location="hero" />
        <button
          onClick={() => {
            track(EVENTS.CTA_CLICK, { cta: 'find_your_stack', location: 'hero' })
            onEnter()
          }}
          className="font-display text-sm font-medium tracking-wide text-slate-300 underline decoration-exus-cyan/50 underline-offset-4 transition-colors hover:text-white"
        >
          Or find your stack in 60 seconds →
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ delay: 4, duration: 2.6, repeat: Infinity }}
        className="absolute bottom-8 text-[11px] uppercase tracking-[0.35em] text-slate-500"
      >
        Scroll to explore
      </motion.div>
    </section>
  )
}
