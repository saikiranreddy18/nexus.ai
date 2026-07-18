"use client"

import * as React from "react"
import { motion, type HTMLMotionProps } from "framer-motion"
import { colors } from "@/lib/design-tokens"

/* ------------------------------------------------------------------ */
/* GlassCard — premium elevated surface with subtle glow               */
/* ------------------------------------------------------------------ */
export function GlassCard({
  children,
  glow = colors.brand.cyan,
  className = "",
  ...props
}: {
  children: React.ReactNode
  glow?: string
  className?: string
} & HTMLMotionProps<"div">) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`relative ${className}`}
      {...props}
    >
      <div
        className="absolute inset-0 blur-3xl rounded-2xl -z-10 opacity-60"
        style={{ background: `radial-gradient(circle at 50% 0%, ${glow}12, transparent 70%)` }}
      />
      <div
        className="relative rounded-2xl border"
        style={{
          background: colors.bg.secondary,
          borderColor: `${colors.text.primary}0a`,
          boxShadow: `inset 0 1px 0 ${colors.text.primary}08, 0 8px 32px ${colors.bg.primary}80`,
        }}
      >
        {children}
      </div>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/* PremiumInput — dark input with focus glow                           */
/* ------------------------------------------------------------------ */
export const PremiumInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { accent?: string }
>(function PremiumInput({ accent = colors.brand.cyan, style, ...props }, ref) {
  return (
    <input
      ref={ref}
      className="w-full px-4 py-3 rounded-lg border transition-all outline-none text-sm"
      style={{
        background: colors.bg.primary,
        borderColor: `${colors.text.primary}10`,
        color: colors.text.primary,
        ...style,
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = accent
        e.currentTarget.style.boxShadow = `0 0 0 3px ${accent}15`
        props.onFocus?.(e)
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = `${colors.text.primary}10`
        e.currentTarget.style.boxShadow = "none"
        props.onBlur?.(e)
      }}
      {...props}
    />
  )
})

/* ------------------------------------------------------------------ */
/* PremiumButton — gradient primary / ghost secondary                  */
/* ------------------------------------------------------------------ */
export function PremiumButton({
  children,
  variant = "primary",
  loading = false,
  className = "",
  style,
  ...props
}: {
  children: React.ReactNode
  variant?: "primary" | "ghost" | "danger"
  loading?: boolean
} & HTMLMotionProps<"button">) {
  const variants = {
    primary: {
      background: `linear-gradient(135deg, ${colors.brand.lime}, ${colors.brand.cyan})`,
      color: colors.bg.primary,
      border: "none",
    },
    ghost: {
      background: "transparent",
      color: colors.text.secondary,
      border: `1px solid ${colors.text.primary}15`,
    },
    danger: {
      background: `${colors.brand.peach}15`,
      color: colors.brand.peach,
      border: `1px solid ${colors.brand.peach}30`,
    },
  }

  return (
    <motion.button
      whileHover={{ scale: props.disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: props.disabled || loading ? 1 : 0.98 }}
      className={`py-3 px-5 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${className}`}
      style={{
        ...variants[variant],
        opacity: loading || props.disabled ? 0.7 : 1,
        cursor: loading || props.disabled ? "not-allowed" : "pointer",
        ...style,
      }}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-4 h-4 border-2 border-transparent border-t-current rounded-full"
        />
      )}
      {children}
    </motion.button>
  )
}

/* ------------------------------------------------------------------ */
/* PremiumLabel                                                        */
/* ------------------------------------------------------------------ */
export function PremiumLabel({
  children,
  htmlFor,
}: {
  children: React.ReactNode
  htmlFor?: string
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="text-sm font-medium block mb-2"
      style={{ color: colors.text.secondary }}
    >
      {children}
    </label>
  )
}

/* ------------------------------------------------------------------ */
/* Alert — inline status / error message                               */
/* ------------------------------------------------------------------ */
export function Alert({
  children,
  variant = "error",
  role = "alert",
}: {
  children: React.ReactNode
  variant?: "error" | "info" | "success"
  role?: string
}) {
  const accent =
    variant === "error"
      ? colors.brand.peach
      : variant === "success"
        ? colors.brand.lime
        : colors.brand.cyan
  return (
    <motion.p
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      role={role}
      className="text-sm rounded-lg p-3"
      style={{ background: `${accent}15`, color: accent }}
    >
      {children}
    </motion.p>
  )
}
