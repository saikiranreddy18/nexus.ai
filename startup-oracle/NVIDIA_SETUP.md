# Startup Oracle — NVIDIA API Setup

**Status:** ✅ NVIDIA fully supported  
**Default Model:** meta/llama-3.1-8b-instruct  
**No cost:** Free tier available

---

## Step 1: Get Your NVIDIA API Key

### Option A: NVIDIA API Catalog (Recommended)
1. Go to **https://build.nvidia.com/explore/discover**
2. Sign up or log in with your NVIDIA account
3. Browse available models (Llama, Mistral, etc.)
4. Click any model (e.g., "Meta Llama 3.1 8B Instruct")
5. Click **"Get API Key"** button
6. Copy the API key (format: `nvapi-...`)

### Option B: NVIDIA NIM Console
1. Visit **https://console.nvidia.com**
2. Navigate to **API Keys** section
3. Create new API key for inference
4. Copy the key

---

## Step 2: Configure Your Environment

### Create .env File
```bash
cd startup-oracle
cp .env.example .env
```

### Add NVIDIA API Key
Edit `startup-oracle/.env`:
```
NVIDIA_API_KEY=nvapi-<your-key-here>
ORACLE_MODEL=meta/llama-3.1-8b-instruct
```

### Verify .env
```bash
cat startup-oracle/.env
# Should show your NVIDIA_API_KEY (starts with nvapi-)
```

---

## Step 3: Available Models

The system supports any NVIDIA-hosted model. Popular options:

### Meta Llama (Recommended)
```
meta/llama-3.1-8b-instruct      — Fast, good reasoning
meta/llama-3.1-70b-instruct     — Larger, more powerful
meta/llama-3.2-1b-instruct      — Ultra-fast, lower quality
```

### Mistral
```
mistralai/mistral-7b-instruct-v0.2
mistralai/mistral-large
```

### Others
```
nvidia/nemotron-4-340b-instruct
upstage/solar-10.7b-instruct-v1.0
```

### Set Model (Optional)
```bash
# In .env, change:
ORACLE_MODEL=meta/llama-3.1-70b-instruct
```

---

## Step 4: Start the Server

```bash
cd startup-oracle
node server.js
```

**Expected output:**
```
Startup Oracle running on http://localhost:4100
  /api/stats — dataset info
  /api/search?q=... — retrieval only
  /api/advise?q=... — full analysis with LLM
```

---

## Step 5: Test It

### Test 1: Get Dataset Stats
```bash
curl http://localhost:4100/api/stats
```

**Response:**
```json
{
  "totalCases": 4016,
  "outcomes": {
    "failed": 1959,
    "success": 2057
  }
}
```

### Test 2: Search Cases (No LLM Cost)
```bash
curl "http://localhost:4100/api/search?q=AI%20coding%20tools&limit=3"
```

**Response:** 3 relevant startup cases

### Test 3: Full VC Analysis (With LLM)
```bash
curl "http://localhost:4100/api/advise?q=We%20are%20an%20AI%20coding%20assistant%20with%20%245M%20ARR%20and%2014%20months%20runway"
```

**Response:** VC analysis grounded in 5 retrieved cases

---

## How It Works (NVIDIA)

```
Your Pitch
    ↓
[Search: 4,016 cases via retrieval.js]
    ↓
[Get top 5 relevant cases]
    ↓
[Send to NVIDIA's Llama 3.1 8B]
    ↓
[LLM returns VC analysis]
    ↓
[Response with Verdict + Patterns + Constraints]
```

**All processing:** Your local server + NVIDIA's LLM

---

## Cost & Limits

### Free Tier
- **Requests per minute:** 50 RPM
- **Tokens per minute:** 50,000 TPM
- **Cost:** $0
- **Models:** All NVIDIA-hosted models

### Paid Tier
- Higher rate limits
- Same API key

**For this VC advisor:**
- Typical query: ~500 tokens (input) + ~500 tokens (output)
- Free tier supports: ~50 queries per minute
- **More than enough for testing**

---

## Environment Variables

### Required
```bash
NVIDIA_API_KEY=nvapi-...
```

