// HTTP server for cloud deployment. Exposes the pipeline as an API plus a tiny
// web form so you can drive it from a browser once it's on your own server.
//
//   GET  /              → minimal web UI (submit an idea, get a blueprint)
//   GET  /office        → live 3D virtual office (watch the agents work)
//   GET  /settings      → system settings page (providers, keys, integrations)
//   GET  /health        → { ok: true } health check for the platform
//   POST /run           → { idea } → { blueprint, sections, model, effort }
//   GET  /run/stream    → SSE: full-pipeline progress + blueprint (drives /office)
//   POST /task          → { task } → CEO routes it → { assignee, result }
//   GET  /task/stream   → SSE: single-task routing + execution (drives /office)
//   GET  /api/settings  → current settings (secrets masked)
//   POST /api/settings  → save settings patch
//   POST /api/test      → fire a 1-line test call on the configured provider
//   GET  /agents        → the roster of agents and their responsibilities
//
// Start: node src/server.js   (listens on $PORT, default 3000)

import http from "node:http";
import { readFile } from "node:fs/promises";
import { join, dirname, normalize, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { runStartupPipeline } from "./orchestrator.js";
import { routeAndRun } from "./router.js";
import { AGENT_LIST } from "./agents.js";
import { getPublicSettings, saveSettings } from "./settings.js";
import { callAgent, getLLMInfo } from "./llm.js";

const here = dirname(fileURLToPath(import.meta.url));
const publicDir = normalize(join(here, "..", "public"));

const MIME = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
};

// Serve a file from /public (with a path-traversal guard). Returns false on miss.
async function serveStatic(res, rel) {
  const path = normalize(join(publicDir, rel));
  if (!path.startsWith(publicDir)) return false;
  try {
    const data = await readFile(path);
    res.writeHead(200, { "content-type": MIME[extname(path).toLowerCase()] || "application/octet-stream" });
    res.end(data);
    return true;
  } catch {
    return false;
  }
}

const PORT = Number(process.env.PORT || 3000);

// Optional shared-secret gate. If RUN_API_KEY is set, POST /run requires
// an "x-api-key" header that matches it. Leave unset to run open.
const RUN_API_KEY = process.env.RUN_API_KEY || "";

const json = (res, code, body) => {
  res.writeHead(code, { "content-type": "application/json" });
  res.end(JSON.stringify(body));
};

async function readBody(req) {
  let data = "";
  for await (const chunk of req) data += chunk;
  return data ? JSON.parse(data) : {};
}

