// LLM dispatch layer. The rest of the app calls `callAgent(...)` and doesn't
// care which provider or model runs underneath.
//
// Provider + model + keys resolve LIVE on every call from (in order):
//   1. config/settings.json  ← the Settings page writes here (no restart needed)
//   2. environment variables (LLM_PROVIDER, AGENT_MODEL, <PROVIDER>_API_KEY…)
//   3. auto-pick: first provider that has a key
//
// Supported providers: openrouter (any model) · anthropic · openai · google · nvidia

import { callOpenRouter } from "./providers/openrouter.js";
import { callAnthropic } from "./providers/anthropic.js";
import { callOpenAI } from "./providers/openai.js";
import { callGoogle } from "./providers/google.js";
import { callNvidia } from "./providers/nvidia.js";
import { resolveLLM } from "./settings.js";

const DISPATCH = {
  openrouter: callOpenRouter,
  anthropic: callAnthropic,
  openai: callOpenAI,
  google: callGoogle,
  nvidia: callNvidia,
};

/** Current provider/model/effort — resolved from settings + env right now. */
export function getLLMInfo() {
  const { provider, model, effort, maxTokens, hasKey } = resolveLLM();
  return { provider, model, effort, maxTokens, hasKey };
}

/**
 * Run one agent turn on the currently-configured provider/model.
 * @param {{ system: string, prompt: string, maxTokens?: number }} opts
 * @returns {Promise<string>}
 */
export async function callAgent({ system, prompt, maxTokens }) {
  const cfg = resolveLLM();
  const fn = DISPATCH[cfg.provider];
  if (!fn) {
    throw new Error(
      `Unknown provider "${cfg.provider}" — use one of: ${Object.keys(DISPATCH).join(", ")}.`
    );
  }
  return fn({
    system,
    prompt,
    model: cfg.model,
    maxTokens: maxTokens || cfg.maxTokens,
    effort: cfg.effort,
    key: cfg.key,
  });
}
