import Anthropic from "@anthropic-ai/sdk";
import type { AIProviderClient, GenerateJSONParams } from "../types";
import { isPlaceholderKey } from "../types";

let _client: Anthropic | null = null;

function getClient(): Anthropic {
  _client ??= new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return _client;
}

export const anthropicProvider: AIProviderClient = {
  name: "anthropic",

  isConfigured() {
    return !isPlaceholderKey(process.env.ANTHROPIC_API_KEY);
  },

  async generateJSON({ system, user, schema, schemaName, maxTokens = 8000 }: GenerateJSONParams) {
    if (!this.isConfigured()) {
      throw new Error(
        "ANTHROPIC_API_KEY is not set. Add it to .env.local to enable AI feedback."
      );
    }

    const client = getClient();
    let response: Anthropic.Message;
    try {
      response = await client.messages.create({
        model: process.env.ANTHROPIC_MODEL || "claude-opus-4-8",
        max_tokens: maxTokens,
        thinking: { type: "adaptive" },
        system,
        output_config: {
          format: {
            type: "json_schema",
            schema: { ...schema, additionalProperties: false },
          },
        },
        messages: [{ role: "user", content: user }],
      });
    } catch (error) {
      if (error instanceof Anthropic.AuthenticationError) {
        throw new Error("Anthropic API key is invalid or revoked.");
      }
      if (error instanceof Anthropic.RateLimitError) {
        throw new Error("Anthropic API rate limit reached — please try again shortly.");
      }
      if (error instanceof Anthropic.APIConnectionError) {
        throw new Error("Could not reach the Anthropic API — check your network connection.");
      }
      if (error instanceof Anthropic.APIError) {
        throw new Error(`Anthropic API error (${error.status ?? "unknown"}): ${error.message}`);
      }
      throw error;
    }

    if (response.stop_reason === "refusal") {
      throw new Error("The model declined to respond.");
    }
    if (response.stop_reason === "max_tokens") {
      throw new Error("The response was truncated — please retry.");
    }

    const text = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("");

    if (!text) {
      throw new Error("The model returned an empty response.");
    }

    try {
      return JSON.parse(text) as Record<string, unknown>;
    } catch {
      throw new Error(`Failed to parse the ${schemaName} response as JSON.`);
    }
  },
};
