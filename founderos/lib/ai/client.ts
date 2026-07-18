import type { AIProviderClient, AIProviderName, GenerateJSONParams } from "./types";
import { anthropicProvider } from "./providers/anthropic";
import { openrouterProvider } from "./providers/openrouter";
import { nvidiaProvider } from "./providers/nvidia";

const PROVIDERS: Record<AIProviderName, AIProviderClient> = {
  anthropic: anthropicProvider,
  openrouter: openrouterProvider,
  nvidia: nvidiaProvider,
};

function activeProviderName(): AIProviderName {
  const configured = process.env.AI_PROVIDER as AIProviderName | undefined;
  if (configured && configured in PROVIDERS) return configured;
  return "anthropic";
}

/** The provider selected by AI_PROVIDER (defaults to "anthropic"). */
export function getActiveProvider(): AIProviderClient {
  return PROVIDERS[activeProviderName()];
}

/** True if the currently selected provider has a real (non-placeholder) API key. */
export function isAIConfigured(): boolean {
  return getActiveProvider().isConfigured();
}

/**
 * Run a structured JSON generation against whichever provider AI_PROVIDER
 * selects — anthropic, openrouter, or nvidia. Every phase calls this instead
 * of a vendor SDK directly, so switching providers is one env var.
 */
export function generateJSON(params: GenerateJSONParams): Promise<Record<string, unknown>> {
  return getActiveProvider().generateJSON(params);
}
