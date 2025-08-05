import { useState, useCallback, useEffect } from "react";
import type { Provider } from "@/types/chat";

export interface ProviderConfig {
  value: Provider;
  label: string;
  models: string[];
}

const PROVIDERS: ProviderConfig[] = [
  {
    value: "anthropic",
    label: "Anthropic",
    models: [
      "claude-4-sonnet",
      "claude-4-opus",
      "claude-3.7-sonnet",
      "claude-3.7-opus",
      "claude-3.7-haiku",
      "claude-3.5-sonnet",
      "claude-3.5-haiku",
    ],
  },
  {
    value: "openai",
    label: "OpenAI",
    models: ["gpt-4o", "gpt-4-turbo", "gpt-3.5-turbo"],
  },
  {
    value: "openrouter",
    label: "OpenRouter",
    models: [
      "anthropic/claude-4-sonnet",
      "meta-llama/llama-3-70b",
    ],
  },
  {
    value: "google",
    label: "Google",
    models: [
      "gemini-2.5-flash",
      "gemini-2.5-pro",
      "gemini-2.5-flash-lite",
      "gemini-2.0-flash",
      "gemini-2.0-pro",
      "gemini-2.0-flash-lite",
    ],
  },
];

export function useProvider() {
  const [selectedProvider, setSelectedProviderState] = useState<Provider>(
    () => {
      return (localStorage.getItem("selectedProvider") as Provider) || "openai";
    },
  );
  const [providers] = useState<ProviderConfig[]>(PROVIDERS);
  const selectedProviderConfig = providers.find(
    (p) => p.value === selectedProvider,
  );
  const models = selectedProviderConfig ? selectedProviderConfig.models : [];
  const [apiKey, setApiKeyState] = useState<string>(() => {
    const provider =
      (localStorage.getItem("selectedProvider") as Provider) || "openai";
    return localStorage.getItem(`${provider}_API_KEY`) || "";
  });

  // Set provider and save to localStorage
  const setSelectedProvider = useCallback(async (provider: Provider) => {
    setSelectedProviderState(provider);
    localStorage.setItem("selectedProvider", provider);
  }, []);

  // Set API Key and save to localStorage (provider-specific)
  const setApiKey = useCallback(
    async (key: string) => {
      setApiKeyState(key);
      localStorage.setItem(`${selectedProvider}_API_KEY`, key);
    },
    [selectedProvider],
  );

  // Load provider from localStorage
  const loadProviderFromConfig = useCallback(async () => {
    const storedProvider = localStorage.getItem("selectedProvider");
    if (storedProvider) {
      setSelectedProviderState(storedProvider as Provider);
    }
  }, []);

  const [selectedModel, setSelectedModelState] = useState<string>(() => {
    return localStorage.getItem("selectedModel") || "";
  });

  const setSelectedModel = useCallback((model: string) => {
    setSelectedModelState(model);
    localStorage.setItem("selectedModel", model);
  }, []);

  // Load API Key from localStorage (provider-specific)
  const loadApiKey = useCallback(async () => {
    const storedKey = localStorage.getItem(`${selectedProvider}_API_KEY`);
    if (storedKey) {
      setApiKeyState(storedKey);
    } else {
      setApiKeyState("");
    }
  }, [selectedProvider]);

  // When provider changes, update apiKey state
  useEffect(() => {
    loadApiKey();
  }, [selectedProvider, loadApiKey]);

  // When provider changes, check if selected model is still valid
  useEffect(() => {
    if (models.length > 0) {
      if (!selectedModel || !models.includes(selectedModel)) {
        setSelectedModel(models[0]);
      }
    }
  }, [models, selectedModel, setSelectedModel]);

  return {
    providers,
    selectedProvider,
    setSelectedProvider,
    loadProviderFromConfig,
    apiKey,
    setApiKey,
    loadApiKey,
    models,
    selectedModel,
    setSelectedModel,
  };
}
