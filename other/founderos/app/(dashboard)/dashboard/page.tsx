"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { PlusIcon } from "lucide-react"
import { motion } from "framer-motion"

import { getSupabase } from "@/lib/supabase"
import { MAX_PHASE, getPhase } from "@/lib/phases"
import { colors } from "@/lib/design-tokens"
import { PremiumButton, PremiumInput, PremiumLabel, Alert } from "@/components/premium/primitives"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

const PHASE_ACCENTS = [
  colors.brand.cyan,
  colors.brand.pink,
  colors.brand.lime,
  colors.brand.gold,
  colors.brand.purple,
  colors.brand.peach,
]

interface ProjectRow {
  id: string
  name: string
  current_phase: number
  created_at: string
}

/**
 * The checked-in .env.local ships with bracketed placeholders. When Supabase
 * is not really configured we fall back to a localStorage demo store so the
 * dashboard stays fully functional in local dev (mirrors lib/projects.ts).
 */
const supabaseConfigured = (() => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return Boolean(url && key && !url.includes("[") && !key.includes("["))
})()

const DEMO_STORAGE_KEY = "founderos-demo-projects"

function readDemoProjects(): ProjectRow[] {
  try {
    const raw = window.localStorage.getItem(DEMO_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as ProjectRow[]) : []
  } catch {
    return []
  }
}

function writeDemoProjects(projects: ProjectRow[]) {
  try {
    window.localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(projects))
  } catch {
    // Storage unavailable — ignore, list lives in memory for the session.
  }
}

