import { useChatStore } from "@/hooks/useChatStore";
import { useProvider } from "@/hooks/useProvider";
import { handleSendMessage } from "@/lib/useChatHandler";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";

export default function Chat() {
  const { messages, isLoading } = useChatStore();
  const { selectedProvider, providers, apiKey, selectedModel } = useProvider();

  const selectedProviderConfig = providers.find((p) => p.value === selectedProvider);

  const handleSend = () => {
    if (selectedProviderConfig) {
      handleSendMessage(selectedProviderConfig.value, selectedModel, apiKey);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col flex-1">
        <MessageList messages={messages} isLoading={isLoading} />
        <ChatInput onSend={handleSend} isLoading={isLoading} />
      </div>
    </div>
  );
}