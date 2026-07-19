"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

import { getSupabase, isSupabaseConfigured } from "@/lib/supabase"
import { colors } from "@/lib/design-tokens"
import {
  GlassCard,
  PremiumInput,
  PremiumButton,
  PremiumLabel,
  Alert,
} from "@/components/premium/primitives"

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [message, setMessage] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [checkingSession, setCheckingSession] = React.useState(true)

  // Redirect logic: if already logged in, go to /dashboard
  React.useEffect(() => {
    if (!isSupabaseConfigured) {
      // Demo mode — no auth backend, just show the form.
      setCheckingSession(false)
      return
    }
    let cancelled = false
    getSupabase()
      .auth.getSession()
      .then(({ data: { session } }) => {
        if (cancelled) return
        if (session) {
          router.replace("/dashboard")
        } else {
          setCheckingSession(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [router])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setLoading(true)

    if (!isSupabaseConfigured) {
      // Demo mode — accept any credentials and continue to the dashboard.
      router.replace("/dashboard")
      return
    }

    const { data, error } = await getSupabase().auth.signUp({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // If email confirmation is disabled, a session is returned — go straight in.
    if (data.session) {
      router.replace("/dashboard")
      return
    }

    // Otherwise the user must confirm their email first.
    setMessage("Check your email for a confirmation link to finish signing up.")
    setLoading(false)
  }

  if (checkingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center" style={{ background: colors.bg.primary }}>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm" style={{ color: colors.text.tertiary }}>
          Loading…
        </motion.p>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4" style={{ background: colors.bg.primary }}>
      <GlassCard glow={colors.brand.lime} className="w-full max-w-sm">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="text-3xl font-bold tracking-tight mb-2"
              style={{ color: colors.text.primary, fontFamily: '"Space Grotesk", sans-serif' }}
            >
              Create your account
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              style={{ color: colors.text.tertiary }}
              className="text-sm"
            >
              Start turning your idea into a build prompt
            </motion.p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <PremiumLabel htmlFor="email">Email address</PremiumLabel>
              <PremiumInput
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                accent={colors.brand.lime}
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <PremiumLabel htmlFor="password">Password</PremiumLabel>
              <PremiumInput
                id="password"
                type="password"
                placeholder="Minimum 6 characters"
                autoComplete="new-password"
                accent={colors.brand.lime}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </motion.div>

            {error && <Alert variant="error">{error}</Alert>}
            {message && <Alert variant="success" role="status">{message}</Alert>}

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <PremiumButton type="submit" className="w-full" loading={loading}>
                {loading ? "Creating account…" : "Create account"}
              </PremiumButton>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="text-center text-sm"
              style={{ color: colors.text.tertiary }}
            >
              Already have an account?{" "}
              <Link href="/login" className="transition-colors" style={{ color: colors.brand.lime }}>
                Log in
              </Link>
            </motion.p>
          </form>
        </div>
      </GlassCard>
    </main>
  )
}