function formatDate(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export default function DashboardPage() {
  const router = useRouter()
  const [email, setEmail] = React.useState<string | null>(null)
  const [userId, setUserId] = React.useState<string | null>(null)
  const [projects, setProjects] = React.useState<ProjectRow[]>([])
  const [loadError, setLoadError] = React.useState<string | null>(null)
  const [ready, setReady] = React.useState(false)

  React.useEffect(() => {
    let cancelled = false

    async function load() {
      if (!supabaseConfigured) {
        // Demo mode — no auth backend available.
        if (cancelled) return
        setEmail("demo@local")
        setProjects(
          [...readDemoProjects()].sort((a, b) =>
            b.created_at.localeCompare(a.created_at)
          )
        )
        setReady(true)
        return
      }

      const supabase = getSupabase()
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (cancelled) return
      if (!session) {
        router.replace("/login")
        return
      }
      setEmail(session.user.email ?? null)
      setUserId(session.user.id)

      const { data, error } = await supabase
        .from("projects")
        .select("id, name, current_phase, created_at")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
      if (cancelled) return

      if (error) {
        setLoadError(error.message)
      } else {
        setProjects((data ?? []) as ProjectRow[])
      }
      setReady(true)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [router])

  async function handleSignOut() {
    if (supabaseConfigured) {
      await getSupabase().auth.signOut()
    }
    router.replace("/login")
  }

  async function createProject(name: string): Promise<string | null> {
    if (!supabaseConfigured) {
      const project: ProjectRow = {
        id:
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `demo-${Date.now()}`,
        name,
        current_phase: 1,
        created_at: new Date().toISOString(),
      }
      const next = [project, ...readDemoProjects()]
      writeDemoProjects(next)
      setProjects(next)
      return null
    }

    const { data, error } = await getSupabase()
      .from("projects")
      .insert({ name, current_phase: 1, user_id: userId })
      .select("id, name, current_phase, created_at")
      .single()

    if (error) return error.message
    setProjects((prev) => [data as ProjectRow, ...prev])
    return null
  }

  if (!ready) {
    return (
      <main className="flex min-h-screen items-center justify-center" style={{ background: colors.bg.primary }}>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm" style={{ color: colors.text.tertiary }}>
          Loading projects…
        </motion.p>
      </main>
    )
  }

  return (
    <main className="min-h-screen" style={{ background: colors.bg.primary }}>
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 p-8">
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-wrap items-center justify-between gap-4"
        >
          <div className="flex flex-col gap-1">
            <h1
              className="text-3xl font-bold tracking-tight"
              style={{ color: colors.text.primary, fontFamily: '"Space Grotesk", sans-serif' }}
            >
              Your projects
            </h1>
            <p className="text-sm" style={{ color: colors.text.tertiary }}>
              Signed in as {email ?? "unknown"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <CreateProjectDialog onCreate={createProject} />
            <PremiumButton variant="ghost" onClick={handleSignOut}>
              Sign out
            </PremiumButton>
          </div>
        </motion.header>

        {loadError && <Alert variant="error">Failed to load projects: {loadError}</Alert>}

        {projects.length === 0 && !loadError ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="flex flex-1 flex-col items-center justify-center gap-4 rounded-2xl border border-dashed p-16 text-center"
            style={{ borderColor: `${colors.text.primary}12`, minHeight: "50vh" }}
          >
            <div
              className="flex size-14 items-center justify-center rounded-2xl"
              style={{ background: `${colors.brand.lime}15` }}
            >
              <PlusIcon className="size-6" style={{ color: colors.brand.lime }} />
            </div>
            <p className="text-lg font-semibold" style={{ color: colors.text.primary }}>
              No projects yet
            </p>
            <p className="max-w-sm text-sm" style={{ color: colors.text.tertiary }}>
              Create your first project and the AI co-founder will take it from
              idea to a production-ready build prompt.
            </p>
            <CreateProjectDialog onCreate={createProject} />
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, i) => (
              <ProjectCard key={project.id} project={project} index={i} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

function ProjectCard({ project, index }: { project: ProjectRow; index: number }) {
  const phase = getPhase(project.current_phase)
  const progress = (phase.id / MAX_PHASE) * 100
  const accent = PHASE_ACCENTS[Math.min(phase.id - 1, PHASE_ACCENTS.length - 1)] ?? colors.brand.lime
  const [hover, setHover] = React.useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4, ease: "easeOut" }}
    >
      <Link
        href={`/project/${project.id}`}
        className="group block rounded-2xl outline-none"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
          className="relative h-full rounded-2xl border p-6"
          style={{
            background: colors.bg.secondary,
            borderColor: hover ? `${accent}40` : `${colors.text.primary}0a`,
            boxShadow: hover
              ? `0 12px 32px ${colors.bg.primary}, 0 0 24px ${accent}20`
              : `inset 0 1px 0 ${colors.text.primary}05`,
            transition: "border-color 0.2s, box-shadow 0.2s",
          }}
        >
          {/* accent bar */}
          <div
            className="absolute inset-x-0 top-0 h-0.5 rounded-t-2xl transition-opacity"
            style={{
              background: `linear-gradient(90deg, ${accent}, transparent)`,
              opacity: hover ? 1 : 0.4,
            }}
          />

          <h3
            className="truncate text-lg font-semibold"
            style={{ color: colors.text.primary, fontFamily: '"Space Grotesk", sans-serif' }}
          >
            {project.name}
          </h3>
          <p className="mt-1 text-xs" style={{ color: colors.text.muted }}>
            Created {formatDate(project.created_at)}
          </p>

          <div className="mt-6 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs" style={{ color: colors.text.tertiary }}>
              <span>
                Phase {phase.id} of {MAX_PHASE} — {phase.shortTitle}
              </span>
              <span style={{ color: accent }}>{Math.round(progress)}%</span>
            </div>
            {/* progress track */}
            <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ background: `${colors.text.primary}0d` }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ delay: index * 0.06 + 0.2, duration: 0.6, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{ background: `linear-gradient(90deg, ${accent}, ${accent}cc)` }}
              />
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  )
}

function CreateProjectDialog({
  onCreate,
}: {
  onCreate: (name: string) => Promise<string | null>
}) {
  const [open, setOpen] = React.useState(false)
  const [name, setName] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [submitting, setSubmitting] = React.useState(false)

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) {
      setName("")
      setError(null)
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      setError("Project name is required.")
      return
    }
    setError(null)
    setSubmitting(true)
    const createError = await onCreate(trimmed)
    setSubmitting(false)
    if (createError) {
      setError(createError)
      return
    }
    handleOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <PremiumButton>
          <PlusIcon className="size-4" />
          New Project
        </PremiumButton>
      </DialogTrigger>
      <DialogContent
        style={{ background: colors.bg.secondary, borderColor: `${colors.text.primary}12` }}
      >
        <DialogHeader>
          <DialogTitle style={{ color: colors.text.primary, fontFamily: '"Space Grotesk", sans-serif' }}>
            Create new project
          </DialogTitle>
          <DialogDescription style={{ color: colors.text.tertiary }}>
            New projects start in Phase 1 — Idea Intake.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <PremiumLabel htmlFor="project-name">Project name</PremiumLabel>
            <PremiumInput
              id="project-name"
              placeholder="My next startup"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              required
            />
          </div>
          {error && <Alert variant="error">{error}</Alert>}
          <DialogFooter>
            <PremiumButton type="button" variant="ghost" onClick={() => handleOpenChange(false)}>
              Cancel
            </PremiumButton>
            <PremiumButton type="submit" loading={submitting}>
              {submitting ? "Creating…" : "Create Project"}
            </PremiumButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
