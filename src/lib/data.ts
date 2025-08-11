import { ProviderConfig } from "@/types/chat";

export const PROVIDERS: ProviderConfig[] = [
    {
      value: "anthropic",
      label: "Anthropic",
      models: [
        "claude-4.1-opus",
        "claude-4-sonnet",
        "claude-4-opus",
        "claude-3.7-sonnet",
        "claude-3.7-opus",
        "claude-3.7-haiku",
        "claude-3.5-sonnet",
        "claude-3.5-haiku",
      ],
      defaultBaseUrl: "https://api.anthropic.com/v1/chat/completions",
    },
    {
      value: "openai",
      label: "OpenAI",
      models: ["gpt-5", "gpt-4o", "gpt-4-turbo", "gpt-3.5-turbo"],
      defaultBaseUrl: "https://api.openai.com/v1/chat/completions",
    },
    {
      value: "openrouter",
      label: "OpenRouter",
      models: [
        "moonshotai/kimi-k2:free",
        "mistralai/mistral-small-3.2-24b-instruct:free",
        "qwen/qwen3-4b:free",
        "deepseek/deepseek-chat-v3-0324:free",
        "anthropic/claude-4-sonnet", "meta-llama/llama-3-70b"],
      defaultBaseUrl: "https://openrouter.ai/api/v1/chat/completions",
    },
    {
      value: "google",
      label: "Google",
      models: [
        "gemini-2.0-flash",
        "gemini-2.0-pro",
        "gemini-2.0-flash-lite",
        "gemini-2.5-flash",
        "gemini-2.5-pro",
        "gemini-2.5-flash-lite",
      ],
      defaultBaseUrl:
        "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
    },
    {
      value: "ollama",
      label: "Ollama",
      models: ["llama3.2", "gpt-oss:20b"],
      defaultBaseUrl: "http://localhost:11434/v1/chat/completions",
    },
  ];
  