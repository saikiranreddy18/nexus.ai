# Startup Oracle — RAG VC Advisor

A production-ready Retrieval-Augmented Generation (RAG) system that analyzes startup pitches using 4,016 verified case studies powered by NVIDIA's Llama 3.1 LLM.

**Status:** ✅ **PRODUCTION READY**

---

## Quick Start

### 1. Get NVIDIA API Key (FREE)
Visit https://build.nvidia.com → Select model → Click "Get API Key" → Copy `nvapi-...`

### 2. Configure
```bash
cp .env.example .env
# Edit .env, add: NVIDIA_API_KEY=nvapi-<your-key>
```

### 3. Run
```bash
node server.js
```

### 4. Test
```bash
curl "http://localhost:4100/api/advise?q=We%20are%20an%20AI%20coding%20assistant%20with%20%245M%20ARR"
```

---

## What It Does

```
Your Startup Pitch
    ↓
[Search 4,016 verified cases]
    ↓
[Retrieve top 5 most relevant]
    ↓
[Send to NVIDIA Llama 3.1]
    ↓
[VC Analysis grounded in real history]
```

---

## API Endpoints

### `/api/stats`
Get dataset overview:
```bash
curl http://localhost:4100/api/stats
# Returns: 4,016 cases (1,959 failed, 2,057 success)
```

### `/api/search?q=<query>&limit=<N>`
Search cases without LLM cost:
```bash
curl "http://localhost:4100/api/search?q=healthcare%20AI&limit=3"
```

### `/api/advise?q=<pitch>`
Full VC analysis with LLM reasoning:
```bash
curl "http://localhost:4100/api/advise?q=We%20connect%20contractors%20with%20enterprises"
```

---

## Architecture

**Knowledge Base (Brain):**
- 4,016 verified startup cases
- Schema: name, outcome, industry, lesson, causes, metrics
- File: `data/enriched-master.json` (2.8 MB)

**Search Engine:**
- Keyword-based semantic retrieval
- Scoring: token overlap + industry match + cause match
- Speed: ~50-100ms for 4,016 cases

**LLM Dispatch:**
- NVIDIA: meta/llama-3.1-8b-instruct (default)
- Fallback: Claude, GPT-4, OpenRouter
- Temperature: 0.7, Max tokens: 1024

**VC Advisor Prompt:**
- 6-point framework: Verdict, Patterns, Economics, Constraints, Actions, Kill Criteria
- Evidence-first approach
- No generic advice

---

## Configuration

**Environment Variables** (in `.env`):
```bash
# NVIDIA (recommended, free tier available)
NVIDIA_API_KEY=nvapi-...
ORACLE_MODEL=meta/llama-3.1-8b-instruct  # Optional

# Alternative LLMs (set only one):
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
OPENROUTER_API_KEY=sk-or-...
```

**Priority Order:**
1. OPENROUTER_API_KEY
2. ANTHROPIC_API_KEY
3. OPENAI_API_KEY
4. NVIDIA_API_KEY (recommended)

---

## Deployment

### Local
```bash
node server.js
# Runs on http://localhost:4100
```

### Docker (optional)
```bash
docker build -t startup-oracle .
docker run -e NVIDIA_API_KEY=nvapi-... -p 4100:4100 startup-oracle
```

### Production
- Use environment variables for API keys (never hardcode)
- Set `NODE_ENV=production`
- Use reverse proxy (nginx) for SSL/TLS
- Monitor logs for errors

---

## Files

```
startup-oracle/
├── README.md                    ← You are here
├── CHANGELOG.md                 (Session history)
├── VERIFICATION_REPORT.md       (System verification)
├── NVIDIA_SETUP.md              (NVIDIA setup guide)
├── RAG_SYSTEM.md                (Architecture details)
├── server.js                    (Main HTTP server)
├── src/
│   ├── brain.js                 (VC advisor prompt)
│   ├── retrieval.js             (Search engine)
│   └── llm.js                   (LLM dispatch)
├── data/
│   └── enriched-master.json     (4,016 startup cases)
├── .env.example                 (Configuration template)
└── package.json                 (Dependencies)
```

---

## Cost & Rate Limits

**NVIDIA Free Tier:**
- Cost: $0
- Requests/minute: 50
- Tokens/minute: 50,000
- Credit card: Not required

**This Agent:**
- Typical query: ~500 tokens
- Supports: ~50 analyses/minute on free tier
- More than sufficient for testing

---

## Supported Models

### NVIDIA (Default)
```
meta/llama-3.1-8b-instruct      (fast, balanced)
meta/llama-3.1-70b-instruct     (larger, higher quality)
mistralai/mistral-7b-instruct-v0.2
```

### Alternative Providers
```
claude-3-5-sonnet (Anthropic)
gpt-4o-mini (OpenAI)
Any OpenRouter model
```

Change model in `.env`:
```
ORACLE_MODEL=meta/llama-3.1-70b-instruct
```

---

## Troubleshooting

**"No LLM API key configured"**
- Verify `.env` has `NVIDIA_API_KEY=nvapi-...`
- Check: `cat .env | grep NVIDIA_API_KEY`

**"API error (401)"**
- API key invalid or expired
- Get new key: https://build.nvidia.com
- Update `.env` and restart

**"API error (429)"**
- Rate limit exceeded (50 req/min)
- Wait a minute or upgrade to paid tier

**Port 4100 already in use**
- Check: `lsof -i :4100`
- Kill process: `kill -9 <PID>`
- Or use different port: `PORT=4101 node server.js`

---

## Documentation

- **NVIDIA_SETUP.md** — Complete NVIDIA API setup + FAQ
- **RAG_SYSTEM.md** — Architecture, retrieval scoring, LLM dispatch
- **VERIFICATION_REPORT.md** — System testing & verification results
- **CHANGELOG.md** — All changes made in this session

---

## Performance

| Operation | Time | Cost |
|-----------|------|------|
| /api/stats | ~10ms | $0 |
| /api/search | ~50-100ms | $0 |
| /api/advise | ~2-5s | ~$0.01* |

*Approximate, depends on model and token count

---

## Example Pitches

### AI Coding Assistant
```
We're an AI coding assistant for developers. Founded 2021, $5M ARR, 200 customers. Burned $8M, 14 months runway. Competitors: GitHub Copilot, Cursor.
```

### Marketplace
```
We connect remote contractors with Fortune 500 companies. $2M raised, 50 buyers, $400K ARR. CAC $3K, LTV $45K, 18 months runway.
```

### Healthcare AI
```
AI diagnostic tool for radiology. 3 pilots, $50K MRR, burning $200K/month. Need clinical evidence before Series A.
```

---

## Why RAG (Not Fine-Tuning)?

| Factor | RAG | Fine-Tuning |
|--------|-----|-------------|
| **GPU Required** | No | Yes (6-8GB) |
| **Training Time** | Instant | 2-3 hours |
| **Model Quality** | State-of-art | Domain-specific |
| **Knowledge Updates** | Add cases anytime | Retrain everything |
| **Cost** | Low (API calls) | High (GPU + API) |
| **Transparency** | See which cases influenced output | Black-box |
| **Deployment** | Simple (1 server) | Complex |

---

## Support & Links

- **NVIDIA API:** https://build.nvidia.com
- **Setup Guide:** See NVIDIA_SETUP.md
- **Architecture:** See RAG_SYSTEM.md
- **Issues:** Check VERIFICATION_REPORT.md

---

## License

This project uses publicly available startup case data and open-source LLMs.

---

**Status: ✅ Production Ready**

Set your API key and start analyzing pitches grounded in 4,016 real startup case studies.
