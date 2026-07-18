export type PhaseId = 1 | 2 | 3 | 4 | 5 | 6;

export interface PhaseDefinition {
  id: PhaseId;
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
}

export const PHASES: PhaseDefinition[] = [
  {
    id: 1,
    slug: "idea",
    title: "Idea Intake",
    shortTitle: "Idea",
    description: "Capture and refine the core startup idea.",
  },
  {
    id: 2,
    slug: "validation",
    title: "Market Validation",
    shortTitle: "Validate",
    description: "Research the market, competitors, and demand.",
  },
  {
    id: 3,
    slug: "blueprint",
    title: "Blueprint",
    shortTitle: "Blueprint",
    description: "Turn the validated idea into a full startup blueprint.",
  },
  {
    id: 4,
    slug: "build-spec",
    title: "Build Spec",
    shortTitle: "Spec",
    description: "Generate a complete, buildable technical specification.",
  },
  {
    id: 5,
    slug: "build",
    title: "Build",
    shortTitle: "Build",
    description: "Hand the spec to the build pipeline and ship the app.",
  },
  {
    id: 6,
    slug: "operate",
    title: "Operate",
    shortTitle: "Operate",
    description: "Run and grow the live product with the agent team.",
  },
];

export const MIN_PHASE = 1;
export const MAX_PHASE = PHASES.length;

export function clampPhase(phase: number): number {
  if (Number.isNaN(phase)) return MIN_PHASE;
  return Math.min(MAX_PHASE, Math.max(MIN_PHASE, Math.trunc(phase)));
}

export function getPhase(id: number): PhaseDefinition {
  return PHASES.find((p) => p.id === clampPhase(id)) ?? PHASES[0];
}
