import { Lightbulb } from "lucide-react";

import type { Project } from "@/lib/projects";

/**
 * Phase 1 — Idea Intake. First real phase component; the rest of the
 * phases render <PhasePlaceholder /> until they are built.
 */
export function PhaseOne({ project }: { project: Project }) {
  return (
    <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Lightbulb className="size-5" aria-hidden />
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <h2 className="text-lg font-semibold tracking-tight">
            Phase 1 — Idea Intake
          </h2>
          <p className="text-sm text-muted-foreground">
            Capture the core startup idea so the agent team can take it from
            here.
          </p>
        </div>
      </div>

      <dl className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-background p-4">
          <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Project
          </dt>
          <dd className="mt-1 truncate text-sm font-medium">{project.name}</dd>
        </div>
        <div className="rounded-lg border border-border bg-background p-4">
          <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Created
          </dt>
          <dd className="mt-1 text-sm font-medium">
            {new Date(project.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </dd>
        </div>
        <div className="rounded-lg border border-border bg-background p-4 sm:col-span-2">
          <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Idea
          </dt>
          <dd className="mt-1 text-sm leading-relaxed text-foreground/90">
            {project.description ?? (
              <span className="text-muted-foreground italic">
                No idea captured yet. The idea intake form lands here next.
              </span>
            )}
          </dd>
        </div>
      </dl>
    </section>
  );
}
