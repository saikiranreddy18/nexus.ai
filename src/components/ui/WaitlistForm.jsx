import { useState } from 'react'
import { useAnalytics } from '../../hooks/useAnalytics'
import { EVENTS } from '../../utils/analyticsEvents'

const ENDPOINT = import.meta.env.VITE_WAITLIST_ENDPOINT

// Email capture for the pre-launch waitlist. Posts to VITE_WAITLIST_ENDPOINT
// (Formspree or similar) when configured; always records the analytics event.
export default function WaitlistForm({ location, autoFocus = false }) {
  const [email, setEmail] = useState('')
  const [state, setState] = useState('idle') // idle | error | done
  const track = useAnalytics()

  async function submit(e) {
    e.preventDefault()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setState('error')
      return
    }
    track(EVENTS.WAITLIST_JOIN, { location })
    if (ENDPOINT) {
      try {
        await fetch(ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, source: location }),
        })
      } catch {
        /* the signup still counts locally; don't block the user on network */
      }
    }
    try {
      const saved = JSON.parse(localStorage.getItem('nexus_waitlist') || '[]')
      localStorage.setItem('nexus_waitlist', JSON.stringify([...saved, { email, at: Date.now() }]))
    } catch { /* storage unavailable — analytics event already captured */ }
    setState('done')
  }

  if (state === 'done') {
    return (
      <p className="font-display text-sm tracking-wide text-cyan-300" role="status">
        You're on the list. We'll email you the moment NEXUS AI launches.
      </p>
    )
  }

  return (
    <form onSubmit={submit} className="w-full max-w-md" noValidate>
      <div className="glass flex items-center gap-2 rounded-full p-1.5 pl-5 focus-within:border-exus-cyan/50">
        <label htmlFor={`waitlist-${location}`} className="sr-only">Email address</label>
        <input
          id={`waitlist-${location}`}
          type="email"
          autoFocus={autoFocus}
          value={email}
          onChange={(e) => { setEmail(e.target.value); if (state === 'error') setState('idle') }}
          placeholder="Enter your email"
          className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
          aria-invalid={state === 'error'}
        />
        <button
          type="submit"
          className="shrink-0 rounded-full bg-gradient-to-r from-exus-purple to-exus-cyan px-5 py-2.5 font-display text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          Join the waitlist
        </button>
      </div>
      <p className={`mt-2 pl-5 text-xs ${state === 'error' ? 'text-exus-peach' : 'text-slate-500'}`}>
        {state === 'error'
          ? 'Please enter a valid email address.'
          : 'The application is in development — be first in when it ships.'}
      </p>
    </form>
  )
}
