# 🚀 Startup Team OS

An **AI startup team in a box**. Give it a business idea; seven specialized
agents build a complete, actionable startup blueprint automatically — no
step-by-step prompting, no human in the loop.

Runs on **any model via OpenRouter** (GPT, Claude, Gemini, Llama, DeepSeek, Grok…)
or **natively on the Anthropic API**. Use it as a **CLI**, an **HTTP server** (for
your own cloud), or a **GitHub Action** — and watch the team work in a **live 3D
office** where each agent is dressed for their role.

## The team

| Agent | Owns |
|-------|------|
| 🧭 **CEO Assistant** | Strategy, OKRs/KPIs, priorities, roadmap, growth bottlenecks, fundraising |
| 🔍 **Market Research Expert** | Competitors, market gaps, pricing, SWOT, personas, positioning |
| ✍️ **Content Writer** | Landing pages, email campaigns, social posts, reel scripts, sales copy |
| 💰 **Sales Expert** | Cold email, LinkedIn outreach, scripts, objection handling, closing |
| 💻 **Developer** | Architecture, tech stack, API design, MVP scope, security, scalability |
| 📊 **Data Analyst** | North-star metric, funnels, churn, forecasting, dashboards |
| 🎧 **Customer Support Agent** | FAQs, refund/ticket templates, escalation, retention, upsell |

## How the agents are trained

These aren't generic chatbots. Each seat is trained in [`src/training.js`](src/training.js)
with the frameworks a top operator in that role actually uses, quality standards,
and a **worked real-world scenario** showing how an expert handles a real situation
(weak answer vs. expert answer). That training is appended to each agent's system
prompt, so the CEO reasons in OKRs and bottlenecks, the market analyst uses JTBD and
value-based pricing, the developer applies YAGNI and MVP scoping, and so on.

To retrain or specialize an agent, edit its entry in `src/training.js` — add more
scenarios, swap in your own case studies, or tighten the standards.

## 🏢 Watch them work — the live 3D office

Open **`/office`** while the server is running to see a virtual 3D office where you're
the boss. It's a full office scene — desks, monitors, windows, a wall clock, a
whiteboard, plants, and a water cooler — and **each agent is a little character
dressed for their role**: the CEO in a suit and tie, the developer in a hoodie and
glasses, sales and support wearing headsets, the content writer in a beret, and you
(the boss) with a crown. As the pipeline runs, each character bobs to life and their
workstation lights up (working → done ✓), an activity feed logs every hand-off, and a
progress bar tracks the 6 stages. When it finishes, view or download the blueprint
right there.

```bash
npm start
# open http://localhost:3000/office
```

- **Run team** — live run wired to the server via Server-Sent Events (needs a provider key —
  `OPENROUTER_API_KEY` or `ANTHROPIC_API_KEY` — set on the server). If `RUN_API_KEY` is set,
  open the office with `?key=your-run-key` once — it's remembered for later visits.
- **Demo** — a simulated run that animates the whole office with no key/server, so you can see the flow anywhere.
- If your browser/GPU can't create a WebGL context, `/office` automatically falls back to
  the CSS-only version at `/office-classic`.

## How the workflow is wired

The agents don't run in isolation — each builds on the previous ones:

```
idea
 └▶ CEO (strategy) ─▶ Market Research (validate + sharpen)
        └▶ ┌ Content Writer ┐
           ├ Sales Expert   ┤  (run in parallel off the shared brief)
           ├ Developer      ┤
           └ Data Analyst   ┘
                 └▶ Customer Support (post-sale system)
                      └▶ CEO (synthesize a 90-day execution plan)
                           └▶ 📄 Startup Blueprint (one Markdown file)
```

## Choose your model (provider)

Set these in your environment or `.env` (see [`.env.example`](.env.example)):

**OpenRouter — any model:**
```bash
export LLM_PROVIDER=openrouter
export OPENROUTER_API_KEY=sk-or-...      # https://openrouter.ai/keys
export AGENT_MODEL=openai/gpt-4o         # or anthropic/claude-opus-4-8, google/gemini-2.0-flash, meta-llama/llama-3.3-70b-instruct, deepseek/deepseek-chat …
```

**Anthropic — native:**
```bash
export LLM_PROVIDER=anthropic
export ANTHROPIC_API_KEY=sk-ant-...
export AGENT_MODEL=claude-opus-4-8
```

If you leave `LLM_PROVIDER` unset, it auto-picks OpenRouter when `OPENROUTER_API_KEY`
is present, otherwise Anthropic.

## Quick start (CLI)

