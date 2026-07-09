import { motion } from 'framer-motion'
import { fadeUp } from './SectionShell'
import { useAnalytics } from '../../hooks/useAnalytics'
import { EVENTS } from '../../utils/analyticsEvents'

export default function PricingPillar({ plan }) {
  const track = useAnalytics()

  return (
    <motion.div variants={fadeUp} className={`relative ${plan.lift}`}>
      <div
        className={`glass halo relative flex h-full flex-col rounded-2xl p-7 transition-transform duration-300 hover:-translate-y-2 ${plan.featured ? 'md:scale-[1.03]' : ''}`}
        style={{
          '--halo-soft': `${plan.accent}33`,
          '--halo-strong': `${plan.accent}${plan.featured ? '99' : '77'}`,
          borderColor: `${plan.accent}${plan.featured ? '66' : '44'}`,
          animationDuration: '4.4s',
        }}
        onMouseEnter={() => track(EVENTS.PLAN_HOVER, { plan: plan.id })}
      >
        {plan.badge && (
          <span
            className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-4 py-1 font-display text-xs font-semibold text-white"
            style={{ background: plan.accent }}
          >
            {plan.badge}
          </span>
        )}
        <div className="flex items-start justify-between">
          <div>
            <p className="font-display text-[11px] font-medium uppercase tracking-[0.3em] text-slate-500">{plan.tier}</p>
            <h3 className="mt-1 font-display text-2xl font-semibold text-white">{plan.name}</h3>
          </div>
          <span aria-hidden="true" className="stone-emblem" style={{ color: plan.accent }}>
            {plan.devanagari}
          </span>
        </div>
        <p className="mt-3 flex items-baseline gap-1">
          <span className="font-display text-5xl font-bold text-white">${plan.price}</span>
          <span className="text-sm text-slate-400">/month</span>
        </p>
        <p className="mt-3 text-xs text-slate-400">{plan.audience}</p>

        <ul className="mt-6 flex-1 space-y-2.5 text-sm text-slate-200">
          {plan.plus && <li className="font-medium" style={{ color: plan.accent }}>{plan.plus}</li>}
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
          className="mt-8 block w-full rounded-full py-3 text-center font-display font-semibold text-white transition-transform hover:scale-[1.02]"
          style={{ background: `linear-gradient(120deg, ${plan.accent}, ${plan.accent}99)` }}
        >
          Reserve {plan.name} at launch
        </a>
      </div>
    </motion.div>
  )
}
