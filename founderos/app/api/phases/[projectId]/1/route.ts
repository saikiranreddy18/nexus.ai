import { NextResponse } from "next/server";
import {
  generatePhase1Response,
  type IdeaCanvas,
  type Phase1Response,
} from "@/lib/ai/phase1";
import { isAIConfigured } from "@/lib/ai/client";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

/*
 * POST /api/phases/[projectId]/1
 *
 * Runs the Phase 1 advisor review: fetches the project's idea canvas,
 * sends it to Claude via generatePhase1Response(), stores the result in
 * phase_outputs, and returns it.
 *
 * Expected Supabase tables (RLS scoped to auth.uid() via projects.user_id):
 *
 *   create table idea_canvas (
 *     project_id uuid primary key references projects (id) on delete cascade,
 *     problem text,
 *     solution text,
 *     target_customer text,
 *     unique_value text,
 *     business_model text,
 *     updated_at timestamptz not null default now()
 *   );
 *
 *   create table phase_outputs (
 *     id uuid primary key default gen_random_uuid(),
 *     project_id uuid not null references projects (id) on delete cascade,
 *     phase_number int not null check (phase_number between 1 and 6),
 *     output_json jsonb not null,
 *     created_at timestamptz not null default now()
 *   );
 *
 * Responses:
 *   200 — { project_id, phase_number: 1, output: { reaction, weakest_point, weakest_reason } }
 *   401 — no authenticated Supabase user
 *   404 — no idea canvas for this project (or project not visible to this user)
 *   500 — Claude call or database write failed
 */

// ---------------------------------------------------------------------------
// Local demo store — used only when Supabase credentials are not configured
// (the checked-in .env.local contains placeholders). Mirrors lib/projects.ts.
// ---------------------------------------------------------------------------

const demoOutputs = ((globalThis as Record<string, unknown>).__demoPhaseOutputs ??=
  new Map<string, Phase1Response>()) as Map<string, Phase1Response>;

const DEMO_CANVAS: IdeaCanvas = {
  problem: "Solo founders juggle a dozen tools to go from idea to launch.",
  solution: "An AI operating system that walks a founder from idea to a live product.",
  target_customer: "Non-technical solo founders validating their first startup.",
  unique_value: "One guided pipeline instead of a patchwork of tools and consultants.",
  business_model: "Monthly subscription with usage-based AI credits.",
};

const DEMO_OUTPUT: Phase1Response = {
  reaction:
    "[Local demo — no AI provider configured; set AI_PROVIDER plus the matching API key in .env.local for real feedback.] " +
    "The idea is coherent and targets a real pain, but it lives in a crowded space.",
  weakest_point: "business_model",
  weakest_reason:
    "Subscription plus AI credits is unproven for pre-revenue founders, who churn quickly once the initial exploration is done.",
};

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;

  try {
    // ---- Local demo path (Supabase not configured) ----------------------
    if (!isSupabaseConfigured()) {
      const output = isAIConfigured()
        ? await generatePhase1Response(DEMO_CANVAS)
        : DEMO_OUTPUT;
      demoOutputs.set(projectId, output);
      return NextResponse.json(
        { project_id: projectId, phase_number: 1, output, demo: true },
        { status: 200 }
      );
    }

    // ---- 1. Authenticate -------------------------------------------------
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ---- 2. Fetch the idea canvas (RLS scopes it to this user) ----------
    const { data: canvas, error: canvasError } = await supabase
      .from("idea_canvas")
      .select("*")
      .eq("project_id", projectId)
      .single();

    if (canvasError || !canvas) {
      return NextResponse.json(
        { error: "Idea canvas not found for this project." },
        { status: 404 }
      );
    }

    // ---- 3. Generate the Phase 1 review ----------------------------------
    const output = await generatePhase1Response(canvas as IdeaCanvas);

    // ---- 4. Save to phase_outputs ----------------------------------------
    const { error: saveError } = await supabase.from("phase_outputs").insert({
      project_id: projectId,
      phase_number: 1,
      output_json: output,
    });

    if (saveError) {
      return NextResponse.json(
        { error: "Failed to save the phase output." },
        { status: 500 }
      );
    }

    // ---- 5. Return the output --------------------------------------------
    return NextResponse.json(
      { project_id: projectId, phase_number: 1, output },
      { status: 200 }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
