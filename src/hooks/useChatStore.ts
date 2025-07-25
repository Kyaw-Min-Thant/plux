import { create } from "zustand";
import type { ChatMessage } from "@/types/chat";

interface ChatStore {
  messages: ChatMessage[];
  inputMessage: string;
  isLoading: boolean;
  setInputMessage: (msg: string) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  inputMessage: "",
  isLoading: false,
  setInputMessage: (msg: string) => set({ inputMessage: msg }),
}));
