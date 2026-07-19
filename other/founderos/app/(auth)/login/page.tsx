"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

import { getSupabase, isSupabaseConfigured } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { colors, motion as motionTokens, spacing } from "@/lib/design-tokens"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
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
    setLoading(true)

    if (!isSupabaseConfigured) {
      // Demo mode — accept any credentials and continue to the dashboard.
      router.replace("/dashboard")
      return
    }

    const { error } = await getSupabase().auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.replace("/dashboard")
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-sm"
      >
        {/* Glassmorphic background glow */}
        <div
          className="absolute inset-0 blur-3xl rounded-2xl -z-10"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${colors.brand.cyan}15, transparent 70%)`,
          }}
        />

        {/* Premium card */}
        <div
          className="relative rounded-2xl border p-8"
          style={{
            background: colors.bg.secondary,
            borderColor: `${colors.text.primary}08`,
            boxShadow: `inset 0 1px 0 ${colors.text.primary}05, 0 8px 32px ${colors.bg.primary}80`,
          }}
        >
          {/* Header */}
          <div className="mb-8">
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="text-3xl font-bold tracking-tight mb-2"
              style={{ color: colors.text.primary, fontFamily: '"Space Grotesk", sans-serif' }}
            >
              Welcome back
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              style={{ color: colors.text.tertiary }}
              className="text-sm"
            >
              Enter your credentials to continue
            </motion.p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email field */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-2"
            >
              <Label htmlFor="email" className="text-sm font-medium" style={{ color: colors.text.secondary }}>
                Email address
              </Label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border transition-all outline-none text-sm"
                style={{
                  background: colors.bg.primary,
                  borderColor: `${colors.text.primary}10`,
                  color: colors.text.primary,
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = colors.brand.cyan
                  e.currentTarget.style.boxShadow = `0 0 0 3px ${colors.brand.cyan}15`
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = `${colors.text.primary}10`
                  e.currentTarget.style.boxShadow = "none"
                }}
              />
            </motion.div>

            {/* Password field */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="space-y-2"
            >
              <Label htmlFor="password" className="text-sm font-medium" style={{ color: colors.text.secondary }}>
                Password
              </Label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border transition-all outline-none text-sm"
                style={{
                  background: colors.bg.primary,
                  borderColor: `${colors.text.primary}10`,
                  color: colors.text.primary,
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = colors.brand.cyan
                  e.currentTarget.style.boxShadow = `0 0 0 3px ${colors.brand.cyan}15`
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = `${colors.text.primary}10`
                  e.currentTarget.style.boxShadow = "none"
                }}
              />
            </motion.div>

            {/* Error message */}
            {error && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                role="alert"
                className="text-sm rounded-lg p-3"
                style={{ background: `${colors.brand.peach}15`, color: colors.brand.peach }}
              >
                {error}
              </motion.p>
            )}

            {/* Submit button */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2"
              style={{
                background: `linear-gradient(135deg, ${colors.brand.lime}, ${colors.brand.cyan})`,
                color: colors.bg.primary,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-transparent border-t-current rounded-full"
                  />
                  Signing in…
                </>
              ) : (
                "Sign in"
              )}
            </motion.button>

            {/* Sign up link */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="text-center text-sm"
              style={{ color: colors.text.tertiary }}
            >
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="transition-colors"
                style={{ color: colors.brand.lime }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = colors.brand.cyan
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = colors.brand.lime
                }}
              >
                Sign up
              </Link>
            </motion.p>
          </form>
        </div>
      </motion.div>
    </main>
  )
}
