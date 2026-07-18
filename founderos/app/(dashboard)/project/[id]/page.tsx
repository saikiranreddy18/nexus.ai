import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PhaseNavigation } from "@/components/phase-navigation";
import { PhaseStepper } from "@/components/phase-stepper";
import { PhaseOne } from "@/components/phases/phase-one";
import { Phase1IdeaCanvas } from "@/components/phases/Phase1IdeaCanvas";
import { PhasePlaceholder } from "@/components/phases/phase-placeholder";
import { clampPhase, getPhase } from "@/lib/phases";
import { getProject, type Project } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Project | Founder OS",
};

function PhaseContent({ project, phase }: { project: Project; phase: number }) {
  switch (phase) {
    case 1:
      return (
        <div className="flex flex-col gap-6">
          <PhaseOne project={project} />
          <Phase1IdeaCanvas projectId={project.id} />
        </div>
      );
    default:
      return <PhasePlaceholder phaseId={phase} />;
  }
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProject(id);

  if (!project) {
    notFound();
  }

  const currentPhase = clampPhase(project.current_phase);
  const phase = getPhase(currentPhase);

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-1">
        <h1 className="truncate text-xl font-semibold tracking-tight sm:text-2xl">
          {project.name}
        </h1>
        <p className="text-sm text-muted-foreground">
          {phase.title} &middot; step {currentPhase} of 6
        </p>
      </div>

      <PhaseStepper currentPhase={currentPhase} />

      <PhaseContent project={project} phase={currentPhase} />

      <PhaseNavigation projectId={project.id} currentPhase={currentPhase} />
    </div>
  );
}
