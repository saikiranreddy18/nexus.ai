/**
 * Provider-agnostic AI layer for FounderOS.
 *
 * Every phase calls generateJSON() from lib/ai/client.ts instead of talking
 * to a specific vendor SDK. Swapping providers is a single env var
 * (AI_PROVIDER=anthropic|openrouter|nvidia) — no code changes.
 */

export type AIProviderName = "anthropic" | "openrouter" | "nvidia";

/** A JSON Schema object describing the shape the model must return. */
export type JSONSchema = Record<string, unknown>;

export interface GenerateJSONParams {
  /** System prompt — the role/instructions for this call. */
  system: string;
  /** User message — the actual content to act on. */
  user: string;
  /** JSON Schema the response must conform to. */
  schema: JSONSchema;
  /** Short identifier for the schema (required by OpenAI-style APIs). */
  schemaName: string;
  /** Output token ceiling. Defaults to a generous 8000. */
  maxTokens?: number;
}

export interface AIProviderClient {
  readonly name: AIProviderName;
  isConfigured(): boolean;
  generateJSON(params: GenerateJSONParams): Promise<Record<string, unknown>>;
}

/** True if a checked-in placeholder key (e.g. "sk-ant-[YOUR_KEY_HERE]") is present instead of a real one. */
export function isPlaceholderKey(key: string | undefined): boolean {
  if (!key) return true;
  return key.includes("[") || key.includes("YOUR_KEY");
}
