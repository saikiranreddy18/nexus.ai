// Anthropic (native) provider. Streams from the Anthropic SDK with adaptive
// thinking and effort control.

import Anthropic from "@anthropic-ai/sdk";

// Cache one client per key so a Settings-page key change takes effect
// immediately without rebuilding a client on every call.
const clients = new Map();
function clientFor(key) {
  const k = key || "__env__";
  if (!clients.has(k)) clients.set(k, key ? new Anthropic({ apiKey: key }) : new Anthropic());
  return clients.get(k);
}

/**
 * @param {{ system: string, prompt: string, model: string, maxTokens: number, effort: string, key?: string }} opts
 * @returns {Promise<string>}
 */
export async function callAnthropic({ system, prompt, model, maxTokens, effort, key }) {
  const stream = clientFor(key).messages.stream({
    model,
    max_tokens: maxTokens,
    thinking: { type: "adaptive" },
    output_config: { effort },
    system,
    messages: [{ role: "user", content: prompt }],
  });

  const message = await stream.finalMessage();

  if (message.stop_reason === "refusal") {
    const detail = message.stop_details?.explanation || "safety refusal";
    throw new Error(`Model declined the request (${detail}).`);
  }

  return message.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim();
}
