import { createOpenAICompatibleProvider } from "./openaiCompatible";

export const nvidiaProvider = createOpenAICompatibleProvider({
  name: "nvidia",
  apiKeyEnv: "NVIDIA_API_KEY",
  baseURL: "https://integrate.api.nvidia.com/v1",
  modelEnv: "NVIDIA_MODEL",
  defaultModel: "meta/llama-3.1-405b-instruct",
});
