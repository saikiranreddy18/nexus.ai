import { createOpenAICompatibleProvider } from "./openaiCompatible";

export const openrouterProvider = createOpenAICompatibleProvider({
  name: "openrouter",
  apiKeyEnv: "OPENROUTER_API_KEY",
  baseURL: "https://openrouter.ai/api/v1",
  modelEnv: "OPENROUTER_MODEL",
  defaultModel: "anthropic/claude-3.5-sonnet",
});
