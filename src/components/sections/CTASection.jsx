import { motion } from 'framer-motion'
import SectionShell, { fadeUp } from '../ui/SectionShell'
import WaitlistForm from '../ui/WaitlistForm'
import { BRAND } from '../../config'
import { useAnalytics } from '../../hooks/useAnalytics'
import { EVENTS } from '../../utils/analyticsEvents'

const CONTACT_EMAIL = 'hello@nexusai.app'

export default function CTASection() {
  const track = useAnalytics()

  return (
    <SectionShell id="cta" className="flex min-h-screen flex-col justify-center text-center">
      <motion.div variants={fadeUp} className="mb-6 flex justify-center">
        <span className="tape-label text-xs">✦ last call, explorer ✦</span>
      </motion.div>

      <motion.h2 variants={fadeUp} className="arcade-heading mx-auto max-w-3xl text-4xl md:text-6xl">
        Ready to Find Your AI Stack?
      </motion.h2>

      <motion.p variants={fadeUp} className="mx-auto mt-5 max-w-xl text-slate-300">
        {BRAND} is in active development. Leave your email and you'll be the
        first through the door when it launches — no spam, one announcement.
      </motion.p>

      <motion.div variants={fadeUp} className="mt-10 flex justify-center">
        <WaitlistForm location="final_cta" />
      </motion.div>

      <motion.p variants={fadeUp} className="mt-4 text-sm text-slate-500">
        No credit card. No commitment. Just first access.
      </motion.p>

      <motion.footer variants={fadeUp} id="contact" className="mt-28 border-t border-white/10 pt-10">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 md:flex-row md:justify-between">
          <p className="font-display text-sm font-bold tracking-[0.35em] text-white">{BRAND}</p>
          <nav className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm text-white font-semibold">
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              onClick={() => track(EVENTS.CTA_CLICK, { cta: 'contact', location: 'footer' })}
              className="transition-colors hover:text-cyan-300"
            >
              Contact
            </a>
            <a href="#pricing" className="transition-colors hover:text-cyan-300">Pricing</a>
            <a href="#how-it-works" className="transition-colors hover:text-cyan-300">How it works</a>
          </nav>
        </div>
        <p className="mt-8 font-display text-xs font-bold uppercase tracking-widest text-slate-500">
          © {new Date().getFullYear()} {BRAND}. All rights reserved.
        </p>
      </motion.footer>
    </SectionShell>
  )
}