### Optional
```bash
ORACLE_MODEL=meta/llama-3.1-8b-instruct
# Default if not set: meta/llama-3.1-8b-instruct
```

### Priority (if multiple keys set)
```
OPENROUTER_API_KEY (1st priority)
ANTHROPIC_API_KEY (2nd priority)
OPENAI_API_KEY (3rd priority)
NVIDIA_API_KEY (4th priority)
```

If you only set `NVIDIA_API_KEY`, system will use it exclusively.

---

## Troubleshooting

### Issue: "No LLM API key configured"
**Solution:** Make sure .env has `NVIDIA_API_KEY=nvapi-...`
```bash
cat startup-oracle/.env | grep NVIDIA_API_KEY
```

### Issue: "API error (401)"
**Solution:** API key is invalid or expired
1. Get a new key from https://build.nvidia.com
2. Update .env
3. Restart server

### Issue: "API error (429)"
**Solution:** Rate limit exceeded (50 req/min on free tier)
- Wait a minute before next request
- Or upgrade to paid tier

### Issue: Model not found
**Solution:** Check model name
- Valid: `meta/llama-3.1-8b-instruct`
- Invalid: `llama-3.1-8b` (missing prefix)

---

## Test Pitches to Try

### Pitch 1: AI Coding Tools
```
We're building an AI coding assistant for developers. Founded in 2021, $5M ARR, 200 customers. Burned $8M so far, 14 months runway left. Competitors: GitHub Copilot, Cursor. What's our path to profitability?
```

### Pitch 2: Marketplace
```
We connect remote contractors with Fortune 500 companies. Raised $2M, 50 buyers, $400K ARR. CAC: $3K, LTV: $45K. Runway: 18 months. Total addressable market: $200B+. Should we scale?
```

### Pitch 3: Healthcare AI
```
We're an AI diagnostic tool for radiology. 3 hospital pilots, $50K MRR pilot revenue, burning $200K/month. Need to show clinical evidence before Series A. Path to profitability unclear. How do we survive?
```

---

## Performance Expectations

| Operation | Time | Cost |
|-----------|------|------|
| /api/stats | ~10ms | $0 |
| /api/search (4,016 cases) | ~50-100ms | $0 |
| /api/advise (with LLM) | ~2-5 seconds | $0.01-0.02* |

*Approximate cost on NVIDIA free tier (no charge, but counts toward rate limit)

---

## FAQ

**Q: Is NVIDIA free?**  
A: Yes, free tier available with 50 req/min limit. Sufficient for testing.

**Q: Which model should I use?**  
A: `meta/llama-3.1-8b-instruct` is default. 8B is fast, 70B is higher quality.

**Q: Can I switch models?**  
A: Yes, just change `ORACLE_MODEL` in .env and restart.

**Q: What if I want to use Claude/GPT-4 later?**  
A: Set their API keys instead. System automatically prioritizes by provider order.

**Q: Does this support streaming?**  
A: Not yet, but responses come back within 2-5 seconds.

**Q: Can I use other NVIDIA models?**  
A: Yes, any model in NVIDIA's API catalog. Just set `ORACLE_MODEL=<model-name>`.

---

## Commands Quick Reference

```bash
# 1. Setup
cp startup-oracle/.env.example startup-oracle/.env
# Edit .env, add NVIDIA_API_KEY

# 2. Start
cd startup-oracle && node server.js

# 3. Test
curl http://localhost:4100/api/stats
curl "http://localhost:4100/api/search?q=healthcare&limit=3"
curl "http://localhost:4100/api/advise?q=We%20are%20a%20startup..."

# 4. Stop
Ctrl+C
```

---

## Next Steps

1. **Get API key:** https://build.nvidia.com
2. **Set .env:** Add `NVIDIA_API_KEY=nvapi-...`
3. **Start server:** `node startup-oracle/server.js`
4. **Test pitch:** `curl "http://localhost:4100/api/advise?q=..."`
5. **Monitor:** Check response quality and latency

---

**Status: ✅ Ready to run on NVIDIA**

All components verified. Just add your API key and start!
