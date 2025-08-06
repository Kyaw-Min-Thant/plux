import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import type { ChatMessage } from "@/types/chat";
import { useChatStore } from "@/hooks/useChatStore";

const getProviderDefaults = (provider: string) => {
  const defaults = {
    openai: { baseUrl: "https://api.openai.com/v1/chat/completions", apiKey: "" },
    google: { baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", apiKey: "" },
    ollama: { baseUrl: "http://localhost:11434/v1/chat/completions", apiKey: "ollama" },
    anthropic: { baseUrl: "https://api.anthropic.com/v1/messages", apiKey: "" },
    openrouter: { baseUrl: "https://openrouter.ai/api/v1/chat/completions", apiKey: "" },
  };
  return defaults[provider as keyof typeof defaults] || { baseUrl: "", apiKey: "" };
};

export const handleSendMessage = async () => {
  console.log("🚀 handleSendMessage called");
  
  try {
    const { inputMessage, messages } = useChatStore.getState();
    console.log("📝 Input message:", inputMessage);
    
    if (!inputMessage.trim()) {
      console.log("❌ Empty message, returning");
      return;
    }

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

    // Get provider config from localStorage
    const storedProvider = localStorage.getItem("selectedProvider") || "openai";
    const storedModel = localStorage.getItem("selectedModel") || "";
    const defaults = getProviderDefaults(storedProvider);
    const storedApiKey = localStorage.getItem(`${storedProvider}_API_KEY`) || defaults.apiKey;
    const storedBaseUrl = localStorage.getItem(`${storedProvider}_BASE_URL`) || defaults.baseUrl;
    
    console.log("⚙️ Provider config:", {
      provider: storedProvider,
      model: storedModel,
      hasApiKey: !!storedApiKey,
      baseUrl: storedBaseUrl
    });

    try {
      // Use streaming version for better UX
      console.log("🔄 Attempting streaming...");
      await handleSendMessageStream(inputMessage);
      console.log("✅ Streaming completed successfully");
    } catch (error) {
    // Fallback to non-streaming if streaming fails
    console.warn("Streaming failed, falling back to regular message:", error);
    try {
      const payload = {
        request: {
          message: inputMessage,
          provider: storedProvider,
          api_key: storedApiKey,
          model: storedModel,
          base_url: storedBaseUrl || null,
        },
      }
      console.log("payload:", payload)
      const response = await invoke<ChatMessage[]>("send_message", payload);
      
      const assistantMessages: ChatMessage[] = response.map((msg) => ({
        ...msg,
        timestamp: Date.now(),
      }));

      useChatStore.setState((state) => ({
        messages: [...state.messages, ...assistantMessages],
      }));
    } catch (fallbackError) {
      // Add error message to chat if send fails
      const errorMessage: ChatMessage = {
        role: "assistant",
        content: `Error: Failed to send message. ${fallbackError}`,
        timestamp: Date.now(),
      };
      useChatStore.setState((state) => ({
        messages: [...state.messages, errorMessage],
      }));
      console.error("Failed to send message:", fallbackError);
    }
    } finally {
      console.log("🏁 handleSendMessage finally block");
      useChatStore.setState({ isLoading: false });
    }
  } catch (outerError) {
    console.error("💥 Fatal error in handleSendMessage:", outerError);
    useChatStore.setState({ isLoading: false });
  }
};

export const handleSendMessageStream = async (messageContent?: string) => {
  const { inputMessage } = useChatStore.getState();
  const actualMessage = messageContent || inputMessage;
  
  console.log("🔄 handleSendMessageStream called");
  console.log("📨 Message content:", actualMessage);
  console.log("📨 Store inputMessage:", inputMessage);
  
  if (!actualMessage.trim()) {
    console.log("❌ Empty message in stream, returning");
    return;
  }

  // Get provider config from localStorage
  const storedProvider = localStorage.getItem("selectedProvider") || "openai";
  const storedModel = localStorage.getItem("selectedModel") || "";
  const defaults = getProviderDefaults(storedProvider);
  const storedApiKey = localStorage.getItem(`${storedProvider}_API_KEY`) || defaults.apiKey;
  const storedBaseUrl = localStorage.getItem(`${storedProvider}_BASE_URL`) || defaults.baseUrl;

  // Create streaming assistant message
  const streamingMessage: ChatMessage = {
    role: "assistant",
    content: "",
    timestamp: Date.now(),
  };

  useChatStore.setState((state) => ({
    messages: [...state.messages, streamingMessage],
  }));

  // Listen for streaming events
  console.log("Setting up chat_stream listener...");
  const unlisten = await listen<{content: string, finished: boolean}>("chat_stream", (event) => {
    console.log("Received chat_stream event:", event.payload);
    const { content, finished } = event.payload;
    
    if (finished) {
      console.log("Stream finished");
      // Stream is complete
      useChatStore.setState({ isLoading: false });
      
      // If content starts with "Error:", it's an error message
      if (content.startsWith("Error:")) {
        console.log("Received error:", content);
        useChatStore.setState((state) => {
          const updatedMessages = [...state.messages];
          const lastMessage = updatedMessages[updatedMessages.length - 1];
          if (lastMessage && lastMessage.role === "assistant") {
            lastMessage.content = content; // Replace with error message
          }
          return { messages: updatedMessages };
        });
      }
    } else {
      console.log("Received streaming content:", content);
      // Update the last message with new content
      useChatStore.setState((state) => {
        const updatedMessages = [...state.messages];
        const lastMessage = updatedMessages[updatedMessages.length - 1];
        if (lastMessage && lastMessage.role === "assistant") {
          lastMessage.content += content;
        }
        return { messages: updatedMessages };
      });
    }
  });

  try {
    const payload = {
      request: {
        message: actualMessage,
        provider: storedProvider,
        api_key: storedApiKey,
        model: storedModel,
        base_url: storedBaseUrl || null,
      },
    }
    console.log("📤 Stream payload:", payload)
    console.log("🚀 Calling send_message_stream...");
    // Start streaming
    await invoke("send_message_stream", payload);
    console.log("✅ send_message_stream call completed");
  } catch (error) {
    console.error("Streaming failed:", error);
    throw error;
  } finally {
    // Clean up event listener
    unlisten();
  }
};