const HOME = `<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Startup Team OS</title>
<style>
  body{font-family:system-ui,sans-serif;max-width:720px;margin:3rem auto;padding:0 1rem;line-height:1.5}
  textarea{width:100%;min-height:110px;padding:.75rem;font-size:1rem;box-sizing:border-box}
  button{margin-top:.75rem;padding:.6rem 1.4rem;font-size:1rem;cursor:pointer}
  #out{white-space:pre-wrap;background:#f6f6f6;padding:1rem;margin-top:1.5rem;border-radius:8px}
  .muted{color:#666}
</style></head><body>
<h1>🚀 Startup Team OS</h1>
<p class="muted">Describe a business idea. Seven AI specialists — CEO, market research, sales,
content, developer, data, and support — will build a full startup blueprint automatically.</p>
<p><a href="/office">🏢 Open the live 3D office →</a> &nbsp; watch the agents work in real time.
&nbsp;·&nbsp; <a href="/settings">⚙️ System settings</a></p>
<textarea id="idea" placeholder="e.g. A subscription service that delivers curated indie board games monthly"></textarea>
<div><button onclick="run()">Build my startup blueprint</button></div>
<div id="out" class="muted">Output appears here. A full run takes a few minutes.</div>
<script>
async function run(){
  const idea=document.getElementById('idea').value.trim();
  const out=document.getElementById('out');
  if(!idea){out.textContent='Please enter an idea.';return;}
  out.textContent='⏳ The team is working… this takes a few minutes.';
  try{
    const r=await fetch('/run',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({idea})});
    const d=await r.json();
    out.textContent = r.ok ? d.blueprint : ('Error: '+(d.error||r.status));
  }catch(e){out.textContent='Error: '+e.message;}
}
</script></body></html>`;

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === "GET" && req.url === "/health") {
      return json(res, 200, { ok: true });
    }

    if (req.method === "GET" && req.url === "/agents") {
      return json(res, 200, {
        agents: AGENT_LIST.map((a) => ({ id: a.id, name: a.name })),
      });
    }

    // Live 3D virtual office + its assets (static files from /public).
    if (req.method === "GET") {
      const path = req.url.split("?")[0];
      if (path === "/office" && (await serveStatic(res, "office.html"))) return;
      if (path === "/office-classic" && (await serveStatic(res, "office-classic.html"))) return;
      if (path === "/settings" && (await serveStatic(res, "settings.html"))) return;
      if (path.startsWith("/vendor/")) {
        if (await serveStatic(res, path.slice(1))) return;
        return json(res, 404, { error: "not found" });
      }
    }

    // ── Settings API (secrets always masked on the way out) ──────────────
    const authed = (req) => !RUN_API_KEY || req.headers["x-api-key"] === RUN_API_KEY;

    if (req.url === "/api/settings" && req.method === "GET") {
      if (!authed(req)) return json(res, 401, { error: "unauthorized" });
      return json(res, 200, getPublicSettings());
    }
    if (req.url === "/api/settings" && req.method === "POST") {
      if (!authed(req)) return json(res, 401, { error: "unauthorized" });
      const patch = await readBody(req);
      return json(res, 200, saveSettings(patch));
    }
    // Fire one tiny real call on the configured provider to prove it works.
    if (req.url === "/api/test" && req.method === "POST") {
      if (!authed(req)) return json(res, 401, { error: "unauthorized" });
      const info = getLLMInfo();
      if (!info.hasKey) {
        return json(res, 400, { ok: false, ...info, error: `No API key configured for "${info.provider}".` });
      }
      const t0 = Date.now();
      try {
        const reply = await callAgent({
          system: "You are a connectivity test. Reply with exactly: OK",
          prompt: "Reply with exactly: OK",
          maxTokens: 20,
        });
        return json(res, 200, { ok: true, provider: info.provider, model: info.model, ms: Date.now() - t0, reply: reply.slice(0, 40) });
      } catch (err) {
        return json(res, 502, { ok: false, provider: info.provider, model: info.model, ms: Date.now() - t0, error: err.message });
      }
    }

    // ── Single-task mode: CEO routes → specialist executes ───────────────
    if (req.method === "POST" && req.url === "/task") {
      if (!authed(req)) return json(res, 401, { error: "unauthorized" });
      const { task } = await readBody(req);
      if (!task || !task.trim()) return json(res, 400, { error: "task is required" });
      const result = await routeAndRun(task, ({ stage, agent, status }) =>
        console.log(`[${stage}] ${agent} — ${status}`)
      );
      return json(res, 200, result);
    }

    if (req.method === "GET" && req.url.startsWith("/task/stream")) {
      const url = new URL(req.url, "http://localhost");
      const task = (url.searchParams.get("task") || "").trim();
      const key = url.searchParams.get("key") || "";

      res.writeHead(200, {
        "content-type": "text/event-stream",
        "cache-control": "no-cache",
        connection: "keep-alive",
      });
      const send = (event, data) =>
        res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
      const heartbeat = setInterval(() => res.write(":ka\n\n"), 15000);
      req.on("close", () => clearInterval(heartbeat));

      if (RUN_API_KEY && key !== RUN_API_KEY) {
        send("error", { error: "unauthorized" });
        clearInterval(heartbeat);
        return res.end();
      }
      if (!task) {
        send("error", { error: "task is required" });
        clearInterval(heartbeat);
        return res.end();
      }
      try {
        const result = await routeAndRun(task, (evt) => send("progress", evt));
        const info = getLLMInfo();
        send("done", { ...result, provider: info.provider, model: info.model });
      } catch (err) {
        send("error", { error: err.message });
      }
      clearInterval(heartbeat);
      return res.end();
    }

    // Server-Sent Events: stream pipeline progress + final blueprint.
    // EventSource can't send headers, so the API key (if required) comes via ?key=.
    if (req.method === "GET" && req.url.startsWith("/run/stream")) {
      const url = new URL(req.url, "http://localhost");
      const idea = (url.searchParams.get("idea") || "").trim();
      const key = url.searchParams.get("key") || "";

      res.writeHead(200, {
        "content-type": "text/event-stream",
        "cache-control": "no-cache",
        connection: "keep-alive",
      });
      const send = (event, data) =>
        res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);

      // A single agent turn can run for minutes with no bytes written in
      // between — send a comment ping every 15s so idle-timeout proxies
      // (Render, Heroku, nginx, most LB defaults) don't kill the connection
      // mid-run. SSE comments (":...") are ignored by EventSource clients.
      const heartbeat = setInterval(() => res.write(":ka\n\n"), 15000);
      req.on("close", () => clearInterval(heartbeat));

      if (RUN_API_KEY && key !== RUN_API_KEY) {
        send("error", { error: "unauthorized" });
        clearInterval(heartbeat);
        return res.end();
      }
      if (!idea) {
        send("error", { error: "idea is required" });
        clearInterval(heartbeat);
        return res.end();
      }

      try {
        const result = await runStartupPipeline(idea, (evt) => send("progress", evt));
        send("done", {
          provider: result.provider,
          model: result.model,
          effort: result.effort,
          blueprint: result.blueprint,
        });
      } catch (err) {
        send("error", { error: err.message });
      }
      clearInterval(heartbeat);
      return res.end();
    }

    if (req.method === "GET" && (req.url === "/" || req.url === "")) {
      res.writeHead(200, { "content-type": "text/html" });
      return res.end(HOME);
    }

    if (req.method === "POST" && req.url === "/run") {
      if (RUN_API_KEY && req.headers["x-api-key"] !== RUN_API_KEY) {
        return json(res, 401, { error: "unauthorized" });
      }
      const { idea } = await readBody(req);
      if (!idea || !idea.trim()) {
        return json(res, 400, { error: "idea is required" });
      }
      const result = await runStartupPipeline(idea, ({ stage, agent, status }) =>
        console.log(`[${stage}] ${agent} — ${status}`)
      );
      return json(res, 200, {
        idea: result.idea,
        provider: result.provider,
        model: result.model,
        effort: result.effort,
        sections: result.sections,
        blueprint: result.blueprint,
      });
    }

    return json(res, 404, { error: "not found" });
  } catch (err) {
    console.error(err);
    return json(res, 500, { error: err.message });
  }
});

server.listen(PORT, () => {
  console.log(`Startup Team OS listening on http://localhost:${PORT}`);
});