```bash
cd startup-team-os
npm install
cp .env.example .env          # fill in your provider + key
node src/cli.js "an app that helps freelancers get paid faster"
```

The finished blueprint is saved to `runs/<timestamp>-<slug>.md` and printed to
stdout. A full run calls the model 9 times and takes a few minutes.

Redirect it straight to a file:

```bash
node src/cli.js "my idea" > blueprint.md
```

## Run as a server (your own cloud)

```bash
npm start          # listens on $PORT (default 3000)
```

| Route | Purpose |
|-------|---------|
| `GET /` | Minimal web UI — paste an idea, get a blueprint |
| `GET /office` | The live 3D virtual office (falls back to `/office-classic` if WebGL is unavailable) |
| `POST /run` | `{ "idea": "..." }` → `{ blueprint, sections, provider, model, effort }` |
| `GET /run/stream` | SSE: `?idea=...&key=...` → `progress` / `done` / `error` events, drives `/office` |
| `GET /health` | Health check for the platform |
| `GET /agents` | The agent roster |

```bash
curl -X POST http://localhost:3000/run \
  -H 'content-type: application/json' \
  -d '{"idea":"a marketplace for local tutors"}'
```

Set `RUN_API_KEY` to require an `x-api-key` header on `/run`.

### Docker

```bash
docker build -t startup-team-os .
docker run -e ANTHROPIC_API_KEY=sk-ant-... -p 3000:3000 startup-team-os
```

Deploys as-is to **Render**, **Railway**, **Fly.io**, **Google Cloud Run**, or any
host that runs a container or a `Procfile`. Set `ANTHROPIC_API_KEY` in the host's
environment/secrets.

## Run it from GitHub (no server)

1. Commit this folder to your repo.
2. Add a repository secret **`ANTHROPIC_API_KEY`**
   (*Settings → Secrets and variables → Actions*).
3. Go to **Actions → Startup Team OS → Run workflow**, type your idea, and run.
4. Download the blueprint from the run's **Artifacts**.

The workflow lives at [`.github/workflows/startup-team.yml`](.github/workflows/startup-team.yml).

## Configuration

All optional (see [`.env.example`](.env.example)):

| Variable | Default | Notes |
|----------|---------|-------|
| `LLM_PROVIDER` | auto | `openrouter` or `anthropic` (auto-detects from which key is set) |
| `OPENROUTER_API_KEY` | — | Required for OpenRouter |
| `ANTHROPIC_API_KEY` | — | Required for the Anthropic provider |
| `AGENT_MODEL` | provider default | **Any** OpenRouter model id, or a Claude id |
| `AGENT_EFFORT` | `high` | `low`…`max` (Anthropic; OpenRouter reasoning models) |
| `OPENROUTER_REASONING` | — | `true` to send an effort hint (reasoning models only) |
| `AGENT_MAX_TOKENS` | `24000` | Per-agent output ceiling |
| `LLM_TIMEOUT_MS` | `300000` | OpenRouter request timeout |
| `PORT` | `3000` | Server only |
| `RUN_API_KEY` | — | If set, `/run` and `/run/stream` require the key |

## Extending the team

- **Add an agent:** add an entry to `src/agents.js`, then wire a `step(...)`
  into the pipeline in `src/orchestrator.js`.
- **Change the workflow:** the DAG is plain JavaScript in `src/orchestrator.js` —
  reorder stages, add parallel branches, or change what context each agent gets.

## Project layout

```
startup-team-os/
├── src/
│   ├── agents.js        # the 7 role definitions (system prompts)
│   ├── training.js      # per-agent frameworks + worked real-world scenarios
│   ├── orchestrator.js  # the pipeline / DAG that wires them together
│   ├── llm.js           # provider dispatch (openrouter | anthropic)
│   ├── providers/
│   │   ├── openrouter.js  # run any model via OpenRouter
│   │   └── anthropic.js   # run natively on the Anthropic API
│   ├── cli.js           # command-line entrypoint
│   └── server.js        # HTTP API + SSE + web UI for cloud deployment
├── public/
│   ├── office.html          # the live 3D virtual office (Three.js, dressed characters)
│   ├── office-classic.html  # CSS-only fallback if WebGL is unavailable
│   └── vendor/three.module.js  # vendored Three.js — no CDN dependency
├── .github/workflows/startup-team.yml   # run the team from GitHub
├── Dockerfile · Procfile · .env.example
└── README.md
```

> Outputs are AI-generated strategy drafts. Review before acting on financial,
> legal, or hiring decisions.
