import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { MotionConfig, motion, useMotionValueEvent, useScroll, useTransform } from 'framer-motion'
import { HOW_IT_WORKS, MODULES, NAV_LINKS, TERMINAL_LINES } from '../components/founderos/founderosData'

const ExplosionScene = lazy(() => import('../components/founderos/ExplosionScene'))

/* ---------- inline SVG icons (no emoji as icons) ---------- */
const ICON_PATHS = {
  canvas: <><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" /></>,
  brainstorm: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
  validation: <><path d="M12 14.5 15.5 11" /><path d="M20.3 18a9 9 0 1 0-16.6 0" /></>,
  market: <><path d="M3 3v18h18" /><path d="M8 17v-4M13 17V8M18 17v-6" /></>,
  feasibility: <><rect x="6" y="6" width="12" height="12" rx="1.5" /><rect x="9.5" y="9.5" width="5" height="5" /><path d="M9 2v2M15 2v2M9 20v2M15 20v2M2 9h2M2 15h2M20 9h2M20 15h2" /></>,
  prompt: <><path d="m4 17 6-6-6-6" /><path d="M12 19h8" /></>,
}

function Icon({ name, className = 'h-[18px] w-[18px]' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {ICON_PATHS[name]}
    </svg>
  )
}

/* ---------- shared UI atoms ---------- */
function CtaPill({ href = '#cta', children, big = false }) {
  return (
    <a
      href={href}
      className={`press inline-flex cursor-pointer items-center justify-center rounded-full bg-gradient-to-r from-[#84cc16] to-[#06b6d4] font-semibold text-[#0a0a0f] shadow-[0_0_28px_rgba(132,204,22,0.35)] transition-shadow duration-300 hover:shadow-[0_0_44px_rgba(132,204,22,0.55)] ${big ? 'px-7 py-3 text-sm md:text-[15px]' : 'px-4 py-1.5 text-xs md:text-[13px]'}`}
    >
      {children}
    </a>
  )
}

function Eyebrow({ children }) {
  return <p className="mb-3 font-mono text-[10px] tracking-[0.32em] text-white/40 md:text-[11px]">{children}</p>
}

const EASE = [0.16, 1, 0.3, 1]
const rise = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.7, ease: EASE },
}

/* ---------- navbar: near-invisible at top, glass after ~40px ---------- */
function Nav() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className={`border-b transition-all duration-500 ${scrolled ? 'border-white/[0.06] bg-[rgba(10,10,15,0.75)] backdrop-blur-xl' : 'border-transparent bg-transparent'}`}>
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5">
          <a href="#top" className="font-display text-[15px] font-bold tracking-tight text-white/90">
            Founder<span className="text-[#a3e635]">OS</span>
          </a>
          <nav className="hidden items-center gap-7 text-[13px] text-white/50 md:flex">
            {NAV_LINKS.map((l) => (
              <a key={l.href} href={l.href} className="transition-colors duration-200 hover:text-white/90">
                {l.label}
              </a>
            ))}
          </nav>
          <CtaPill>Get Early Access</CtaPill>
        </div>
      </div>
    </header>
  )
}

/* ---------- scroll-linked story beat overlay ---------- */
function Beat({ sp, io, out = [0, 1, 1, 0], align = 'center', fromX = 0, fromY, interactive = false, children }) {
  // WAAPI scroll offsets must stay within [0,1]
  const opacity = useTransform(sp, io, out)
  const x = useTransform(sp, [io[0], io[1]], [fromX, 0])
  const y = useTransform(sp, [io[0], io[1]], [fromY ?? (fromX === 0 ? 26 : 0), 0])
  const pointerEvents = useTransform(sp, (v) => (interactive && v >= io[1] - 0.02 ? 'auto' : 'none'))
  const alignCls =
    align === 'left'
      ? 'items-center justify-start pl-6 md:pl-16 lg:pl-28'
      : align === 'right'
        ? 'items-center justify-end pr-6 md:pr-16 lg:pr-28'
        : 'items-center justify-center text-center'
  return (
    <motion.div style={{ opacity, x, y, pointerEvents }} className={`absolute inset-0 flex ${alignCls}`}>
      {children}
    </motion.div>
  )
}

function Bullet({ color, children }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-[7px] h-[3px] w-5 shrink-0 rounded-full" style={{ background: color, boxShadow: `0 0 10px ${color}66` }} />
      <span className="text-[15px] leading-relaxed text-white/60">{children}</span>
    </li>
  )
}

