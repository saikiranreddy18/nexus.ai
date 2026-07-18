// Persistent runtime settings — provider, model, keys, per-agent integrations.
// Stored in config/settings.json (gitignored). Env vars are the fallback for
// every value, so the app still works with nothing but an env key set.
//
// Secrets policy: API keys are returned MASKED by getPublicSettings(); a
// masked or empty value posted back is ignored so saves never clobber a
// stored key. Keys are never included in prompts.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const CONFIG_DIR = join(here, "..", "config");
const FILE = join(CONFIG_DIR, "settings.json");

export const PROVIDERS = ["openrouter", "anthropic", "openai", "google", "nvidia"];

export const PROVIDER_DEFAULT_MODELS = {
  openrouter: "openai/gpt-4o",
  anthropic: "claude-opus-4-8",
  openai: "gpt-4o",
  google: "gemini-2.0-flash",
  nvidia: "meta/llama-3.3-70b-instruct",
};

const ENV_KEYS = {
  openrouter: "OPENROUTER_API_KEY",
  anthropic: "ANTHROPIC_API_KEY",
  openai: "OPENAI_API_KEY",
  google: "GOOGLE_API_KEY",
  nvidia: "NVIDIA_API_KEY",
};

const EMPTY = { provider: "", model: "", effort: "", maxTokens: 0, keys: {}, integrations: {} };

export function loadSettings() {
  try {
    return { ...EMPTY, ...JSON.parse(readFileSync(FILE, "utf8")) };
  } catch {
    return { ...EMPTY };
  }
}

function persist(s) {
  mkdirSync(CONFIG_DIR, { recursive: true });
  writeFileSync(FILE, JSON.stringify(s, null, 2), "utf8");
}

export function mask(v) {
  if (!v) return "";
  return v.length > 10 ? v.slice(0, 4) + "…" + v.slice(-4) : "•••";
}

const isMasked = (v) => typeof v === "string" && (v.includes("…") || v === "•••");

/** Settings safe to send to the browser — every secret masked. */
export function getPublicSettings() {
  const s = loadSettings();
  const keys = {};
  for (const p of PROVIDERS) {
    keys[p] = mask(s.keys?.[p] || "") || (process.env[ENV_KEYS[p]] ? "(from env) " + mask(process.env[ENV_KEYS[p]]) : "");
  }
  const integrations = {};
  for (const [agent, svcs] of Object.entries(s.integrations || {})) {
    integrations[agent] = {};
    for (const [svc, cfg] of Object.entries(svcs || {})) {
      integrations[agent][svc] = { enabled: !!cfg.enabled, value: mask(cfg.value || "") };
    }
  }
  // resolveLLM() carries the raw key for internal use — strip it before
  // anything leaves the server.
  const { key: _secret, ...resolved } = resolveLLM();
  return {
    provider: s.provider || "",
    model: s.model || "",
    effort: s.effort || "",
    maxTokens: s.maxTokens || 0,
    keys,
    integrations,
    resolved, // what the app will actually use right now (no secret)
  };
}

/** Merge a browser-submitted patch. Masked/empty secrets never overwrite. */
export function saveSettings(patch = {}) {
  const s = loadSettings();
  if (typeof patch.provider === "string") s.provider = patch.provider.trim().toLowerCase();
  if (typeof patch.model === "string") s.model = patch.model.trim();
  if (typeof patch.effort === "string") s.effort = patch.effort.trim().toLowerCase();
  if (patch.maxTokens != null && !Number.isNaN(+patch.maxTokens)) s.maxTokens = Math.max(0, +patch.maxTokens);

  if (patch.keys && typeof patch.keys === "object") {
    s.keys = s.keys || {};
    for (const p of PROVIDERS) {
      const v = patch.keys[p];
      if (v === null) delete s.keys[p];                       // explicit clear
      else if (typeof v === "string" && v.trim() && !isMasked(v.trim()) && !v.startsWith("(from env)")) {
        s.keys[p] = v.trim();
      }
    }
  }

  if (patch.integrations && typeof patch.integrations === "object") {
    s.integrations = s.integrations || {};
    for (const [agent, svcs] of Object.entries(patch.integrations)) {
      if (!svcs || typeof svcs !== "object") continue;
      s.integrations[agent] = s.integrations[agent] || {};
      for (const [svc, cfg] of Object.entries(svcs)) {
        if (!cfg || typeof cfg !== "object") continue;
        const prev = s.integrations[agent][svc] || { enabled: false, value: "" };
        const next = { enabled: !!cfg.enabled, value: prev.value };
        if (typeof cfg.value === "string" && cfg.value.trim() && !isMasked(cfg.value.trim())) {
          next.value = cfg.value.trim();
        }
        if (cfg.value === null) next.value = "";
        s.integrations[agent][svc] = next;
      }
    }
  }
  persist(s);
  return getPublicSettings();
}

/** The provider/model/key/effort the app should use RIGHT NOW (settings > env). */
export function resolveLLM() {
  const s = loadSettings();
  const keyFor = (p) => s.keys?.[p] || process.env[ENV_KEYS[p]] || "";

  let provider = s.provider || (process.env.LLM_PROVIDER || "").toLowerCase();
  if (!provider) {
    provider = PROVIDERS.find((p) => keyFor(p)) || "openrouter"; // first provider with a key
  }
  const model = s.model || process.env.AGENT_MODEL || PROVIDER_DEFAULT_MODELS[provider] || "";
  const effort = s.effort || process.env.AGENT_EFFORT || "high";
  const maxTokens = s.maxTokens || Number(process.env.AGENT_MAX_TOKENS || 24000);
  return { provider, model, effort, maxTokens, key: keyFor(provider), hasKey: !!keyFor(provider) };
}
