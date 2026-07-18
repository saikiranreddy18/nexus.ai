import OpenAI from "openai";
import type { AIProviderClient, AIProviderName, GenerateJSONParams } from "../types";
import { isPlaceholderKey } from "../types";

/**
 * OpenRouter and NVIDIA NIM both expose an OpenAI-compatible chat completions
 * endpoint, so they share one implementation — only baseURL/key/model/label
 * differ between the two thin wrappers that call this factory.
 *
 * Structured output support varies a lot across the open models these two
 * proxy (unlike Anthropic's dedicated json_schema mode), so this always
 * requests response_format: json_object (the widely-supported baseline) and
 * additionally spells out the target schema in the system prompt, then
 * parses + trusts the model to comply. This is the safe common denominator
 * across "any provider" rather than assuming strict schema enforcement.
 */
export function createOpenAICompatibleProvider(config: {
  name: AIProviderName;
  apiKeyEnv: string;
  baseURL: string;
  modelEnv: string;
  defaultModel: string;
}): AIProviderClient {
  let client: OpenAI | null = null;

  function getClient(): OpenAI {
    client ??= new OpenAI({
      apiKey: process.env[config.apiKeyEnv],
      baseURL: config.baseURL,
    });
    return client;
  }

  return {
    name: config.name,

    isConfigured() {
      return !isPlaceholderKey(process.env[config.apiKeyEnv]);
    },

    async generateJSON({ system, user, schema, schemaName, maxTokens = 8000 }: GenerateJSONParams) {
      if (!this.isConfigured()) {
        throw new Error(
          `${config.apiKeyEnv} is not set. Add it to .env.local to use the ${config.name} provider.`
        );
      }

      const schemaInstructions = `\n\nRespond with ONLY a JSON object named "${schemaName}" matching this JSON Schema, no prose before or after:\n${JSON.stringify(schema)}`;

      let completion: OpenAI.Chat.Completions.ChatCompletion;
      try {
        completion = await getClient().chat.completions.create({
          model: process.env[config.modelEnv] || config.defaultModel,
          max_tokens: maxTokens,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: system + schemaInstructions },
            { role: "user", content: user },
          ],
        });
      } catch (error) {
        if (error instanceof OpenAI.AuthenticationError) {
          throw new Error(`${config.name} API key is invalid or revoked.`);
        }
        if (error instanceof OpenAI.RateLimitError) {
          throw new Error(`${config.name} rate limit reached — please try again shortly.`);
        }
        if (error instanceof OpenAI.APIConnectionError) {
          throw new Error(`Could not reach ${config.name} — check your network connection.`);
        }
        if (error instanceof OpenAI.APIError) {
          throw new Error(`${config.name} API error (${error.status ?? "unknown"}): ${error.message}`);
        }
        throw error;
      }

      const choice = completion.choices[0];
      if (choice?.finish_reason === "length") {
        throw new Error("The response was truncated — please retry.");
      }

      const text = choice?.message?.content;
      if (!text) {
        throw new Error(`The ${config.name} model returned an empty response.`);
      }

      try {
        return JSON.parse(text) as Record<string, unknown>;
      } catch {
        throw new Error(`Failed to parse the ${schemaName} response as JSON.`);
      }
    },
  };
}