function Terminal() {
  const colors = { cmd: 'text-white/40', head: 'text-white/85', plain: 'text-white/55', risk: 'text-[#fb7185]/85', ready: 'text-[#a3e635]' }
  return (
    <div className="mx-auto mt-7 w-full max-w-lg rounded-xl border border-[#84cc16]/25 bg-[#0c0c14]/90 text-left shadow-[0_0_70px_rgba(132,204,22,0.18)] backdrop-blur">
      <div className="flex items-center gap-1.5 border-b border-white/5 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#84cc16]/50" />
        <span className="ml-auto font-mono text-[10px] tracking-widest text-white/30">build-prompt.md</span>
      </div>
      <pre className="overflow-x-auto px-4 py-3.5 font-mono text-[11px] leading-relaxed sm:text-xs">
        {TERMINAL_LINES.map((l, i) => (
          <div key={i} className={colors[l.c]}>{l.t || ' '}</div>
        ))}
      </pre>
    </div>
  )
}

/* ---------- the sticky 420vh scrollytelling track ---------- */
function ScrollyStory() {
  const trackRef = useRef(null)
  const progressRef = useRef(0)
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ['start start', 'end end'] })
  useMotionValueEvent(scrollYProgress, 'change', (v) => { progressRef.current = v })

  return (
    <section ref={trackRef} className="relative h-[420vh]" aria-label="FounderOS product story">
      <div className="sticky top-0 h-screen overflow-hidden">
        <Suspense fallback={null}>
          <div className="absolute inset-0">
            <ExplosionScene progressRef={progressRef} />
          </div>
        </Suspense>

        {/* cinematic vignette — same base color, zero visible seams */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(120% 95% at 50% 50%, transparent 52%, rgba(10,10,15,0.6) 100%)' }}
          aria-hidden="true"
        />

        {/* Beat 1 — hero */}
        <Beat sp={scrollYProgress} io={[0, 0.02, 0.1, 0.16]} out={[1, 1, 1, 0]} fromY={0}>
          <div className="px-6">
            <Eyebrow>THE AI CO-FOUNDER</Eyebrow>
            <h1 className="fos-heading font-display text-6xl font-bold tracking-tight md:text-8xl">FounderOS</h1>
            <p className="mt-5 font-display text-lg font-medium text-white/85 md:text-2xl">
              From idea to build prompt — in one session.
            </p>
            <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-white/55">
              An AI co-founder that actually pushes back — then hands you the blueprint.
            </p>
            <div className="mt-14 flex flex-col items-center gap-2 text-white/30">
              <span className="font-mono text-[10px] tracking-[0.35em]">SCROLL</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4 animate-bounce" aria-hidden="true">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>
          </div>
        </Beat>

        {/* Beat 2 — Idea Canvas + Brainstorm */}
        <Beat sp={scrollYProgress} io={[0.16, 0.21, 0.33, 0.39]} align="left" fromX={-44}>
          <div className="max-w-md pr-6">
            <Eyebrow>
              <span className="text-[#06b6d4]">01 IDEA CANVAS</span>
              <span className="mx-2 text-white/20">·</span>
              <span className="text-[#ec4899]">02 BRAINSTORM</span>
            </Eyebrow>
            <h2 className="fos-heading font-display text-4xl font-bold tracking-tight md:text-5xl">An idea, pressure-tested.</h2>
            <ul className="mt-6 space-y-3">
              <Bullet color="#06b6d4">Structured canvas first — no blank-page paralysis.</Bullet>
              <Bullet color="#ec4899">Then an adversarial co-founder finds the holes before your users do.</Bullet>
            </ul>
          </div>
        </Beat>

        {/* Beat 3 — Validation + Market Research */}
        <Beat sp={scrollYProgress} io={[0.41, 0.46, 0.59, 0.65]} align="right" fromX={44}>
          <div className="max-w-md pl-6">
            <Eyebrow>
              <span className="text-[#a3e635]">03 VALIDATION</span>
              <span className="mx-2 text-white/20">·</span>
              <span className="text-[#f59e0b]">04 MARKET RESEARCH</span>
            </Eyebrow>
            <h2 className="fos-heading font-display text-4xl font-bold tracking-tight md:text-5xl">
              Validated before you write a line of code.
            </h2>
            <ul className="mt-6 space-y-3">
              <Bullet color="#84cc16">Real demand signals, not a vibes-based score.</Bullet>
              <Bullet color="#06b6d4">Founder Fit check — are you the right person to build this?</Bullet>
              <Bullet color="#f59e0b">Competitors named, market sized, sources cited.</Bullet>
            </ul>
          </div>
        </Beat>

        {/* Beat 4 — Feasibility */}
        <Beat sp={scrollYProgress} io={[0.66, 0.71, 0.8, 0.85]} align="left" fromX={-44}>
          <div className="max-w-md pr-6">
            <Eyebrow>
              <span className="text-[#a78bfa]">05 FEASIBILITY</span>
            </Eyebrow>
            <h2 className="fos-heading font-display text-4xl font-bold tracking-tight md:text-5xl">
              An honest blueprint, not a pep talk.
            </h2>
            <ul className="mt-6 space-y-3">
              <Bullet color="#7c3aed">Technical and business feasibility scored — plainly.</Bullet>
              <Bullet color="#fb7185">Every risk named. Every opportunity mapped. No hand-waving.</Bullet>
            </ul>
          </div>
        </Beat>

        {/* Beat 5 — reassembly into the Build Prompt + CTA */}
        <Beat sp={scrollYProgress} io={[0.86, 0.93, 0.999, 1]} out={[0, 1, 1, 1]} interactive>
          <div className="w-full px-6">
            <Eyebrow>
              <span className="text-[#a3e635]">06 BUILD PROMPT</span>
            </Eyebrow>
            <h2 className="fos-heading font-display text-4xl font-bold tracking-tight md:text-6xl">Idea in. Build prompt out.</h2>
            <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-white/55">
              FounderOS — the co-founder that ends in something you can actually build.
            </p>
            <Terminal />
            <div className="mt-8 flex flex-wrap items-center justify-center gap-5">
              <CtaPill big>Start Your Build</CtaPill>
              <a href="#how-it-works" className="cursor-pointer text-sm text-white/50 transition-colors hover:text-white/90">
                See how it works
              </a>
            </div>
            <p className="mt-5 font-mono text-[11px] text-white/30">
              Paste it into Claude Code, Cursor, or v0 — and start shipping.
            </p>
          </div>
        </Beat>
      </div>
    </section>
  )
}

