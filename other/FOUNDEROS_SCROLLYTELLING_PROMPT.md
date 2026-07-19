# FounderOS — Scrollytelling Landing Page Build Prompt
## Adapted from Awwwards-level image-sequence product-reveal template

---

## ACT AS

A world-class Awwwards-level Creative Developer and Brand Experience Director, specializing in ultra-premium web design, Next.js, Framer Motion, advanced scroll-based storytelling, and cinematic product-reveal interactions for AI-native startup tools.

---

## THE TASK

Design and implement a high-end, Apple-level scrollytelling landing page for **FounderOS** — the AI co-founder that takes a founder from a raw idea to a production-ready build prompt.

The experience should feel like a cinematic product reveal combined with an interactive engineering showcase, driven entirely by scroll-based image-sequence animation and premium typography/layout. The core mechanic: as the user scrolls, an image sequence plays where **a single glowing "Idea Core" explodes (disassembles) into six floating phase modules — arranged like a technical blueprint of a mind — then reassembles into a single glowing artifact: the Build Prompt**, synchronized with copywriting and storytelling beats.

This is not a headphone — the "product" being exploded is the *idea itself*, and the diagram it explodes into is FounderOS's own six-phase pipeline (Idea Canvas → Brainstorm → Validation → Market Research → Feasibility → Build Prompt).

---

## TECH STACK INTENT (behavior/style, not literal code generation)

- **Framework:** Next.js 14+ (App Router mental model) — same repo as the FounderOS product app
- **Styling:** Tailwind CSS-style utility thinking (tight spacing, consistent scale)
- **Animation:** Framer Motion-style scroll-linked animations, easing, and transitions
- **Rendering:** HTML5 Canvas-style image-sequence playback (or a lightweight WebGL particle/panel scene if no image sequence is rendered) for performance and smoothness
- **Reuse:** This page shares the design tokens already defined for FounderOS (see below) — it is a marketing front door for the same app whose dashboard, phase stepper, and build-prompt generator already exist

---

## VISUAL DIRECTION & BRAND AESTHETIC

- **Overall vibe:** Apple-level, luxury tech, cinematic, ultra-clean, minimal, editorial — but with an *intelligence* undertone (this is an AI co-founder, not a hardware SKU). Slightly more "terminal/blueprint" than "product photography."
- **Seamless blending:** The page background color MUST exactly match the background of the image-sequence/3D frames so the Idea Core and its fragments appear to float in a unified void with zero visible edges.
- **Color Palette — FounderOS Dark System** *(reuse the existing token set, do not invent new colors)*:
  - `--exus-dark: #0a0a0f` — primary background
  - `--exus-deep: #12121c` — secondary background / card surfaces
  - `--exus-purple: #7c3aed` — Feasibility / architecture accent
  - `--exus-cyan: #06b6d4` — Idea Canvas / Validation accent
  - `--exus-pink: #ec4899` — Brainstorm (adversarial co-founder) accent
  - `--exus-gold: #f59e0b` — Market Research accent
  - `--exus-lime: #84cc16` — **primary brand accent** (CTAs, the Build Prompt module, "go" signals)
  - `--exus-peach: #fb7185` — risk/warning accent inside the feasibility schematic
  - Headings: `text-white/90` with a subtle soft glow for depth
  - Body: `text-white/60` for calm, confident readability
  - Soft radial gradients: `#0a0a0f → #12121c` behind hero content, extremely subtle — never a visible seam
  - Accent gradient (CTAs, key labels): `#84cc16 → #06b6d4` or `#84cc16 → #ec4899`, glossy but restrained
