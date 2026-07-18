// Google Gemini provider — Generative Language API via plain fetch.
// Models: gemini-2.0-flash, gemini-2.0-pro, gemini-1.5-pro, …

/**
 * @param {{ system: string, prompt: string, model: string, maxTokens: number, key: string }} opts
 * @returns {Promise<string>}
 */
export async function callGoogle({ system, prompt, model, maxTokens, key }) {
  if (!key) throw new Error("Set a Google API key (Settings page or GOOGLE_API_KEY).");

  const endpoint =
    `https://generativelanguage.googleapis.com/v1beta/models/` +
    `${encodeURIComponent(model)}:generateContent`;

  const body = {
    systemInstruction: { parts: [{ text: system }] },
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: { maxOutputTokens: maxTokens },
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Number(process.env.LLM_TIMEOUT_MS || 300000));

  let res;
  try {
    res = await fetch(endpoint, {
      method: "POST",
      // Key goes in a header, not the URL, so it never lands in access logs.
      headers: { "x-goog-api-key": key, "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (err) {
    if (err.name === "AbortError") throw new Error(`Google request timed out for "${model}".`);
    throw err;
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Google ${res.status} for "${model}": ${text.slice(0, 300)}`);
  }
  const data = await res.json();
  const parts = data?.candidates?.[0]?.content?.parts || [];
  const content = parts.map((p) => p.text || "").join("");
  if (!content.trim()) throw new Error(`Google returned no content for "${model}".`);
  return content.trim();
}
