import { invoke } from "@tauri-apps/api/core";
import type { ChatMessage } from "@/types/chat";
import { useChatStore } from "@/hooks/useChatStore";

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

  const payload = updatedMessages.map(({ role, content }) => ({
    role,
    content,
  }));

  try {
    const response = await invoke<string>("chat_with_agent", {
      messages: payload,
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
