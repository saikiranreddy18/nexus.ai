import { generatePersona } from './personaGenerator'
import { findToolByName, getTool } from './toolsCatalog'
import { loadStack } from '../state/stackStore'

// Builds a 4-week learning roadmap from the persona's starter stack plus any
// tools the user added in Discover. Each week focuses on one tool and carries
// 3 concrete steps scaled to the user's experience level. Deterministic — the
// same profile always yields the same roadmap (backend can replace later).

const GOAL_CAPSTONE = {
  ship: 'Ship a small real project that uses your top two tools together.',
  job: 'Add your new stack to your resume and portfolio with one demo piece.',
  time: 'Automate one recurring task at work end-to-end.',
  freelance: 'Package your workflow into a service you could sell.',
  lead: 'Write a one-page playbook so your team can adopt your stack.',
}

function stepsFor(tool, level) {
  const beginnerish = level === 'beginner' || level === 'dabbler'
  return [
    beginnerish
      ? `Set up ${tool.name} and complete the official "getting started" flow.`
      : `Configure ${tool.name} for your real workflow, not the demo one.`,
    `Use ${tool.name} on one small task and note where it saves you time.`,
    beginnerish
      ? `Find one keyboard shortcut or feature that makes it click.`
      : `Push ${tool.name} to an edge case and learn where it breaks.`,
  ]
}

export function generateRoadmap() {
  const quiz = JSON.parse(localStorage.getItem('exus_quiz_v1') || 'null')
  if (!quiz?.completed) return null

  const persona = generatePersona(quiz.answers)
  const level = quiz.answers.experience

  // Order tools: starter stack first (already catalog entries), then added.
  const starter = persona.stack
    .map((s) => (s.slug ? getTool(s.slug) : findToolByName(s.name)))
    .filter(Boolean)
  const added = loadStack().map(getTool).filter(Boolean)

  const ordered = []
  const seen = new Set()
  for (const tool of [...starter, ...added]) {
    if (!seen.has(tool.slug)) { seen.add(tool.slug); ordered.push(tool) }
  }
  while (ordered.length < 3 && starter.length) ordered.push(starter[ordered.length % starter.length])

  const toolWeeks = ordered.slice(0, 3).map((tool, i) => ({
    id: `w${i + 1}`,
    week: i + 1,
    title: `Master ${tool.name}`,
    tool,
    focus: tool.blurb,
    steps: stepsFor(tool, level),
  }))

  const capstone = {
    id: 'w4',
    week: 4,
    title: 'Put it together',
    tool: null,
    focus: GOAL_CAPSTONE[quiz.answers.goal] || 'Combine your tools into one real workflow.',
    steps: [
      'Pick a real outcome you care about this month.',
      `Route it through ${toolWeeks.map((w) => w.tool.name).slice(0, 2).join(' + ')}.`,
      'Share what you built — a post, a demo, or a teammate walkthrough.',
    ],
  }

  return { persona, milestones: [...toolWeeks, capstone] }
}
