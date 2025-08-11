import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import type { ChatMessage } from "@/types/chat";
import { useChatStore } from "@/hooks/useChatStore";
import { useConversationStore } from "@/hooks/useConversationStore";
import { useProviderStore } from "@/stores/providerStore";


export const handleSendMessage = async () => {
  console.log("🚀 handleSendMessage called");

  try {
    const { inputMessage } = useChatStore.getState();
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

    // Add user message to conversation
    useChatStore.getState().addMessage(userMessage);

    useChatStore.setState({
      inputMessage: "",
      isLoading: true,
    });

    // Get provider config from store
    const providerStore = useProviderStore.getState();
    const storedProvider = providerStore.selectedProvider;
    const storedModel = providerStore.selectedModel;
    const storedApiKey = providerStore.getCurrentApiKey();
    const storedBaseUrl = providerStore.getCurrentBaseUrl();

    // Get current conversation mode
    const conversationStore = useConversationStore.getState();
    const currentConversation = conversationStore.getCurrentConversation();
    const isAgentMode = currentConversation?.mode === "agent";

    console.log("⚙️ Provider config:", {
      provider: storedProvider,
      model: storedModel,
      hasApiKey: !!storedApiKey,
      baseUrl: storedBaseUrl,
      mode: currentConversation?.mode || "chat",
    });

    try {
      // Use streaming version for better UX
      console.log("🔄 Attempting streaming...");
      await handleSendMessageStream(inputMessage, isAgentMode);
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
        };
        console.log("payload:", payload);

        // Use existing command - backend already supports tools
        const response = await invoke<ChatMessage[]>("send_message", payload);

        const assistantMessages: ChatMessage[] = response.map((msg) => ({
          ...msg,
          timestamp: Date.now(),
        }));

        // Add assistant messages to conversation
        const chatStore = useChatStore.getState();
        assistantMessages.forEach((msg) => chatStore.addMessage(msg));
      } catch (fallbackError) {
        // Add error message to chat if send fails
        const errorMessage: ChatMessage = {
          role: "assistant",
          content: `Error: Failed to send message. ${fallbackError}`,
          timestamp: Date.now(),
        };
        useChatStore.getState().addMessage(errorMessage);
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

export const handleSendMessageStream = async (
  messageContent?: string,
  isAgentMode: boolean = false,
) => {
  const { inputMessage } = useChatStore.getState();
  let actualMessage = messageContent || inputMessage;

  // Modify message based on mode
  if (!isAgentMode) {
    // For chat mode, add prefix to indicate simple conversation preference
    actualMessage = `[Simple conversation mode] ${actualMessage}`;
  } else {
    // For agent mode, add prefix to encourage tool usage
    actualMessage = `[Agent mode - use tools when helpful] ${actualMessage}`;
  }

  console.log("🔄 handleSendMessageStream called");
  console.log("📨 Message content:", actualMessage);
  console.log("📨 Original message:", messageContent || inputMessage);
  console.log("🤖 Agent mode:", isAgentMode);

  if (!actualMessage.trim()) {
    console.log("❌ Empty message in stream, returning");
    return;
  }

  // Get provider config from store
  const providerStore = useProviderStore.getState();
  const storedProvider = providerStore.selectedProvider;
  const storedModel = providerStore.selectedModel;
  const storedApiKey = providerStore.getCurrentApiKey();
  const storedBaseUrl = providerStore.getCurrentBaseUrl();

  // Create streaming assistant message
  const streamingMessage: ChatMessage = {
    role: "assistant",
    content: "",
    timestamp: Date.now(),
  };

  useChatStore.getState().addMessage(streamingMessage);

  // Listen for streaming events
  console.log("Setting up chat_stream listener...");
  const unlisten = await listen<{ content: string; finished: boolean }>(
    "chat_stream",
    (event) => {
      console.log("Received chat_stream event:", event.payload);
      const { content, finished } = event.payload;

      if (finished) {
        console.log("Stream finished");
        // Stream is complete
        useChatStore.setState({ isLoading: false });

        // If content starts with "Error:", it's an error message
        if (content.startsWith("Error:")) {
          console.log("Received error:", content);
          useChatStore.getState().updateLastMessage(content);
        }
      } else {
        console.log("Received streaming content:", content);
        // Update the last message with new content
        const conversationStore = useConversationStore.getState();
        const currentMessages = conversationStore.getCurrentMessages();
        const lastMessage = currentMessages[currentMessages.length - 1];
        if (lastMessage && lastMessage.role === "assistant") {
          useChatStore
            .getState()
            .updateLastMessage(lastMessage.content + content);
        }
      }
    },
  );

  try {
    const payload = {
      request: {
        message: actualMessage,
        provider: storedProvider,
        api_key: storedApiKey,
        model: storedModel,
        base_url: storedBaseUrl || null,
      },
    };
    console.log("📤 Stream payload:", payload);

    console.log(
      `🚀 Calling send_message_stream (mode: ${isAgentMode ? "agent" : "chat"})...`,
    );

    // Start streaming - backend already supports tools automatically
    await invoke("send_message_stream", payload);
    console.log(`✅ send_message_stream call completed`);
  } catch (error) {
    console.error("Streaming failed:", error);
    throw error;
  } finally {
    // Clean up event listener
    unlisten();
  }
};
