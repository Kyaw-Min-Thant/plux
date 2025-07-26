import { invoke } from "@tauri-apps/api/core";
import type { ChatMessage } from "@/types/chat";
import { useChatStore } from "@/hooks/useChatStore";

export const handleSendMessage = async (
  provider: string,
  model: string,
  apiKey?: string,
) => {
  const { inputMessage, messages } = useChatStore.getState();
  if (!inputMessage.trim()) return;
  const userMessage: ChatMessage = {
    role: "user",
    content: inputMessage,
    timestamp: Date.now(),
  };
  useChatStore.setState({
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
    const response = await invoke<string>("chat_with_agent", {
      request: payload,
    });
    const assistantMessage: ChatMessage = {
      role: "assistant",
      content: response,
      timestamp: Date.now(),
    };
    useChatStore.setState((state) => ({
      messages: [...state.messages, assistantMessage],
    }));
  } catch (error) {
    // Add error message to chat if send fails
    const errorMessage: ChatMessage = {
      role: "assistant",
      content: `Error: Failed to send message.`,
      timestamp: Date.now(),
    };
    useChatStore.setState((state) => ({
      messages: [...state.messages, errorMessage],
    }));
    console.error("Failed to send message:", error);
  } finally {
    useChatStore.setState({ isLoading: false, inputMessage: "" });
  }
};
