// Shared narrative + color data for the FounderOS 3D story (src/pages/Story3D.jsx)
export const PHASE_COLORS = ['#06b6d4', '#ec4899', '#84cc16', '#f59e0b', '#7c3aed', '#fb7185']

export const PHASES = [
  { name: 'Idea Canvas', text: 'Structured thinking before AI touches anything. Force clarity on problem, customer, and unfair advantage.' },
  { name: 'Brainstorm', text: 'An adversarial AI co-founder pushes back. Finds holes, challenges assumptions, refuses to cheerlead.' },
  { name: 'Validation', text: 'Founder Fit check + real demand signals. Scores the idea on realness, market timing, and founder fit.' },
  { name: 'Market Research', text: 'Live web-search grounded. Real competitors named, TAM/SAM/SOM sized, positioning gap mapped.' },
  { name: 'Feasibility', text: 'Honest technical + business assessment. Risks, opportunities, and a scoped MVP verdict.' },
  { name: 'Build Prompt', text: 'A production-ready prompt: tech stack, architecture, data model, first task — ready for Claude Code.' },
]

export const PROBLEMS = [
  { emoji: '⏰', title: 'The Build Trap', color: '#ec4899', text: 'No validation → spends 6 months building → launches to crickets.' },
  { emoji: '🎯', title: 'Analysis Paralysis', color: '#06b6d4', text: 'Gets stuck validating → reads 47 blog posts → never ships.' },
  { emoji: '🤷', title: 'The Useless Report', color: '#f59e0b', text: 'Validation tools give a score of 7/10 → no path forward.' },
]

export const OUTCOME_STATS = [
  { number: '2 weeks', label: 'From idea to customer talks' },
  { number: '7/15', label: 'Users said "yes, I want this"' },
  { number: '4 weeks', label: 'MVP built from the build prompt' },
  { number: '1 session', label: 'From raw idea to production spec' },
]

export const SCENES = [
  { title: 'The 3 AM Idea', subtitle: 'How a Founder Went from Paralyzed to Shipping', hint: 'Click the glowing laptop to see the idea' },
  { title: 'The Problem', subtitle: 'Maya had a great idea. But then...', hint: 'Click a shape to see what goes wrong' },
  { title: 'The FounderOS Journey', subtitle: 'Six phases, one session', hint: 'Click a waypoint crystal to explore it' },
  { title: 'The Transformation', subtitle: 'Before vs after FounderOS', hint: 'Drag the slider to reveal the after world' },
  { title: 'The Six Phases', subtitle: 'Each phase builds on the last', hint: 'Hover or click a crystal tower' },
  { title: 'The Outcome', subtitle: 'From idea to shipping', hint: 'Press launch to see how it ends' },
]
