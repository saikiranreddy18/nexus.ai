import { FlaskConical, Hammer, Map, Rocket, Settings2 } from "lucide-react";

import { getPhase } from "@/lib/phases";

const PHASE_ICONS: Record<number, React.ComponentType<{ className?: string }>> =
  {
    2: FlaskConical,
    3: Map,
    4: Hammer,
    5: Rocket,
    6: Settings2,
  };

/** Placeholder body for phases 2-6 until their real components exist. */
export function PhasePlaceholder({ phaseId }: { phaseId: number }) {
  const phase = getPhase(phaseId);
  const Icon = PHASE_ICONS[phase.id] ?? Settings2;

  return (
    <section className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border bg-card/50 px-6 py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icon className="size-6" aria-hidden />
      </div>
      <div className="space-y-1">
        <h2 className="text-lg font-semibold tracking-tight">
          Phase {phase.id} — {phase.title}
        </h2>
        <p className="mx-auto max-w-md text-sm text-muted-foreground">
          {phase.description}
        </p>
      </div>
      <p className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
        Coming soon
      </p>
    </section>
  );
}