/* ---------- reduced-motion fallback hero ---------- */
function StaticHero() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden text-center">
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(60% 45% at 50% 40%, rgba(132,204,22,0.09), transparent 70%), radial-gradient(50% 40% at 70% 70%, rgba(6,182,212,0.06), transparent 70%)' }}
        aria-hidden="true"
      />
      <div className="relative px-6">
        <Eyebrow>THE AI CO-FOUNDER</Eyebrow>
        <h1 className="fos-heading font-display text-6xl font-bold tracking-tight md:text-8xl">FounderOS</h1>
        <p className="mt-5 font-display text-lg font-medium text-white/85 md:text-2xl">From idea to build prompt — in one session.</p>
        <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-white/55">
          An AI co-founder that actually pushes back — then hands you the blueprint.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-5">
          <CtaPill big>Get Early Access</CtaPill>
          <a href="#how-it-works" className="cursor-pointer text-sm text-white/50 transition-colors hover:text-white/90">See how it works</a>
        </div>
      </div>
    </section>
  )
}

/* ---------- below-the-fold sections ---------- */
function SectionHead({ eyebrow, title, sub }) {
  return (
    <motion.div {...rise} className="mx-auto max-w-2xl text-center">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="fos-heading font-display text-3xl font-bold tracking-tight md:text-5xl">{title}</h2>
      {sub && <p className="mt-4 text-[15px] leading-relaxed text-white/55">{sub}</p>}
    </motion.div>
  )
}

