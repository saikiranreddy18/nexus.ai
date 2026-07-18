import { clampPhase } from "@/lib/phases";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

export interface Project {
  id: string;
  name: string;
  description: string | null;
  current_phase: number;
  created_at: string;
}

/*
 * Expected Supabase table:
 *
 *   create table projects (
 *     id uuid primary key default gen_random_uuid(),
 *     user_id uuid not null references auth.users (id) default auth.uid(),
 *     name text not null,
 *     description text,
 *     current_phase int not null default 1 check (current_phase between 1 and 6),
 *     created_at timestamptz not null default now()
 *   );
 */

// ---------------------------------------------------------------------------
// Local demo store — used only when Supabase credentials are not configured
// (the checked-in .env.local contains placeholders). Keeps the page and
// Previous/Next navigation fully functional in local dev. Stored on
// globalThis so it survives Fast Refresh.
// ---------------------------------------------------------------------------

const demoStore = ((globalThis as Record<string, unknown>).__demoProjects ??=
  new Map<string, Project>()) as Map<string, Project>;

function getDemoProject(id: string): Project {
  let project = demoStore.get(id);
  if (!project) {
    project = {
      id,
      name: "Demo Project",
      description:
        "Local demo project (Supabase is not configured — set real keys in .env.local).",
      current_phase: 1,
      created_at: new Date().toISOString(),
    };
    demoStore.set(id, project);
  }
  return project;
}

// ---------------------------------------------------------------------------
// Data access
// ---------------------------------------------------------------------------

export async function getProject(id: string): Promise<Project | null> {
  if (!isSupabaseConfigured()) {
    return getDemoProject(id);
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("id, name, description, current_phase, created_at")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data as Project;
}

export async function updateProjectPhase(
  id: string,
  phase: number
): Promise<Project | null> {
  const nextPhase = clampPhase(phase);

  if (!isSupabaseConfigured()) {
    const project = getDemoProject(id);
    project.current_phase = nextPhase;
    return project;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .update({ current_phase: nextPhase })
    .eq("id", id)
    .select("id, name, description, current_phase, created_at")
    .single();

  if (error || !data) return null;
  return data as Project;
}
