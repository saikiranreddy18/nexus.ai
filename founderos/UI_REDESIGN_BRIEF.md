# FounderOS — Application UI Redesign Brief
## Written as a design brief from a 30-year product design veteran

---

## ACT AS

A Principal Product Designer with 30+ years across enterprise software, developer tools, and consumer SaaS — the kind of person who shipped UI before "UX" was a job title, has opinions about 4px vs 8px grids because they've watched both fail, and will tell a founder their gradient is covering up a hierarchy problem. Pragmatic, not decorative. Every choice below is defended by "what happens when a real user is tired, in a hurry, or on a bad connection" — not by what looks good in a still screenshot.

---

## WHAT THIS APPLICATION ACTUALLY IS

FounderOS is a **tool**, not a brochure. A founder opens it to do work: fill in an idea, get pressure-tested by an AI, move through six gated phases, and walk out with a build prompt. They will use it multiple times, in one sitting, often stressed. The UI's job is to **get out of the way** — the Sony-headphones cinematic-reveal treatment I might use on a marketing page has no place here. A tool that performs for you instead of working for you is a tool people stop using.

Current real screens in this codebase — this brief only redesigns these, nothing invented:
- `/login`, `/signup` — auth
- `/dashboard` — project list, create project
- `/project/[id]` — phase stepper + phase content + prev/next navigation
- Phase 1 — the Idea Canvas form (7 fields, 2 dropdowns)
- Phases 2–6 — currently placeholders

---

## THE FOUR PRINCIPLES (30 years, distilled)

1. **One primary action per screen.** If a screen has two buttons fighting for attention, one of them is wrong. Right now the dashboard has "New Project" and a project card link competing visually — fix the hierarchy, don't add a third color to compensate.

2. **Motion explains state change, it doesn't decorate.** A phase unlocking, a form saving, a card appearing — these deserve a 150–200ms ease. A logo idling with a slow rotation deserves nothing. If you can screenshot two frames of an animation and the second one doesn't tell the user something the first one didn't, cut it.

3. **Density is a feature for a tool like this, not a bug.** Founders filling six fields don't want 4rem of whitespace between labels — they want to see the whole form's shape at once so they can plan their answers. Marketing pages breathe. Tools compress.

4. **Every locked phase must look locked, not sad.** The stepper's disabled phases should read as "not yet, on purpose" (a clear, confident, muted state) not as "broken" (greyed out with no explanation). Confidence in the restriction is part of the product's adversarial-but-fair personality.

---

## SCREEN-BY-SCREEN SPEC

### 1. Auth (`/login`, `/signup`)

**Problem with generic auth pages:** they're an afterthought. This one is a founder's first contact with an AI that's about to argue with them — set the tone here.

