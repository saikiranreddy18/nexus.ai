import { TOOLS, CATEGORY_META } from './toolsCatalog'

const DOMAIN_NOUN = {
  code: 'Builder',
  design: 'Design Engineer',
  writing: 'Storyteller',
  data: 'Analyst',
  automation: 'Systems Thinker',
}

const EXPERIENCE_ADJ = {
  beginner: 'Curious',
  dabbler: 'Emerging',
  regular: 'Practical',
  builder: 'Ambitious',
  teacher: 'Visionary',
}

const GOAL_TAGLINE = {
  ship: 'You turn ideas into shipped projects.',
  job: 'You are stacking skills that hiring managers notice.',
  time: 'You reclaim hours from repetitive work.',
  freelance: 'You are building an independent practice.',
  lead: 'You set the AI direction others follow.',
}

// Recognisable flagship tools per domain. The source data has no popularity
// signal, so this small curated list keeps a fresh user's starter stack full
// of names they'll actually recognise, with accessibility scoring as tiebreak.
const FLAGSHIP = {
  code: ['Claude Code', 'Cursor', 'GitHub Copilot', 'Windsurf', 'Replit'],
  design: ['Midjourney', 'Canva', 'Figma', 'Adobe Firefly', 'Runway'],
  writing: ['ChatGPT', 'Claude', 'Grammarly', 'Notion AI', 'Jasper'],
  data: ['Perplexity', 'Julius', 'ChatGPT', 'Hex', 'Tableau'],
  automation: ['Zapier', 'n8n', 'Make', 'Gumloop', 'Lindy'],
  learning: ['NotebookLM', 'Khanmigo', 'Duolingo', 'Quizlet', 'Gamma'],
}

// Rank a domain's tools so the starter stack leads with recognisable flagships,
// then favours approachable, active, low-cost picks for a fresh user.
function starterScore(t, flagships) {
  let s = 0
  const rank = flagships.indexOf(t.name)
  if (rank !== -1) s += 20 - rank // flagship order wins decisively
  if (t.price === 'freemium') s += 3
  else if (t.price === 'free') s += 2
  if (t.level === 'beginner') s += 2
  else if (t.level === 'intermediate') s += 1
  if (t.status === 'Active') s += 1
  if (t.year) s += Math.max(0, t.year - 2021) * 0.3 // gentle recency nudge
  return s
}

// answers: { domain, learning_style, budget, goal, experience }
export function generatePersona(answers) {
  const domain = answers?.domain && CATEGORY_META[answers.domain] ? answers.domain : 'code'
  const meta = CATEGORY_META[domain]
  const adj = EXPERIENCE_ADJ[answers?.experience] || 'Curious'
  const noun = DOMAIN_NOUN[domain] || 'Explorer'

  const flagships = FLAGSHIP[domain] || []
  const stack = TOOLS
    .filter((t) => t.category === domain)
    .sort((a, b) => starterScore(b, flagships) - starterScore(a, flagships) || a.name.localeCompare(b.name))
    .slice(0, 3)

  return {
    name: `${adj} ${noun}`,
    tagline: GOAL_TAGLINE[answers?.goal] || 'You are mapping your own path through AI.',
    category: { id: domain, name: meta.name, color: meta.color },
    stack,
    suggestedPlan:
      answers?.budget === 'free' || answers?.budget === 'low'
        ? 'Shishya'
        : answers?.goal === 'lead'
          ? 'Pandava'
          : 'Guru',
  }
}