- **Typography:**
  - Display: **Space Grotesk** (already the project's `--font-display`)
  - Body: **Inter** (already the project's `--font-sans`)
  - Headings bold, tight tracking, tight line-height — editorial, not decorative
  - Body 16–18px, muted color, concise, confident copy — no filler

---

## NAVBAR — APPLE-STYLE STRUCTURE & BEHAVIOR

- Ultra-minimal, fixed/sticky top nav, translucent glassmorphism background that appears after scroll (matches the nav pattern already shipped on the FounderOS/NEXUS landing — do not redesign it, extend it).
- **Left:** wordmark "FounderOS"
- **Center:** minimal links — "How it Works", "The Six Phases", "Founder Fit", "Pricing"
- **Right:** primary CTA pill — **"Get Early Access"** (pre-launch) or **"Start Your Build"** (post-launch) — lime gradient background, magnetic hover, jumps to the waitlist/signup section
- Styling:
  - Height: slim, compact
  - Background: `rgba(10,10,15,0.75)` with backdrop blur
  - At top of page: nearly invisible/transparent
  - After ~40px scroll: fades in gently
  - Hover states: subtle underline or opacity shift only — no heavy decoration

---

## CORE INTERACTION: SCROLL-LINKED "IDEA EXPLOSION" SEQUENCE

- A central, full-screen sticky canvas area (or WebGL scene) pinned during scroll (~400vh scroll track).
- Inside it, a sequence (image-sequence *or* real-time WebGL/Three.js panels — either is acceptable, prefer WebGL since FounderOS's stack already has Three.js + React Three Fiber installed) shows:
  - **Start:** a single glowing polyhedral "Idea Core" — small, dense, orbited by faint particles — representing the raw, unstructured idea.
  - **Mid:** the core fractures into **six floating crystal/panel modules**, each tagged and colored per phase (cyan = Idea Canvas, pink = Brainstorm, mint/lime = Validation, gold = Market Research, purple = Feasibility, and a sixth converging module for Build Prompt), arranged like an exploded technical diagram of a mind.
  - **Peak:** all six modules fully separated, floating in perfect hexagonal alignment, each emitting faint data-stream particles toward the center — the "engineering diagram of an idea being built."
  - **End:** the six modules gracefully converge and collapse into **one glowing terminal/document panel** — the Build Prompt — rendered as a crisp, monospace code block glowing lime, ready to "ship."
- Every frame/state uses dramatic rim lighting, deep blacks, controlled glow (no noisy bloom), and matches the exact background color of the page — zero visible seams.
- Canvas and page background are pixel-identical.

---

## SCROLL LOGIC AND STORYTELLING BEATS (COPYWRITING-DRIVEN)

### 1. HERO / INTRO (0–15% scroll)
**Visual:** The Idea Core alone, small, glowing, gently rotating in the void. Faint rim light.
**Copy (centered, bold, confident):**
- Headline: **"FounderOS"**
- Subheadline: **"From idea to build prompt — in one session."**
- Supporting line: *"An AI co-founder that actually pushes back — then hands you the blueprint."*

### 2. IDEA CANVAS + BRAINSTORM (15–40% scroll)
**Visual:** The core cracks open. The cyan "Idea Canvas" panel and the pink "Brainstorm" panel drift apart first, revealing structured fields and chat-bubble fragments mid-flight.
**Copy (left-aligned, emerging from the left):**
- Headline: **"An idea, pressure-tested."**
- Subcopy:
  - *"Structured canvas first — no blank-page paralysis."*
  - *"Then an adversarial co-founder finds the holes before your users do."*

### 3. VALIDATION + MARKET RESEARCH (40–65% scroll)
**Visual:** Two more modules separate — mint "Validation" (a gauge/score dial) and gold "Market Research" (small citation nodes and competitor markers floating like data points).
**Copy (right-aligned, sliding from the right):**
- Headline: **"Validated before you write a line of code."**
- Supporting key points (short, punchy):
  - *"Real demand signals, not a vibes-based score."*
  - *"Founder Fit check — are you the right person to build this?"*
  - *"Competitors named, market sized, sources cited."*

### 4. FEASIBILITY (65–85% scroll)
**Visual:** The purple "Feasibility" module opens into a schematic: tech-stack blocks, a data-model diagram, and risk indicators glowing peach/lime (red = risk, green = opportunity).
**Copy (left-aligned or centered):**
- Headline: **"An honest blueprint, not a pep talk."**
- Subcopy:
  - *"Technical and business feasibility scored — plainly."*
  - *"Every risk named. Every opportunity mapped. No hand-waving."*

### 5. REASSEMBLY → BUILD PROMPT + CTA (85–100% scroll)
**Visual:** All six modules glide back together, converging into the single glowing terminal panel — the Build Prompt — rendered as clean monospace text.
**Copy (centered, strong CTA):**
- Headline: **"Idea in. Build prompt out."**
- Subheadline: **"FounderOS — the co-founder that ends in something you can actually build."**
- CTA button: **"Start Your Build"** (or **"Get Early Access"** pre-launch)
- Secondary link: **"See how it works"**
- Optional micro-copy: *"Paste it into Claude Code, Cursor, or v0 — and start shipping."*

---

## UI & VISUAL POLISH (KEYWORDS TO EMPHASIZE)

Cinematic, hyper-detailed, ultra-premium, editorial, Apple-level, modern minimalist, corporate high-end, glassmorphism, gradient glows, buttery scroll, hardware-accelerated, immersive scrollytelling, polished, Awwwards-level — but grounded in *engineering honesty*, not luxury-hardware gloss. The tone is "blueprint," not "showroom."

- Soft ambient glows behind the Idea Core and key text blocks
- Subtle gradient borders around CTAs and phase-module cards
- Depth suggested through focus/lighting, never noisy particle effects
- A faint hexagonal grid ground-plane beneath the six-module peak state, echoing the phase-crystal chamber already built for the interactive story page

---

## TYPOGRAPHY & GRADIENT DETAILS

- **Headings:** gradient fill white → `#84cc16` (lime) at the base of the letterforms, subtle, never garish — the inverse of Sony's white→cyan, using FounderOS's own brand lime instead
- **Body:** solid `rgba(255,255,255,0.6)`, no gradients, readability first
- **Button text:** white, semi-bold, subtle drop shadow for legibility over dark backgrounds
- **Phase labels** (on the six modules): small caps or mono, color-matched to each phase's accent

---

## CANVAS & LAYOUT BEHAVIOR

- Sticky canvas/WebGL section, ~400vh scroll height, pinned while the five story beats play out
- Canvas is always full-width/full-height, content centered, aspect ratio preserved
- Scroll position maps smoothly to explosion progress (0→1) — no flicker, no discrete jumps; ease with damping (mirrors the existing `CameraController`/scroll-progress pattern already used elsewhere in this codebase)
- All UI chrome (navbar, text overlays, progress indicator) floats above the canvas with non-intrusive depth
- Respect `prefers-reduced-motion`: fall back to a static hero + the six phase cards in a normal scrolling layout, no forced animation

---

## FINAL PROMPT (COMBINED, READY-TO-USE)

> Design a hyper-premium, Apple-level, cinematic scrollytelling landing page for **FounderOS**, the AI co-founder that takes a founder from a raw idea to a production-ready build prompt. The experience should feel like a high-end editorial product story with a sticky full-screen canvas playing a scroll-driven sequence in which a single glowing "Idea Core" explodes into six floating, color-coded technical modules — Idea Canvas (cyan), Brainstorm (pink), Validation (mint/lime), Market Research (gold), Feasibility (purple), and Build Prompt (lime) — arranged like an exploded diagram of a mind, then gracefully reassembles into one glowing terminal panel: the Build Prompt. The page uses a pure dark-mode aesthetic — background `#0a0a0f` blending into `#12121c` — that exactly matches the canvas background so every module appears to float in seamless black space with zero visible edges.
>
> Include an Apple-style, ultra-minimal, fixed top navigation bar: a slim glassmorphism nav with backdrop blur and a near-black translucent background, wordmark "FounderOS", centered links ("How it Works", "The Six Phases", "Founder Fit", "Pricing"), and a right-aligned lime-gradient CTA pill reading "Get Early Access" or "Start Your Build." The nav starts nearly invisible at the top and gently fades in after a small scroll.
>
> Use the existing FounderOS color tokens throughout — `#0a0a0f` / `#12121c` backgrounds, `text-white/90` headings, `text-white/60` body — with lime (`#84cc16`) as the primary accent and cyan/pink/gold/purple/peach as phase-specific highlights. Headings use a white→lime gradient fill, tight tracking, Space Grotesk display type; body copy uses Inter, calm and confident, no filler.
>
> Drive the scroll narrative in five beats. At 0–15%, show the Idea Core alone — small, glowing, rotating — with centered copy: "FounderOS" / "From idea to build prompt — in one session." / "An AI co-founder that actually pushes back — then hands you the blueprint." At 15–40%, the core cracks open as the Idea Canvas and Brainstorm modules drift apart; left-aligned copy reads "An idea, pressure-tested." with subcopy on structured canvases and adversarial co-founder pressure-testing. At 40–65%, the Validation and Market Research modules separate, showing a founder-fit gauge and citation nodes; right-aligned copy reads "Validated before you write a line of code." with punchy lines about real demand signals, founder fit, and sourced competitor research. At 65–85%, the Feasibility module opens into a technical schematic — tech stack blocks, data model, risk/opportunity indicators in peach and lime; copy reads "An honest blueprint, not a pep talk." At 85–100%, all six modules converge into a single glowing monospace terminal panel — the Build Prompt — with centered CTA copy: "Idea in. Build prompt out." / "FounderOS — the co-founder that ends in something you can actually build." / primary CTA "Start Your Build" / secondary "See how it works."
>
> All transitions must be smooth, buttery, hardware-accelerated, with scroll-linked easing and no stutter. All overlays (nav, text, CTAs) use subtle fades and eased slides that reinforce the ultra-premium, cinematic, engineering-honest feel — Awwwards-level polish in service of a founder tool, not a luxury gadget.

---

*Paste this into Claude Code / Cursor / v0 as the build brief for the FounderOS marketing landing page. It assumes the existing design tokens (`--exus-*` colors, Space Grotesk/Inter fonts) and the Three.js/React Three Fiber stack already installed in this repo.*
