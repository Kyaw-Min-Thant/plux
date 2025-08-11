import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PROVIDERS } from '@/lib/data';
import type { Provider } from '@/types/chat';
import { ProviderConfig } from '@/types';

interface ProviderState {
  selectedProvider: Provider;
  apiKeys: Record<Provider, string>;
  baseUrls: Record<Provider, string>;
  selectedModel: string;
  providers: ProviderConfig[];
  
  // Actions
  setSelectedProvider: (provider: Provider) => void;
  setApiKey: (provider: Provider, key: string) => void;
  setBaseUrl: (provider: Provider, url: string) => void;
  setSelectedModel: (model: string) => void;
  
  // Computed getters
  getSelectedProviderConfig: () => ProviderConfig | undefined;
  getCurrentApiKey: () => string;
  getCurrentBaseUrl: () => string;
  getModels: () => string[];
}

export const useProviderStore = create<ProviderState>()(
  persist(
    (set, get) => ({
      selectedProvider: 'openai' as Provider,
      apiKeys: {} as Record<Provider, string>,
      baseUrls: {} as Record<Provider, string>,
      selectedModel: '',
      providers: PROVIDERS,

      setSelectedProvider: (provider: Provider) => {
        set({ selectedProvider: provider });
        
        // Auto-select first available model for new provider
        const providerConfig = PROVIDERS.find(p => p.value === provider);
        const models = providerConfig?.models || [];
        if (models.length > 0) {
          const currentModel = get().selectedModel;
          if (!currentModel || !models.includes(currentModel)) {
            set({ selectedModel: models[0] });
          }
        }
      },

      setApiKey: (provider: Provider, key: string) => {
        set((state) => ({
          apiKeys: {
            ...state.apiKeys,
            [provider]: key
          }
        }));
      },

      setBaseUrl: (provider: Provider, url: string) => {
        set((state) => ({
          baseUrls: {
            ...state.baseUrls,
            [provider]: url
          }
        }));
      },

      setSelectedModel: (model: string) => {
        set({ selectedModel: model });
      },

      getSelectedProviderConfig: () => {
        const { selectedProvider, providers } = get();
        return providers.find(p => p.value === selectedProvider);
      },

      getCurrentApiKey: () => {
        const { selectedProvider, apiKeys } = get();
        const storedApiKey = apiKeys[selectedProvider];
        
        // Return stored API key if available, otherwise use defaults for specific providers
        if (storedApiKey) {
          return storedApiKey;
        }
        
        // Default API keys for providers that don't require real keys
        const defaults: Record<Provider, string> = {
          ollama: 'ollama',
          openai: '',
          anthropic: '',
          openrouter: '',
          google: '',
        };
        
        return defaults[selectedProvider] || '';
      },

      getCurrentBaseUrl: () => {
        const { selectedProvider, baseUrls } = get();
        const providerConfig = get().getSelectedProviderConfig();
        return baseUrls[selectedProvider] || providerConfig?.defaultBaseUrl || '';
      },

      getModels: () => {
        const providerConfig = get().getSelectedProviderConfig();
        return providerConfig?.models || [];
      },
    }),
    {
      name: 'provider-store',
      partialize: (state) => ({
        selectedProvider: state.selectedProvider,
        apiKeys: state.apiKeys,
        baseUrls: state.baseUrls,
        selectedModel: state.selectedModel,
      }),
    }
  )
);