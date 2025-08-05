import { create } from "zustand";
import type { ChatMessage } from "@/types/chat";

interface ChatStore {
  messages: ChatMessage[];
  inputMessage: string;
  isLoading: boolean;
  setInputMessage: (msg: string) => void;
  addFileContent: (fileName: string, content: string, selectedText?: string) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  inputMessage: "",
  isLoading: false,
  setInputMessage: (msg: string) => set({ inputMessage: msg }),
  addFileContent: (fileName: string, content: string, selectedText?: string) => {
    const textToAdd = selectedText || content;
    const prefix = selectedText ? `Selected content from ${fileName}:` : `File content from ${fileName}:`;
    const message = `${prefix}\n\n${textToAdd}`;
    set({ inputMessage: message });
  },
}));