- Single centered card, max-width 400px, generous padding (32–40px)
- Headline uses the product's actual voice: not "Welcome back" — try **"Let's see what you're building."** for login, **"First, tell us what you're building."** for signup
- Inputs: 44px height minimum (touch-friendly, no cramped forms), label above input not placeholder-only (placeholders disappear the moment someone starts typing and they forget what field they're in)
- One error state design used everywhere: red-bordered input + one line of text below it, never a toast for form validation
- CTA button full-width, high contrast, no gradient — gradients on a button say "marketing," solid color says "this does something"

### 2. Dashboard (`/dashboard`)

**Problem right now:** flat list of cards, no sense of progress or momentum across projects.

- Grid of project cards, 3-up on desktop, stacked on mobile
- Each card: name (truncated, single line), a **compact 6-segment phase indicator** (not a percentage bar — founders think in phases, not percentages), last-updated relative time ("2 hours ago" not a date)
- Empty state is not "No projects yet" with a button below it — make the empty state the strongest sales pitch in the app, since it's the first thing every new user sees: one sentence on what happens next, one button
- "New Project" lives top-right, always, same position whether 0 or 50 projects exist — muscle memory matters for a returning user

### 3. Project Workspace (`/project/[id]`) — the core screen

This is where founders spend 90% of their time. It currently uses default shadcn styling with no visual hierarchy between the stepper, the phase card, and the form. Fix in this order:

**Stepper (top, always visible):**
- Horizontal on desktop, collapses to a compact "Phase 3 of 6" pill + progress dots on mobile — do not shrink text until it's unreadable, replace the pattern instead
- Current phase: solid brand-lime background, dark text, subtle shadow lift (2px) — it should look pressed-in-focus, not just "colored differently"
- Completed phases: outlined, checkmark icon, muted but legible — clickable to revisit
- Locked phases: dimmed to ~40% opacity, small lock icon, cursor shows not-allowed — no click handler at all, not just a disabled style (prevents confusing dead clicks)

**Phase content card:**
- Clear visual separation from the stepper above it — a real gap (24–32px), not just a border
- Phase title + one-line description at the top, always in the same position across all 6 phases so founders learn where to look
- The AI's response (once Phase 1 or later returns feedback) gets its own distinct card below the form — different background shade, not just italic text inline — this is the "adversarial co-founder talking" moment and deserves to look like a message from someone, not a footnote

**Idea Canvas form (Phase 1):**
- Currently 7 stacked full-width fields — group them: pair "problem" + "target user" as a 2-column row on desktop (they're conceptually linked), keep the rest stacked
- Business model / category dropdowns: convert to a segmented control (pill buttons: B2B / B2C / B2B2C) instead of a `<select>` — 3 options doesn't need a dropdown, and a visible pill row lets founders see all options without a click
- Submit button state machine, one button, three labels only: "Submit idea canvas" → "Saving…" → "AI is analyzing…" (already implemented — keep it, it's correct)

**Phase navigation (bottom):**
- Previous/Next currently look like equal-weight secondary buttons — make Next the primary action (filled, brand color) since it's the expected path; Previous stays a ghost/text button — asymmetric weight matches asymmetric intent

### 4. Phases 2–6 (currently placeholders)

Don't reuse the Phase 1 form pattern for all of them blindly:
- **Phase 2 (Brainstorm):** chat UI, message bubbles left/right, push-back-level selector as three pill buttons (Gentle/Balanced/Brutal) fixed at the top of the chat panel, always visible while scrolling
- **Phase 3 (Validation):** four score cards in a row (Problem Realness, Market Demand, Timing, Founder Fit), each a number + one-line reasoning, not a paragraph — scores should be scannable in 3 seconds
- **Phase 4 (Market Research):** table for competitors (name, pricing, weakness — sortable-feeling even if not sortable), not cards — cards for 6-8 competitors becomes a wall of noise
- **Phase 5 (Feasibility):** traffic-light color coding (peach/gold/lime) on risk severity, used sparingly — this is the one place strong color-as-meaning earns its keep
- **Phase 6 (Build Prompt):** the prompt itself in a monospace code block with a visible copy button in the corner (not below it) — this is the artifact founders came for, treat it like the hero of the page, not a footer

---

## TECHNICAL IMPLEMENTATION (matches the existing stack — do not introduce new dependencies)

- **Framework:** Next.js 16 App Router (already the repo's version — note it renamed `middleware.ts` to `proxy.ts`, check `AGENTS.md` before touching routing)
- **Styling:** Tailwind utility classes, reuse `lib/design-tokens.ts` already defined in this repo (exus-lime, exus-cyan, exus-pink, exus-gold, exus-purple, exus-peach)
- **Components:** shadcn/ui primitives already installed (Button, Card, Dialog, Select, Input, Textarea, Progress) — extend these, don't replace them with custom one-offs
- **Motion:** Framer Motion is not yet a dependency of this Next.js app (only the separate Vite landing page has it) — if motion is added here, keep it to: phase-card entrance (fade + 8px slide, 200ms), stepper phase-change (color transition, 150ms), button loading states (spinner fade-in). Nothing else needs a library — CSS transitions cover hover/focus states
- **No new 3D, no particle fields, no canvas rendering anywhere in this app.** That's landing-page vocabulary. A dashboard that renders WebGL behind a data table is a tool actively working against its own user.

---

## WHAT NOT TO DO (the anti-pattern list, because someone always tries these)

- No gradient text on data the user needs to read quickly (scores, form labels, table cells) — gradients are for one headline per page, maximum
- No glassmorphism on anything containing a form input — blur behind text you're trying to type into is a legibility bug wearing a design trend as a costume
- No skeleton loaders that take longer to animate than the actual data takes to load — if a fetch is under 300ms, show nothing, don't manufacture the appearance of work
- No decorative particle/star fields, no ambient glows "just because it's dark mode" — every glow in this spec (stepper current-phase lift, phase-5 risk colors) is tied to a specific meaning, not atmosphere
- No autoplay animations on page load beyond a single 200ms entrance fade — a founder returning to check on their 4th project doesn't need to wait through a title sequence again

---

## FINAL PROMPT (COMBINED, READY-TO-USE)

> Redesign the FounderOS application UI (Next.js 16 App Router, Tailwind, shadcn/ui — no new dependencies) across four real screens: auth (`/login`, `/signup`), dashboard (`/dashboard`), the project workspace (`/project/[id]` — phase stepper + phase content + navigation), and the Phase 1 Idea Canvas form. This is a working tool a founder returns to multiple times under time pressure, not a marketing surface — every design decision should reduce friction and increase scannability, not add spectacle.
>
> Auth: single centered 400px card, product-voiced headline ("Let's see what you're building."), labels above inputs (not placeholder-only), one consistent inline error pattern, full-width solid-color CTA (no gradient).
>
> Dashboard: 3-up project card grid, each card showing a compact 6-segment phase indicator (not a percentage bar) and relative last-updated time; a strong single-sentence empty state as the real first-run pitch; "New Project" fixed top-right regardless of project count.
>
> Project workspace: the stepper's current phase gets a solid brand-lime fill with a 2px shadow lift; completed phases are outlined with a checkmark and stay clickable; locked phases sit at ~40% opacity with a lock icon and no click handler at all (not just disabled styling). Give the phase content card real separation from the stepper (24–32px gap), and give the AI's response its own distinct card background — it's a co-founder talking, not a caption. In the Idea Canvas form, pair "problem" and "target user" into a two-column row on desktop, and replace both dropdowns with segmented pill controls since each only has 2–6 options. Make "Next" the filled primary button and "Previous" a ghost button — the asymmetry should match the asymmetry of intent.
>
> For Phases 2–6 (currently placeholders): Phase 2 is a chat UI with a fixed push-back-level pill selector (Gentle/Balanced/Brutal) always visible above the scrolling messages. Phase 3 is four scannable score cards (number + one line each), not paragraphs. Phase 4 is a competitor table, not cards. Phase 5 uses traffic-light coloring on risk severity — the one place strong color-as-meaning is earned. Phase 6 renders the build prompt in a monospace block with a copy button in the corner, treated as the hero artifact of the entire app.
>
> Reuse the existing design tokens in `lib/design-tokens.ts` and the shadcn components already installed. Any motion added should be purposeful only: 200ms fade+slide entrances, 150ms stepper color transitions, button loading-state fades — nothing ambient, no particle fields, no glassmorphism behind form inputs, no gradient text on data the user needs to read quickly. If an animation doesn't tell the user something changed, cut it.

---

*This brief intentionally omits the cinematic/3D vocabulary used for the marketing landing page — that language belongs on a first-impression surface, not on a tool founders operate under time pressure. Paste the FINAL PROMPT section into Claude Code as the build brief for this redesign pass.*
