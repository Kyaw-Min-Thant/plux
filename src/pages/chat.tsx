import { useChatStore } from "@/hooks/useChatStore";
import { handleSendMessage } from "@/lib/useChatHandler";
import { MessageList, ChatInput } from "@/components/chat";
import { FileTree } from "@/components/FileTree";
import { useFolderStore } from "@/hooks/useFolderStore";

export default function ChatPage() {
  const { messages, isLoading } = useChatStore();
  const { currentFolder } = useFolderStore();

  const handleSend = () => {
    handleSendMessage();
  };

  return (
    <div className="flex h-full">
      <div className="w-80 border-r border-gray-200 flex-shrink-0">
        <FileTree currentFolder={currentFolder || undefined} />
      </div>
      <div className="flex flex-col flex-1">
        <MessageList messages={messages} isLoading={isLoading} />
        <ChatInput onSend={handleSend} isLoading={isLoading} />
      </div>
    </div>
  );
}
