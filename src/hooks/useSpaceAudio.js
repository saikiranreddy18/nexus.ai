import { useCallback, useRef, useState } from 'react'

// Warm, musical deep-space ambience, synthesized in the browser:
// a slowly-breathing suspended chord, a whisper of filtered air, and
// occasional pentatonic star chimes echoing through a long delay.
// Built lazily on first toggle — browsers require a user gesture anyway.

const CHORD = [110, 164.81, 220, 293.66] // A2 · E3 · A3 · D4 (Asus4)
const PENTATONIC = [880, 987.77, 1174.66, 1318.51, 1567.98] // A major pent.

function buildEngine() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)()
  const master = ctx.createGain()
  master.gain.value = 0
  master.connect(ctx.destination)

  // soften everything: one shared lowpass before the destination
  const tone = ctx.createBiquadFilter()
  tone.type = 'lowpass'
  tone.frequency.value = 1400
  tone.connect(master)

  // breathing chord pad — each voice swells on its own slow cycle
  CHORD.forEach((freq, i) => {
    const osc = ctx.createOscillator()
    osc.type = 'triangle'
    osc.frequency.value = freq
    const voice = ctx.createGain()
    voice.gain.value = 0.014
    const lfo = ctx.createOscillator()
    lfo.frequency.value = 0.045 + i * 0.017
    const depth = ctx.createGain()
    depth.gain.value = 0.009
    lfo.connect(depth).connect(voice.gain)
    osc.connect(voice).connect(tone)
    osc.start()
    lfo.start()
  })

  // faint stellar air: narrow band of noise, barely audible
  const len = ctx.sampleRate * 2
  const buf = ctx.createBuffer(1, len, ctx.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1
  const noise = ctx.createBufferSource()
  noise.buffer = buf
  noise.loop = true
  const air = ctx.createBiquadFilter()
  air.type = 'bandpass'
  air.frequency.value = 700
  air.Q.value = 0.4
  const airGain = ctx.createGain()
  airGain.gain.value = 0.006
  noise.connect(air).connect(airGain).connect(tone)
  noise.start()

  // chime space: long feedback delay shared by the twinkle voice
  const delay = ctx.createDelay(2)
  delay.delayTime.value = 0.48
  const fb = ctx.createGain()
  fb.gain.value = 0.38
  delay.connect(fb).connect(delay)
  const wet = ctx.createGain()
  wet.gain.value = 0.6
  delay.connect(wet).connect(tone)

  function twinkle() {
    const note = PENTATONIC[Math.floor(Math.random() * PENTATONIC.length)]
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = note
    const g = ctx.createGain()
    const t = ctx.currentTime
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(0.016, t + 0.06)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 2.6)
    osc.connect(g)
    g.connect(tone)
    g.connect(delay)
    osc.start(t)
    osc.stop(t + 3)
  }

  const twinkleTimer = setInterval(() => {
    if (ctx.state === 'running' && Math.random() < 0.65) twinkle()
  }, 4600)

  return { ctx, master, twinkleTimer }
}

export function useSpaceAudio() {
  const [on, setOn] = useState(false)
  const engineRef = useRef(null)

  const toggle = useCallback(() => {
    let engine = engineRef.current
    if (!engine) {
      engine = engineRef.current = buildEngine()
    }
    const { ctx, master } = engine
    const next = !on
    if (next) {
      ctx.resume()
      master.gain.cancelScheduledValues(ctx.currentTime)
      master.gain.linearRampToValueAtTime(0.9, ctx.currentTime + 2.5)
    } else {
      master.gain.cancelScheduledValues(ctx.currentTime)
      master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6)
      setTimeout(() => ctx.suspend(), 700)
    }
    setOn(next)
  }, [on])

  return { on, toggle }
}
