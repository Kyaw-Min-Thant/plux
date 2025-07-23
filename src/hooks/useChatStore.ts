import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import type { ChatMessage } from "@/types/chat";

interface ChatStore {
  messages: ChatMessage[];
  inputMessage: string;
  isLoading: boolean;
  sendMessage: (
    provider: string,
    model: string,
    apiKey?: string,
  ) => Promise<void>;
  setInputMessage: (msg: string) => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  messages: [],
  inputMessage: "",
  isLoading: false,
  sendMessage: async (provider: string, model: string, apiKey?: string) => {
    console.log("apiKey", apiKey);
    const { inputMessage, messages } = get();
    if (!inputMessage.trim()) return;
    const userMessage: ChatMessage = {
      role: "user",
      content: inputMessage,
      timestamp: Date.now(),
    };
    set({
      messages: [...messages, userMessage],
      inputMessage: "",
      isLoading: true,
    });

    const payload = {
      message: userMessage.content,
      provider,
      model,
      api_key: apiKey,
    };

    try {
      const response = await invoke<string>("send_chat_message", {
        request: payload,
      });
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: response,
        timestamp: Date.now(),
      };
      set((state) => ({ messages: [...state.messages, assistantMessage] }));
    } catch (error) {
      // Add error message to chat if send fails
      const errorMessage: ChatMessage = {
        role: "assistant",
        content: `Error: Failed to send message.`,
        timestamp: Date.now(),
      };
      set((state) => ({ messages: [...state.messages, errorMessage] }));
      console.error("Failed to send message:", error);
    } finally {
      set({ isLoading: false, inputMessage: "" });
    }
  },
  setInputMessage: (msg: string) => set({ inputMessage: msg }),
}));
