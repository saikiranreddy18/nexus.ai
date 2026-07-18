// FounderOS scrollytelling landing — shared narrative, phase-module and beat data.
// Colors are the existing --exus-* tokens; do not invent new ones.

// Six phase modules in pipeline order. `angle` places each on the hexagonal
// blueprint (degrees, XY plane facing camera); `window` is the [start, end]
// slice of scroll progress during which the module separates from the core.
export const MODULES = [
  {
    key: 'canvas',
    name: 'Idea Canvas',
    label: 'IDEA CANVAS',
    color: '#06b6d4',
    angle: 150,
    window: [0.13, 0.34],
    desc: 'Structured thinking before AI touches anything. Force clarity on problem, customer, and unfair advantage — no blank-page paralysis.',
  },
  {
    key: 'brainstorm',
    name: 'Brainstorm',
    label: 'BRAINSTORM',
    color: '#ec4899',
    angle: 30,
    window: [0.16, 0.37],
    desc: 'An adversarial AI co-founder pushes back. Finds holes, challenges assumptions, refuses to cheerlead.',
  },
  {
    key: 'validation',
    name: 'Validation',
    label: 'VALIDATION',
    color: '#84cc16',
    angle: 210,
    window: [0.38, 0.58],
    desc: 'Founder Fit check + real demand signals. Scores the idea on realness, market timing, and whether you should be the one building it.',
  },
  {
    key: 'market',
    name: 'Market Research',
    label: 'MARKET RESEARCH',
    color: '#f59e0b',
    angle: 330,
    window: [0.41, 0.61],
    desc: 'Live web-search grounded. Real competitors named, TAM/SAM/SOM sized, positioning gap mapped — sources cited.',
  },
  {
    key: 'feasibility',
    name: 'Feasibility',
    label: 'FEASIBILITY',
    color: '#7c3aed',
    angle: 270,
    window: [0.62, 0.8],
    desc: 'Honest technical + business assessment. Every risk named, every opportunity mapped, and a scoped MVP verdict.',
  },
  {
    key: 'prompt',
    name: 'Build Prompt',
    label: 'BUILD PROMPT',
    color: '#84cc16',
    angle: 90,
    window: [0.65, 0.82],
    desc: 'A production-ready prompt: tech stack, architecture, data model, first task — ready for Claude Code, Cursor, or v0.',
  },
]

export const NAV_LINKS = [
  { label: 'How it Works', href: '#how-it-works' },
  { label: 'The Six Phases', href: '#phases' },
  { label: 'Founder Fit', href: '#founder-fit' },
  { label: 'Pricing', href: '#pricing' },
]

export const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Drop the idea in',
    text: 'A structured Idea Canvas pulls the problem, customer, and unfair advantage out of your head — before any AI opinion touches it.',
  },
  {
    step: '02',
    title: 'Get pressure-tested',
    text: 'The adversarial co-founder attacks the weak spots, then validation, market research, and feasibility score what survives.',
  },
  {
    step: '03',
    title: 'Ship the build prompt',
    text: 'Everything converges into one production-ready build prompt — stack, data model, first task. Paste it and start shipping.',
  },
]

// The mock build-prompt terminal rendered at the final beat.
export const TERMINAL_LINES = [
  { t: '$ founderos export --build-prompt', c: 'cmd' },
  { t: '', c: 'plain' },
  { t: '## Build: FocusFlow — AI focus assistant', c: 'head' },
  { t: 'stack:  Next.js 15 · Supabase · Claude API', c: 'plain' },
  { t: 'data:   users · sessions · focus_scores', c: 'plain' },
  { t: 'mvp:    onboarding → timer → weekly report', c: 'plain' },
  { t: 'risk:   notification permissions on iOS', c: 'risk' },
  { t: 'first:  scaffold auth + sessions schema', c: 'plain' },
  { t: '', c: 'plain' },
  { t: '▍ready — paste into Claude Code', c: 'ready' },
]
