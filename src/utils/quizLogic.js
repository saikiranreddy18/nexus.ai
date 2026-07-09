// Onboarding quiz — 5 questions. `key` is used by personaGenerator.
export const QUESTIONS = [
  {
    id: 'domain',
    text: "You're building something new. What's your playground?",
    options: [
      { key: 'code', label: 'Code & Apps' },
      { key: 'design', label: 'Design & Media' },
      { key: 'writing', label: 'Words & Content' },
      { key: 'data', label: 'Data & Insights' },
      { key: 'automation', label: 'Automation & Workflows' },
    ],
  },
  {
    id: 'learning_style',
    text: 'When you hit a wall, you usually...',
    options: [
      { key: 'search', label: 'Google it' },
      { key: 'tutorial', label: 'Watch a tutorial' },
      { key: 'ask', label: 'Ask a friend' },
      { key: 'tinker', label: 'Break it to learn it' },
      { key: 'course', label: 'Pay for a course' },
    ],
  },
  {
    id: 'budget',
    text: 'Your current AI tool budget?',
    options: [
      { key: 'free', label: '$0 — free only' },
      { key: 'low', label: '$1–10/month' },
      { key: 'mid', label: '$10–50/month' },
      { key: 'high', label: '$50+/month' },
      { key: 'company', label: 'My company pays' },
    ],
  },
  {
    id: 'goal',
    text: 'In 3 months, you want to...',
    options: [
      { key: 'ship', label: 'Ship a side project' },
      { key: 'job', label: 'Get a better job' },
      { key: 'time', label: 'Save time at work' },
      { key: 'freelance', label: 'Start freelancing' },
      { key: 'lead', label: 'Lead a team' },
    ],
  },
  {
    id: 'experience',
    text: 'Experience level with AI tools?',
    options: [
      { key: 'beginner', label: 'Total beginner' },
      { key: 'dabbler', label: 'Tried ChatGPT' },
      { key: 'regular', label: 'Use 2–3 tools regularly' },
      { key: 'builder', label: 'Building with AI' },
      { key: 'teacher', label: 'Teaching others' },
    ],
  },
]
