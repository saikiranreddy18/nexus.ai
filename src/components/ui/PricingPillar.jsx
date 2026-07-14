import { motion } from 'framer-motion'
import { fadeUp } from './SectionShell'
import { useAnalytics } from '../../hooks/useAnalytics'
import { EVENTS } from '../../utils/analyticsEvents'

// Sticker-shadow color per plan so the three pillars read lime / pink / cyan.
const STICKER_VARIANT = { shishya: '', guru: 'pink', pandava: 'cyan' }

export default function PricingPillar({ plan }) {
  const track = useAnalytics()

  return (
    <motion.div variants={fadeUp} className={`relative ${plan.lift}`}>
      <div
        className={`sticker ${STICKER_VARIANT[plan.id] ?? ''} relative flex h-full flex-col p-7 ${plan.featured ? 'md:scale-[1.03]' : ''}`}
        onMouseEnter={() => track(EVENTS.PLAN_HOVER, { plan: plan.id })}
      >
        {plan.badge && (
          <span className="tape-label absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap" style={{ fontSize: 10, padding: '5px 14px' }}>
            {plan.badge}
          </span>
        )}
        <div className="flex items-start justify-between">
          <div>
            <p className="font-display text-[11px] font-black uppercase tracking-[0.3em] text-lime-400">{plan.tier}</p>
            <h3 className="mt-1 font-display text-2xl font-black uppercase italic text-white">{plan.name}</h3>
          </div>
          <span aria-hidden="true" className="stone-emblem" style={{ color: plan.accent }}>
            {plan.devanagari}
          </span>
        </div>
        <p className="mt-3 flex items-baseline gap-1">
          <span className="font-display text-5xl font-black italic text-white" style={{ textShadow: '3px 3px 0 #000' }}>
            ${plan.price}
          </span>
          <span className="text-sm font-bold text-slate-400">/month</span>
        </p>
        <p className="mt-3 text-xs text-slate-400">{plan.audience}</p>

        <ul className="mt-6 flex-1 space-y-2.5 text-sm text-slate-200">
          {plan.plus && <li className="font-display font-black uppercase text-cyan-300">{plan.plus}</li>}
          {plan.features.map((f) => (
            <li key={f} className="flex gap-2">
              <span aria-hidden="true" style={{ color: plan.accent }}>✦</span>
              {f}
            </li>
          ))}
        </ul>

        <a
          href="#cta"
          onClick={() => track(EVENTS.PLAN_SELECT, { plan: plan.id, price: plan.price })}
          className={`nb-btn ${plan.id === 'guru' ? 'pink' : plan.id === 'pandava' ? 'cyan' : ''} mt-8 block w-full py-3 text-center text-sm`}
        >
          Reserve {plan.name} at launch
        </a>
      </div>
    </motion.div>
  )
}
