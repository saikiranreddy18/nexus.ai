// OpenAI (direct) provider — plain fetch against the Chat Completions API.
// Works with gpt-4o / gpt-4o-mini / gpt-4.1 / o-series (reasoning) models.
// ChatGPT/Codex OAuth sign-in is on the roadmap (see FOUNDER-OS-PLAN.md);
// for now this uses an API key.

const ENDPOINT = "https://api.openai.com/v1/chat/completions";

/**
 * @param {{ system: string, prompt: string, model: string, maxTokens: number, key: string }} opts
 * @returns {Promise<string>}
 */
export async function callOpenAI({ system, prompt, model, maxTokens, key }) {
  if (!key) throw new Error("Set an OpenAI API key (Settings page or OPENAI_API_KEY).");

  const body = {
    model,
    messages: [
      { role: "system", content: system },
      { role: "user", content: prompt },
    ],
  };
  // o-series / gpt-5 reasoning models reject max_tokens; older chat models accept both.
  if (/^(o\d|gpt-5)/i.test(model)) body.max_completion_tokens = maxTokens;
  else body.max_tokens = maxTokens;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Number(process.env.LLM_TIMEOUT_MS || 300000));

  let res;
  try {
    res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (err) {
    if (err.name === "AbortError") throw new Error(`OpenAI request timed out for "${model}".`);
    throw err;
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`OpenAI ${res.status} for "${model}": ${text.slice(0, 300)}`);
  }
  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content || !content.trim()) throw new Error(`OpenAI returned no content for "${model}".`);
  return content.trim();
}
