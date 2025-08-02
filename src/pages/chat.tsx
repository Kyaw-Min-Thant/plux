import { useChatStore } from "@/hooks/useChatStore";
import { handleSendMessage } from "@/lib/useChatHandler";
import { MessageList, ChatInput } from "@/components/chat";

export default function ChatPage() {
  const { messages, isLoading } = useChatStore();

  const handleSend = () => {
    handleSendMessage();
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
