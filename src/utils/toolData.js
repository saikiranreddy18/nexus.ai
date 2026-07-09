// The six tool categories rendered as planets in the 3D scene.
export const CATEGORIES = [
  {
    id: 'code',
    name: 'Code',
    color: '#1e40af',
    light: '#22c55e',
    count: 142,
    tools: [
      { name: 'Claude Code', blurb: 'Agentic coding in your terminal and IDE.' },
      { name: 'Cursor', blurb: 'AI-first code editor built on VS Code.' },
      { name: 'GitHub Copilot', blurb: 'Inline completions across every major IDE.' },
    ],
  },
  {
    id: 'design',
    name: 'Design',
    color: '#7c3aed',
    light: '#ec4899',
    count: 98,
    tools: [
      { name: 'Midjourney', blurb: 'High-fidelity image generation from prompts.' },
      { name: 'Figma AI', blurb: 'Generate and iterate UI right on the canvas.' },
      { name: 'Recraft', blurb: 'Vector art, icons and brand assets with AI.' },
    ],
  },
  {
    id: 'writing',
    name: 'Writing',
    color: '#b45309',
    light: '#f59e0b',
    count: 116,
    tools: [
      { name: 'Claude', blurb: 'Long-form drafting, editing and research.' },
      { name: 'Jasper', blurb: 'Marketing copy tuned to your brand voice.' },
      { name: 'Grammarly', blurb: 'Real-time rewriting and tone adjustment.' },
    ],
  },
  {
    id: 'data',
    name: 'Data',
    color: '#0f766e',
    light: '#06b6d4',
    count: 87,
    tools: [
      { name: 'Julius AI', blurb: 'Chat with your datasets, get instant charts.' },
      { name: 'Hex Magic', blurb: 'AI-assisted notebooks for data teams.' },
      { name: 'Claude for Sheets', blurb: 'LLM functions inside your spreadsheets.' },
    ],
  },
  {
    id: 'automation',
    name: 'Automation',
    color: '#15803d',
    light: '#84cc16',
    count: 74,
    tools: [
      { name: 'Zapier AI', blurb: 'Describe a workflow, get it wired up.' },
      { name: 'n8n', blurb: 'Open-source automation with AI nodes.' },
      { name: 'Make', blurb: 'Visual scenario builder with AI modules.' },
    ],
  },
  {
    id: 'learning',
    name: 'Learning',
    color: '#be4a5f',
    light: '#fb7185',
    count: 63,
    tools: [
      { name: 'NotebookLM', blurb: 'Turn your sources into study guides.' },
      { name: 'Khanmigo', blurb: 'Socratic AI tutor for any subject.' },
      { name: 'Anki + AI', blurb: 'Auto-generated spaced-repetition decks.' },
    ],
  },
]
