import { useProviderStore } from "@/stores/providerStore";

export function useProvider() {
  const {
    providers,
    selectedProvider,
    selectedModel,
    setSelectedProvider,
    setSelectedModel,
    getSelectedProviderConfig,
    getCurrentApiKey,
    getCurrentBaseUrl,
    getModels,
    setApiKey: setStoreApiKey,
    setBaseUrl: setStoreBaseUrl,
  } = useProviderStore();

  const selectedProviderConfig = getSelectedProviderConfig();
  const apiKey = getCurrentApiKey();
  const baseUrl = getCurrentBaseUrl();
  const models = getModels();

  // Wrapper functions to maintain compatibility with existing code
  const setApiKey = async (key: string) => {
    setStoreApiKey(selectedProvider, key);
  };

  const setBaseUrl = (url: string) => {
    setStoreBaseUrl(selectedProvider, url);
  };

  // Legacy functions for backward compatibility (can be removed later)
  const loadProviderFromConfig = async () => {
    // This is now handled by zustand persistence
  };

  const loadApiKey = async () => {
    // This is now handled by zustand persistence
  };

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
    baseUrl,
    setBaseUrl,
    selectedProviderConfig,
  };
}