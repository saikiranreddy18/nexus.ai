"use server";

import { refresh } from "next/cache";

import { MAX_PHASE, MIN_PHASE, clampPhase } from "@/lib/phases";
import { getProject, updateProjectPhase } from "@/lib/projects";

export interface ChangePhaseResult {
  ok: boolean;
  currentPhase?: number;
  error?: string;
}

/**
 * Move a project's current_phase one step forward or back.
 * The step is validated server-side against the project's actual phase in
 * the DB, so a stale or tampered client can never skip ahead: only
 * currentPhase +/- 1, clamped to [1, 6], is ever written.
 */
export async function changePhase(
  projectId: string,
  direction: "previous" | "next"
): Promise<ChangePhaseResult> {
  if (typeof projectId !== "string" || projectId.length === 0) {
    return { ok: false, error: "Invalid project id." };
  }

  const project = await getProject(projectId);
  if (!project) {
    return { ok: false, error: "Project not found." };
  }

  const delta = direction === "next" ? 1 : -1;
  const target = clampPhase(project.current_phase + delta);

  if (target === project.current_phase) {
    // Already at the first/last phase — nothing to do.
    return { ok: true, currentPhase: project.current_phase };
  }

  if (target > MAX_PHASE || target < MIN_PHASE) {
    return { ok: false, error: "Phase out of range." };
  }

  const updated = await updateProjectPhase(projectId, target);
  if (!updated) {
    return { ok: false, error: "Failed to update phase." };
  }

  refresh();
  return { ok: true, currentPhase: updated.current_phase };
}
