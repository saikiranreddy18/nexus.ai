import { CATEGORIES } from './toolData'

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

// answers: { domain, learning_style, budget, goal, experience }
export function generatePersona(answers) {
  const adj = EXPERIENCE_ADJ[answers.experience] || 'Curious'
  const noun = DOMAIN_NOUN[answers.domain] || 'Explorer'
  const category = CATEGORIES.find((c) => c.id === answers.domain) || CATEGORIES[0]

  return {
    name: `${adj} ${noun}`,
    tagline: GOAL_TAGLINE[answers.goal] || 'You are mapping your own path through AI.',
    category,
    stack: category.tools,
    suggestedPlan:
      answers.budget === 'free' || answers.budget === 'low'
        ? 'Shishya'
        : answers.goal === 'lead'
          ? 'Pandava'
          : 'Guru',
  }
}