function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-24 md:py-32">
      <SectionHead eyebrow="HOW IT WORKS" title="One session. Three moves." />
      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {HOW_IT_WORKS.map((s, i) => (
          <motion.div
            key={s.step}
            {...rise}
            transition={{ ...rise.transition, delay: i * 0.08 }}
            className="rounded-2xl border border-white/[0.07] bg-[#12121c]/60 p-7"
          >
            <div className="font-mono text-sm text-[#a3e635]/70">{s.step}</div>
            <h3 className="mt-3 font-display text-lg font-semibold text-white/90">{s.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-white/55">{s.text}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

function SixPhases() {
  return (
    <section id="phases" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-24 md:py-32">
      <SectionHead
        eyebrow="THE SIX PHASES"
        title="A pipeline, not a chat."
        sub="Each phase builds on the last — the output of the whole system is one production-ready build prompt."
      />
      <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MODULES.map((m, i) => (
          <motion.div
            key={m.key}
            {...rise}
            transition={{ ...rise.transition, delay: (i % 3) * 0.07 }}
            className="group rounded-2xl border border-white/[0.07] bg-[#12121c]/60 p-6 transition-colors duration-300"
            style={{ '--ph': m.color }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${m.color}55` }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '' }}
          >
            <div className="flex items-center justify-between">
              <span
                className="flex h-9 w-9 items-center justify-center rounded-lg"
                style={{ color: m.color, background: `${m.color}14`, border: `1px solid ${m.color}33` }}
              >
                <Icon name={m.key} />
              </span>
              <span className="font-mono text-xs text-white/25">{String(i + 1).padStart(2, '0')}</span>
            </div>
            <h3 className="mt-4 font-display text-lg font-semibold text-white/90">{m.name}</h3>
            <p className="mt-2 text-sm leading-relaxed text-white/55">{m.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

const FIT_BARS = [
  { label: 'Skills match', value: 90, color: '#06b6d4' },
  { label: 'Distribution edge', value: 70, color: '#f59e0b' },
  { label: 'Time runway', value: 80, color: '#84cc16' },
]

function FounderFit() {
  return (
    <section id="founder-fit" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-24 md:py-32">
      <div className="grid items-center gap-12 md:grid-cols-2">
        <motion.div {...rise}>
          <Eyebrow>FOUNDER FIT</Eyebrow>
          <h2 className="fos-heading font-display text-3xl font-bold tracking-tight md:text-5xl">
            Are you the right founder for this idea?
          </h2>
          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-white/55">
            Most validation tools score the idea. FounderOS also scores the match — your skills, your unfair
            advantage, your runway — because a great idea in the wrong hands is still a bad bet.
          </p>
          <ul className="mt-6 space-y-3">
            <Bullet color="#06b6d4">Skills and domain edge, weighed against what the build demands.</Bullet>
            <Bullet color="#f59e0b">Distribution reality check — can you actually reach these users?</Bullet>
            <Bullet color="#84cc16">A plain verdict: build it, reshape it, or walk away.</Bullet>
          </ul>
        </motion.div>
        <motion.div {...rise} transition={{ ...rise.transition, delay: 0.1 }} className="mx-auto w-full max-w-sm rounded-2xl border border-white/[0.07] bg-[#12121c]/60 p-8">
          <div className="flex items-center justify-center">
            <div
              className="relative flex h-44 w-44 items-center justify-center rounded-full"
              style={{ background: 'conic-gradient(from -110deg, #84cc16 0deg, #06b6d4 295deg, rgba(255,255,255,0.07) 295deg 360deg)' }}
              role="img"
              aria-label="Founder fit score: 82 out of 100, strong fit"
            >
              <div className="flex h-[152px] w-[152px] flex-col items-center justify-center rounded-full bg-[#0e0e17]">
                <span className="font-display text-5xl font-bold text-white/90">82</span>
                <span className="mt-1 font-mono text-[10px] tracking-[0.25em] text-[#a3e635]">STRONG FIT</span>
              </div>
            </div>
          </div>
          <div className="mt-8 space-y-4">
            {FIT_BARS.map((b) => (
              <div key={b.label}>
                <div className="flex justify-between text-xs text-white/50">
                  <span>{b.label}</span>
                  <span className="font-mono">{b.value / 10}/10</span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${b.value}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.9, ease: EASE, delay: 0.2 }}
                    className="h-full rounded-full"
                    style={{ background: b.color, boxShadow: `0 0 10px ${b.color}55` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

const PRICING = [
  {
    name: 'Explorer',
    price: 'Free',
    note: 'For testing the waters',
    features: ['One full six-phase run', 'Idea Canvas + adversarial brainstorm', 'Validation & feasibility scores', 'Build prompt export'],
    cta: 'Start free',
    featured: false,
  },
  {
    name: 'Founding Member',
    price: '$19',
    note: 'per month — early-access price, locked forever',
    features: ['Unlimited idea runs', 'Live web-grounded market research', 'Founder Fit deep report', 'Claude Code / Cursor / v0 export', 'Priority access to new phases'],
    cta: 'Get Early Access',
    featured: true,
  },
]

function Pricing() {
  return (
    <section id="pricing" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-24 md:py-32">
      <SectionHead eyebrow="PRICING" title="Cheaper than six months of building the wrong thing." />
      <div className="mx-auto mt-14 grid max-w-3xl gap-6 md:grid-cols-2">
        {PRICING.map((p, i) => (
          <motion.div key={p.name} {...rise} transition={{ ...rise.transition, delay: i * 0.08 }}
            className={p.featured ? 'rounded-2xl bg-gradient-to-b from-[#84cc16]/60 via-[#84cc16]/20 to-[#06b6d4]/30 p-px shadow-[0_0_50px_rgba(132,204,22,0.12)]' : 'rounded-2xl border border-white/[0.07]'}
          >
            <div className={`flex h-full flex-col rounded-[15px] p-7 ${p.featured ? 'bg-[#0d0d16]' : 'bg-[#12121c]/60'}`}>
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-semibold text-white/90">{p.name}</h3>
                {p.featured && (
                  <span className="rounded-full border border-[#84cc16]/40 bg-[#84cc16]/10 px-2.5 py-0.5 font-mono text-[9px] tracking-[0.2em] text-[#a3e635]">
                    EARLY ACCESS
                  </span>
                )}
              </div>
              <div className="mt-4 font-display text-4xl font-bold text-white/90">{p.price}</div>
              <p className="mt-1 text-xs text-white/40">{p.note}</p>
              <ul className="mt-6 flex-1 space-y-2.5">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-white/60">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#a3e635" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true">
                      <path d="m5 13 4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-7">
                {p.featured ? (
                  <CtaPill big>{p.cta}</CtaPill>
                ) : (
                  <a href="#cta" className="press inline-flex cursor-pointer items-center rounded-full border border-white/15 px-6 py-2.5 text-sm text-white/70 transition-colors hover:border-white/30 hover:text-white">
                    {p.cta}
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

function Waitlist() {
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)
  return (
    <section id="cta" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-24 md:py-36">
      <motion.div {...rise} className="mx-auto max-w-xl text-center">
        <Eyebrow>GET EARLY ACCESS</Eyebrow>
        <h2 className="fos-heading font-display text-3xl font-bold tracking-tight md:text-5xl">Stop planning. Start building.</h2>
        <p className="mt-4 text-[15px] leading-relaxed text-white/55">
          Join the early-access list — your first idea run is on us.
        </p>
        {done ? (
          <div className="mx-auto mt-8 flex max-w-md items-center justify-center gap-3 rounded-full border border-[#84cc16]/30 bg-[#84cc16]/10 px-6 py-3.5 text-sm text-[#d9f99d]" role="status">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
              <path d="m5 13 4 4L19 7" />
            </svg>
            You&rsquo;re on the list — we&rsquo;ll send your invite soon.
          </div>
        ) : (
          <form
            className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault()
              if (email.includes('@')) setDone(true)
            }}
          >
            <label htmlFor="fos-email" className="sr-only">Email address</label>
            <input
              id="fos-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@startup.com"
              className="min-h-[46px] flex-1 rounded-full border border-white/10 bg-white/[0.05] px-5 text-sm text-white/85 placeholder:text-white/30 focus:border-[#84cc16]/50 focus:outline-none focus:ring-2 focus:ring-[#84cc16]/25"
            />
            <button
              type="submit"
              className="press min-h-[46px] cursor-pointer rounded-full bg-gradient-to-r from-[#84cc16] to-[#06b6d4] px-7 text-sm font-semibold text-[#0a0a0f] shadow-[0_0_28px_rgba(132,204,22,0.35)] transition-shadow hover:shadow-[0_0_44px_rgba(132,204,22,0.55)]"
            >
              Get Early Access
            </button>
          </form>
        )}
        <p className="mt-5 font-mono text-[11px] text-white/30">Paste it into Claude Code, Cursor, or v0 — and start shipping.</p>
      </motion.div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t border-white/[0.05]">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-10 text-xs text-white/35 md:flex-row">
        <span className="font-display text-sm font-bold text-white/70">
          Founder<span className="text-[#a3e635]">OS</span>
        </span>
        <nav className="flex gap-6">
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} className="transition-colors hover:text-white/70">{l.label}</a>
          ))}
        </nav>
        <span>© 2026 FounderOS. From idea to build prompt.</span>
      </div>
    </footer>
  )
}

/* ---------- page ---------- */
import { Component } from 'react'
class DebugBoundary extends Component {
  constructor(p) { super(p); this.state = { err: null } }
  static getDerivedStateFromError(err) { return { err } }
  render() {
    if (this.state.err) return <pre id="fos-err" style={{ color: '#f66', padding: 40, whiteSpace: 'pre-wrap' }}>{String(this.state.err.stack || this.state.err)}</pre>
    return this.props.children
  }
}

export default function FounderOSLanding() {
  const reduced = useMemo(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  )

  useEffect(() => {
    const prev = document.title
    document.title = 'FounderOS — From idea to build prompt, in one session'
    return () => { document.title = prev }
  }, [])

  return (
    <DebugBoundary>
    <MotionConfig reducedMotion="user">
      <div id="top" className="min-h-screen bg-[#0a0a0f] text-white">
        <Nav />
        {reduced ? <StaticHero /> : <ScrollyStory />}
        <HowItWorks />
        <SixPhases />
        <FounderFit />
        <Pricing />
        <Waitlist />
        <Footer />
      </div>
    </MotionConfig>
    </DebugBoundary>
  )
}
