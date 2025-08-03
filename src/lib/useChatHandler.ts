import { invoke } from "@tauri-apps/api/core";
import type { ChatMessage } from "@/types/chat";
import { useChatStore } from "@/hooks/useChatStore";
import { useMcpStore } from "@/hooks/useMcpStore";

export const handleSendMessage = async () => {
  const { inputMessage, messages } = useChatStore.getState();
  if (!inputMessage.trim()) return;

  const userMessage: ChatMessage = {
    role: "user",
    content: inputMessage,
    timestamp: Date.now(),
  };

  const updatedMessages = [...messages, userMessage];

  useChatStore.setState({
    messages: updatedMessages,
    inputMessage: "",
    isLoading: true,
  });

  const { provider, apiKey, model } = useMcpStore.getState();

  try {
    const response = await invoke<ChatMessage[]>("send_message", {
      request: {
        message: inputMessage,
        provider,
        apiKey,
        model,
      },
    });
    
    const assistantMessages: ChatMessage[] = response.map((msg) => ({
      ...msg,
      timestamp: Date.now(),
    }));

    useChatStore.setState((state) => ({
      messages: [...state.messages, ...assistantMessages],
    }));
  } catch (error) {
    // Add error message to chat if send fails
    const errorMessage: ChatMessage = {
      role: "assistant",
      content: `Error: Failed to send message. ${error}`,
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
