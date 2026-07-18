# 🧭 Founder OS — Master Plan

> The goal: a platform where a founder types an **idea** and an AI startup team
> takes it from **idea → validated plan → build prompt → working application →
> ongoing operations**, visualized as a living 3D office you supervise as the boss.

---

## The big picture

```
┌─────────────────────────── FOUNDER OS ───────────────────────────┐
│                                                                   │
│  IDEA ──▶ ① BLUEPRINT ──▶ ② BUILD SPEC ──▶ ③ BUILD ──▶ ④ OPERATE │
│            (7 agents,       (Developer       (Claude     (agents  │
│             built ✅)        agent, next)     Code)       + APIs)  │
│                                                                   │
│  You watch it all happen in the 3D office. You are the boss. 👑   │
└───────────────────────────────────────────────────────────────────┘
```

| Phase | What happens | Status |
|-------|--------------|--------|
| **① Blueprint** | Idea → full startup blueprint (strategy, market, content, sales, tech, data, support) | ✅ **Built** |
| **② Build spec** | Developer agent turns the blueprint's tech plan into a complete, buildable prompt/spec for Claude Code (file tree, data model, API contract, acceptance criteria) | 🔜 Next |
| **③ Build** | The spec is handed to Claude Code (CLI or GitHub Action) which scaffolds and builds the actual application repo | 🔜 Next |
| **④ Operate** | The agent team runs the live product 24/7 through real APIs — content posts ads, sales sends sequences, support answers tickets, data watches metrics, CEO reprioritizes weekly | 🔮 Roadmap |

---

## What's being built right now (this iteration)

### 1. Providers — run on anything
| Provider | Env var | Default model | Notes |
|----------|---------|---------------|-------|
| **OpenRouter** (primary) | `OPENROUTER_API_KEY` | `openai/gpt-4o` | Any model: GPT, Claude, Gemini, Llama, DeepSeek, Grok… |
| **Anthropic** | `ANTHROPIC_API_KEY` | `claude-opus-4-8` | Native, adaptive thinking + effort |
| **OpenAI** | `OPENAI_API_KEY` | `gpt-4o` | Direct API. Codex/ChatGPT OAuth sign-in: roadmap (see below) |
| **Google** | `GOOGLE_API_KEY` | `gemini-2.0-flash` | Generative Language API |
| **NVIDIA** | `NVIDIA_API_KEY` | `meta/llama-3.3-70b-instruct` | NVIDIA NIM (OpenAI-compatible, free tier available) |

Everything configurable live from the **Settings page** — no restarts, no editing env files.

### 2. Task assignment (work like a real company)
- `POST /task { "task": "write a cold email for dentists" }`
- The **CEO agent reads the task and routes it** to the right specialist
  (with a keyword fallback if the model is unreachable).
- The specialist executes it with their full role training and returns the deliverable.
- In the office you SEE it: the task goes in, the CEO thinks, the assignee starts
  typing, the boss walks over to watch, the result lands in your inbox modal.

### 3. A living office (no more statues)
- **Idle agents wander**: water cooler, whiteboard, printer, meeting table, window.
- **Room-aware**: CEO and Developer wander inside their own offices; open-floor
  agents roam the floor. No wall clipping.
- **Working agents hustle**: away from desk when work arrives → they walk back
  fast and start typing.
- **The boss patrols**: during a run he walks desk-to-desk watching whoever is
  working; between runs he strolls the floor.
- Waddle-walk animation (bob + rock) fitting the jelly-blob style.

### 4. System Settings page (`/settings`)
- **Provider panel**: pick provider, paste keys (masked after save), pick model,
  effort, token ceiling. **Test button** fires a real 1-token call and reports latency.
- **Per-agent integration slots** (stored now, consumed by Phase ④ autonomy):

| Agent | Integrations (initial catalog) |
|-------|-------------------------------|
| 🧭 CEO | Slack webhook (reports), Google Calendar, Notion |
| 🔍 Market Research | SerpAPI (live search), SimilarWeb |
| ✍️ Content | Meta Ads, Google Ads, X/Twitter API, Buffer |
| 💰 Sales | SendGrid/SMTP, HubSpot CRM, LinkedIn (assist mode) |
| 💻 Developer | GitHub token, Vercel/Render deploy hook |
| 📊 Data | Google Analytics 4, Stripe (read-only), PostHog |
| 🎧 Support | Zendesk, Intercom, support inbox (IMAP/SMTP) |

- Keys are stored in `config/settings.json` (gitignored), masked in every API
  response, and never sent to the model as prompt text.

---

## Roadmap (after this iteration)

### Phase ② — Build Spec generator
- New pipeline stage: Developer agent converts the blueprint into a
  `BUILD-SPEC.md`: exact file tree, schema, endpoints, UI pages, acceptance tests.
- "Generate build prompt" button on the blueprint modal.

### Phase ③ — Claude Code handoff
- One-click: create a GitHub repo, commit `BUILD-SPEC.md`, open it with
  Claude Code (locally: `claude "build BUILD-SPEC.md"`; or a GitHub Action).
- The Developer agent reviews the built PR (its `code review` skill is already
  in its training).

### Phase ④ — Autonomous operations (24/7)
- A **scheduler** (cron) wakes agents: Data pulls GA4/Stripe nightly → Data
  reports anomalies → CEO reprioritizes → Content drafts posts via Meta/Google
  Ads APIs → Sales runs sequences via SendGrid → Support drains the inbox.
- Every action goes through an **approval queue** first (the boss approves in
  the office UI) until you flip an agent to "fully autonomous".
- Budget guards: per-agent daily token + spend caps.

### Auth roadmap
- **OpenAI Codex/ChatGPT OAuth** — sign in with your ChatGPT account instead of
  an API key (device-code flow like the Codex CLI).
- **Google OAuth** for Ads/Analytics/Calendar scopes.
- **Meta Business OAuth** for ad accounts.

### Free tools (growth loop)
Small standalone tools that each showcase one agent, free with sign-in:
1. **Idea Validator** (Market agent) — paste idea, get gap/competitor snapshot
2. **Cold-email generator** (Sales agent)
3. **Landing-page copy generator** (Content agent)
4. **North-star metric finder** (Data agent)
Each ends with: "Want the whole team? → Founder OS."

---

## Architecture (current)

```
startup-team-os/
├── src/
│   ├── agents.js         # 7 role definitions (system prompts)
│   ├── training.js       # frameworks + worked scenarios per role
│   ├── orchestrator.js   # full-pipeline DAG (idea → blueprint)
│   ├── router.js         # single-task routing (CEO assigns → agent executes)
│   ├── llm.js            # provider dispatch + live settings
│   ├── settings.js       # config/settings.json store (masked, gitignored)
│   └── providers/        # openrouter · anthropic · openai · google · nvidia
├── public/
│   ├── office.html       # the living 3D office (Three.js)
│   └── settings.html     # system settings page
└── server.js             # HTTP + SSE + static
```
