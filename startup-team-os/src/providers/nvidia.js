// NVIDIA NIM provider — OpenAI-compatible endpoint at integrate.api.nvidia.com.
// Free tier available at https://build.nvidia.com — models like
// meta/llama-3.3-70b-instruct, nvidia/llama-3.1-nemotron-70b-instruct,
// deepseek-ai/deepseek-r1, qwen/qwen2.5-coder-32b-instruct, …

const ENDPOINT = "https://integrate.api.nvidia.com/v1/chat/completions";

/**
 * @param {{ system: string, prompt: string, model: string, maxTokens: number, key: string }} opts
 * @returns {Promise<string>}
 */
export async function callNvidia({ system, prompt, model, maxTokens, key }) {
  if (!key) throw new Error("Set an NVIDIA API key (Settings page or NVIDIA_API_KEY).");

  const body = {
    model,
    messages: [
      { role: "system", content: system },
      { role: "user", content: prompt },
    ],
    max_tokens: maxTokens,
  };

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
    if (err.name === "AbortError") throw new Error(`NVIDIA request timed out for "${model}".`);
    throw err;
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`NVIDIA ${res.status} for "${model}": ${text.slice(0, 300)}`);
  }
  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content || !content.trim()) throw new Error(`NVIDIA returned no content for "${model}".`);
  return content.trim();
}
