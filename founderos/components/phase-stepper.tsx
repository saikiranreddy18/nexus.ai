"use client"

import { Check, Lock } from "lucide-react"
import { motion } from "framer-motion"

import { PHASES } from "@/lib/phases"
import { cn } from "@/lib/utils"
import { colors } from "@/lib/design-tokens"

interface PhaseStepperProps {
  currentPhase: number
  className?: string
}

// Each phase gets its own accent so the pipeline reads as a spectrum of stages.
const PHASE_ACCENTS = [
  colors.brand.cyan,
  colors.brand.pink,
  colors.brand.lime,
  colors.brand.gold,
  colors.brand.purple,
  colors.brand.peach,
]

/**
 * Horizontal 6-phase stepper — premium animated. Completed phases show a
 * check, the current phase is highlighted with its accent glow, and future
 * phases are locked. Scrolls horizontally on narrow screens.
 */
export function PhaseStepper({ currentPhase, className }: PhaseStepperProps) {
  return (
    <nav aria-label="Project phases" className={cn("w-full overflow-x-auto", className)}>
      <ol className="flex min-w-max items-center gap-2 py-2 sm:gap-3">
        {PHASES.map((phase, index) => {
          const accent = PHASE_ACCENTS[index] ?? colors.brand.lime
          const status =
            phase.id < currentPhase
              ? "complete"
              : phase.id === currentPhase
                ? "current"
                : "locked"

          return (
            <li key={phase.id} className="flex items-center gap-2 sm:gap-3">
              {index > 0 && (
                <motion.span
                  aria-hidden
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  className="h-px w-6 origin-left sm:w-10"
                  style={{
                    background:
                      status === "locked"
                        ? `${colors.text.primary}12`
                        : `linear-gradient(90deg, ${PHASE_ACCENTS[index - 1]}, ${accent})`,
                  }}
                />
              )}

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                aria-current={status === "current" ? "step" : undefined}
                aria-disabled={status === "locked" || undefined}
                title={`${phase.title} — ${phase.description}`}
                className="relative flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-all"
                style={{
                  background:
                    status === "current"
                      ? `${accent}18`
                      : status === "complete"
                        ? `${accent}0d`
                        : colors.bg.secondary,
                  borderColor:
                    status === "current"
                      ? `${accent}60`
                      : status === "complete"
                        ? `${accent}30`
                        : `${colors.text.primary}0d`,
                  boxShadow: status === "current" ? `0 0 20px ${accent}25` : "none",
                  opacity: status === "locked" ? 0.5 : 1,
                }}
              >
                <span
                  className="flex size-5 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
                  style={{
                    background:
                      status === "current"
                        ? accent
                        : status === "complete"
                          ? accent
                          : `${colors.text.primary}12`,
                    color:
                      status === "locked" ? colors.text.muted : colors.bg.primary,
                  }}
                >
                  {status === "complete" ? (
                    <Check className="size-3" aria-hidden />
                  ) : status === "locked" ? (
                    <Lock className="size-3" aria-hidden />
                  ) : (
                    phase.id
                  )}
                </span>
                <span
                  className="hidden font-medium whitespace-nowrap sm:inline"
                  style={{
                    color:
                      status === "current"
                        ? colors.text.primary
                        : status === "complete"
                          ? colors.text.secondary
                          : colors.text.muted,
                  }}
                >
                  {phase.shortTitle}
                </span>
                <span className="sr-only">
                  {status === "complete"
                    ? " (completed)"
                    : status === "locked"
                      ? " (locked)"
                      : " (current phase)"}
                </span>
              </motion.div>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
