import { useChatStore } from "@/hooks/useChatStore";
import { handleSendMessage } from "@/lib/useChatHandler";
import { MessageList, ChatInput } from "@/components/chat";
import { FileTree } from "@/components/FileTree";
import { useLocation } from "react-router-dom";
import { useFolderStore } from "@/hooks/useFolderStore";

export default function ChatPage() {
  const { messages, isLoading } = useChatStore();
  const location = useLocation();
  const { currentFolder: storedCurrentFolder } = useFolderStore();

  const handleSend = () => {
    handleSendMessage();
  };

  const getCurrentFolder = () => {
    const path = location.pathname;
    switch (path) {
      case "/documents":
        return "~/Documents";
      case "/downloads":
        return "~/Downloads";
      case "/picture":
        return "~/Pictures";
      case "/movies":
        return "~/Movies";
      case "/music":
        return "~/Music";
      case "/":
        return storedCurrentFolder && storedCurrentFolder !== "~/" ? storedCurrentFolder : "~/"; // Use stored folder only if not home, otherwise use home
      case "/history":
        return storedCurrentFolder || undefined; // Use stored folder for /history route
      default:
        return undefined; // Home directory
    }
  };

  return (
    <div className="flex h-full">
      <div className="w-80 border-r border-gray-200 flex-shrink-0">
        <FileTree currentFolder={getCurrentFolder()} />
      </div>
      <div className="flex flex-col flex-1">
        <MessageList messages={messages} isLoading={isLoading} />
        <ChatInput onSend={handleSend} isLoading={isLoading} />
      </div>
    </div>
  );
}
