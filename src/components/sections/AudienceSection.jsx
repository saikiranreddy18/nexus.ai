import { motion } from 'framer-motion'
import SectionShell, { fadeUp } from '../ui/SectionShell'
import Tilt from '../ui/Tilt'

const AUDIENCES = [
  {
    label: 'For students',
    title: 'Build your edge before your first job',
    text: 'The graduates who stand out next year are the ones fluent in AI tooling today. Start with free tiers, follow a path matched to your field, and walk into interviews with a working stack — not a list of buzzwords.',
    accent: '#fb7185',
  },
  {
    label: 'For working professionals',
    title: 'Adapt without carving out a sabbatical',
    text: 'Inside a Fortune 500 role there is no slack time to evaluate the flood of new AI tools. We do the scanning, keep only what fits your function, and compress the learning into paths you can run between meetings.',
    accent: '#06b6d4',
  },
]

export default function AudienceSection() {
  return (
    <SectionShell id="audience" eyebrow="Who it's for" title="Built for people who can't afford to fall behind">
      <div className="grid gap-6 md:grid-cols-2">
        {AUDIENCES.map((a) => (
          <motion.div key={a.label} variants={fadeUp}>
            <Tilt className="glass h-full rounded-2xl p-8" max={6}>
              <p className="font-display text-xs font-medium uppercase tracking-[0.3em]" style={{ color: a.accent }}>
                {a.label}
              </p>
              <h3 className="mt-4 font-display text-2xl font-semibold text-white">{a.title}</h3>
              <p className="mt-4 text-sm leading-relaxed text-slate-300">{a.text}</p>
            </Tilt>
          </motion.div>
        ))}
      </div>
    </SectionShell>
  )
}
