"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Sparkles } from "lucide-react";

import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const BUSINESS_MODELS = ["B2B", "B2C", "B2B2C"] as const;
const CATEGORIES = [
  "SaaS",
  "Mobile",
  "Marketplace",
  "AI Tool",
  "Hardware",
  "Other",
] as const;

const ideaCanvasSchema = z.object({
  problem: z.string().min(1, "Describe the problem this idea solves."),
  target_user: z.string().min(1, "Describe who has this problem."),
  current_solution: z
    .string()
    .min(1, "Describe how people solve this today."),
  unfair_advantage: z.string().min(1, "Describe your unfair advantage."),
  success_metric: z
    .string()
    .min(1, "Describe what success looks like in 12 months."),
  business_model: z.enum(BUSINESS_MODELS, {
    error: "Select a business model.",
  }),
  category: z.enum(CATEGORIES, { error: "Select a category." }),
});

type IdeaCanvasValues = z.infer<typeof ideaCanvasSchema>;

type SubmitState =
  | { status: "idle" }
  | { status: "saving" }
  | { status: "analyzing" }
  | { status: "done"; message: string }
  | { status: "error"; message: string };

/**
 * Phase 1 — Idea Canvas. Structured intake form that captures the core
 * startup idea, persists it to the Supabase `idea_canvas` table, then
 * triggers the Phase 1 AI run via /api/phases/[projectId]/1.
 */
export function Phase1IdeaCanvas({ projectId }: { projectId: string }) {
  const [submitState, setSubmitState] = React.useState<SubmitState>({
    status: "idle",
  });

  const form = useForm<IdeaCanvasValues>({
    resolver: zodResolver(ideaCanvasSchema),
    defaultValues: {
      problem: "",
      target_user: "",
      current_solution: "",
      unfair_advantage: "",
      success_metric: "",
      business_model: undefined,
      category: undefined,
    },
  });

  const isBusy =
    submitState.status === "saving" || submitState.status === "analyzing";

  async function onSubmit(values: IdeaCanvasValues) {
    setSubmitState({ status: "saving" });

    try {
      // 1. Persist the canvas to Supabase (skipped in local demo mode).
      if (isSupabaseConfigured) {
        const supabase = getSupabase();
        const { error } = await supabase.from("idea_canvas").insert({
          project_id: projectId,
          ...values,
        });

        if (error) {
          setSubmitState({
            status: "error",
            message: `Could not save your idea canvas: ${error.message}`,
          });
          return;
        }
      }

      // 2. Trigger the Phase 1 AI run.
      setSubmitState({ status: "analyzing" });

      const response = await fetch(`/api/phases/${projectId}/1`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const text = await response.text().catch(() => "");
        setSubmitState({
          status: "error",
          message:
            `Your canvas was saved, but the AI analysis failed ` +
            `(${response.status}${text ? `: ${text.slice(0, 200)}` : ""}). ` +
            "You can resubmit to retry.",
        });
        return;
      }

      setSubmitState({
        status: "done",
        message:
          "Idea canvas saved. The AI team has started analyzing your idea.",
      });
    } catch (err) {
      setSubmitState({
        status: "error",
        message:
          err instanceof Error
            ? err.message
            : "Something went wrong. Please try again.",
      });
    }
  }

  return (
    <section className="relative overflow-hidden rounded-2xl border border-border bg-card p-8">
      {/* subtle top accent */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, #84cc16, transparent)" }}
      />
      <div className="mb-8 space-y-1.5">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4" style={{ color: "#84cc16" }} aria-hidden />
          <h2
            className="text-xl font-bold tracking-tight"
            style={{ fontFamily: '"Space Grotesk", sans-serif' }}
          >
            Idea Canvas
          </h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Answer six quick questions so the AI co-founder can pressure-test your
          idea.
        </p>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-5"
          noValidate
        >
          <FormField
            control={form.control}
            name="problem"
            render={({ field }) => (
              <FormItem>
                <FormLabel>What problem does this solve?</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="The pain point your product removes…"
                    rows={3}
                    disabled={isBusy}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="target_user"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Who has this problem?</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Your target user, e.g. seed-stage founders"
                    disabled={isBusy}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="current_solution"
            render={({ field }) => (
              <FormItem>
                <FormLabel>How are they solving it today?</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Spreadsheets, agencies, doing nothing…"
                    rows={3}
                    disabled={isBusy}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="unfair_advantage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>What is your unfair advantage?</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Distribution, domain expertise, proprietary data…"
                    rows={3}
                    disabled={isBusy}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="success_metric"
            render={({ field }) => (
              <FormItem>
                <FormLabel>What does success look like in 12 months?</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Revenue, users, funding — be specific…"
                    rows={3}
                    disabled={isBusy}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="business_model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business model</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isBusy}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a business model" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {BUSINESS_MODELS.map((model) => (
                        <SelectItem key={model} value={model}>
                          {model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isBusy}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {submitState.status === "error" && (
            <p
              role="alert"
              className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
            >
              {submitState.message}
            </p>
          )}

          {submitState.status === "done" && (
            <p
              role="status"
              className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm"
            >
              <Sparkles className="size-4 shrink-0 text-primary" aria-hidden />
              {submitState.message}
            </p>
          )}

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={isBusy}>
              {isBusy && <Loader2 className="animate-spin" aria-hidden />}
              {submitState.status === "saving"
                ? "Saving canvas…"
                : submitState.status === "analyzing"
                  ? "AI is analyzing…"
                  : "Submit idea canvas"}
            </Button>
            {submitState.status === "analyzing" && (
              <span className="text-sm text-muted-foreground">
                This can take a moment while Claude reviews your idea.
              </span>
            )}
          </div>
        </form>
      </Form>
    </section>
  );
}
