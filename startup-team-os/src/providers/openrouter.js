// OpenRouter provider. Runs any model on https://openrouter.ai using its
// OpenAI-compatible chat-completions endpoint. No SDK dependency — plain fetch.
//
// Pick any model with AGENT_MODEL, e.g.:
//   openai/gpt-4o            anthropic/claude-opus-4-8      google/gemini-2.0-flash
//   meta-llama/llama-3.3-70b-instruct   deepseek/deepseek-chat   x-ai/grok-2

const ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";

/**
 * @param {{ system: string, prompt: string, model: string, maxTokens: number, effort?: string, key?: string }} opts
 * @returns {Promise<string>}
 */
export async function callOpenRouter({ system, prompt, model, maxTokens, effort, key }) {
  key = key || process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error("Set an OpenRouter key (Settings page or OPENROUTER_API_KEY — https://openrouter.ai/keys).");

  const body = {
    model,
    messages: [
      { role: "system", content: system },
      { role: "user", content: prompt },
    ],
    max_tokens: maxTokens,
  };

  // Only send a reasoning hint when explicitly enabled — many models on
  // OpenRouter are not reasoning models and would reject it.
  if (process.env.OPENROUTER_REASONING === "true" && effort) {
    body.reasoning = { effort };
  }

  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    Number(process.env.LLM_TIMEOUT_MS || 300000)
  );

  let res;
  try {
    res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        // Optional attribution headers OpenRouter recommends.
        "HTTP-Referer": process.env.OPENROUTER_SITE || "https://github.com/startup-team-os",
        "X-Title": "Startup Team OS",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (err) {
    if (err.name === "AbortError") throw new Error(`OpenRouter request timed out for model "${model}".`);
    throw err;
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`OpenRouter ${res.status} for "${model}": ${text.slice(0, 300)}`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content || !content.trim()) {
    throw new Error(`OpenRouter returned no content for "${model}".`);
  }
  return content.trim();
}
