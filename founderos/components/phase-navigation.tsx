"use client";

import { useState, useTransition } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

import { changePhase } from "@/app/(dashboard)/project/[id]/actions";
import { Button } from "@/components/ui/button";
import { MAX_PHASE, MIN_PHASE, getPhase } from "@/lib/phases";

interface PhaseNavigationProps {
  projectId: string;
  currentPhase: number;
}

/**
 * Previous/Next controls. Next is a single-step advance — future phases
 * beyond currentPhase + 1 stay locked, and the server action re-validates
 * the step against the DB before writing.
 */
export function PhaseNavigation({
  projectId,
  currentPhase,
}: PhaseNavigationProps) {
  const [isPending, startTransition] = useTransition();
  const [pendingDirection, setPendingDirection] = useState<
    "previous" | "next" | null
  >(null);
  const [error, setError] = useState<string | null>(null);

  const atFirst = currentPhase <= MIN_PHASE;
  const atLast = currentPhase >= MAX_PHASE;

  function navigate(direction: "previous" | "next") {
    setError(null);
    setPendingDirection(direction);
    startTransition(async () => {
      const result = await changePhase(projectId, direction);
      if (!result.ok) {
        setError(result.error ?? "Something went wrong.");
      }
      setPendingDirection(null);
    });
  }

  const nextPhase = atLast ? null : getPhase(currentPhase + 1);
  const previousPhase = atFirst ? null : getPhase(currentPhase - 1);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <Button
          variant="outline"
          onClick={() => navigate("previous")}
          disabled={atFirst || isPending}
          aria-label={
            previousPhase
              ? `Go back to phase ${previousPhase.id}: ${previousPhase.title}`
              : "No previous phase"
          }
        >
          {isPending && pendingDirection === "previous" ? (
            <Loader2 className="animate-spin" aria-hidden />
          ) : (
            <ChevronLeft aria-hidden />
          )}
          Previous
        </Button>

        <p className="text-xs text-muted-foreground max-sm:hidden">
          Phase {currentPhase} of {MAX_PHASE}
        </p>

        <Button
          onClick={() => navigate("next")}
          disabled={atLast || isPending}
          aria-label={
            nextPhase
              ? `Advance to phase ${nextPhase.id}: ${nextPhase.title}`
              : "Already at the final phase"
          }
        >
          Next
          {isPending && pendingDirection === "next" ? (
            <Loader2 className="animate-spin" aria-hidden />
          ) : (
            <ChevronRight aria-hidden />
          )}
        </Button>
      </div>

      {error && (
        <p role="alert" className="text-right text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
