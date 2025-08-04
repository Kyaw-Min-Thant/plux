import { useState } from "react";
import { useChatStore } from "@/hooks/useChatStore";
import { handleSendMessage } from "@/lib/useChatHandler";
import { MessageList, ChatInput } from "@/components/chat";
import { FileTree } from "@/components/FileTree";
import { FileViewer } from "@/components/FileViewer";
import { useFolderStore } from "@/hooks/useFolderStore";
import { useLayoutStore } from "@/hooks/useLayoutStore";

export default function ChatPage() {
  const { messages, isLoading } = useChatStore();
  const { currentFolder } = useFolderStore();
  const { showChatPane, showFileTree } = useLayoutStore();
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const handleSend = () => {
    handleSendMessage();
  };

  const handleFileClick = (filePath: string) => {
    setSelectedFile(filePath);
  };

  const handleCloseFile = () => {
    setSelectedFile(null);
  };

  return (
    <div className="flex h-full">
      {showFileTree && (
        <div className="w-80 border-r border-gray-200 flex-shrink-0">
          <FileTree 
            currentFolder={currentFolder || undefined} 
            onFileClick={handleFileClick}
          />
        </div>
      )}
      <div className="flex flex-1">
        {selectedFile && (
          <div className={showChatPane ? "w-96 flex-shrink-0" : "flex-1"}>
            <FileViewer 
              filePath={selectedFile} 
              onClose={handleCloseFile}
            />
          </div>
        )}
        {showChatPane && (
          <div className="flex flex-col flex-1">
            <MessageList messages={messages} isLoading={isLoading} />
            <ChatInput onSend={handleSend} isLoading={isLoading} />
          </div>
        )}
      </div>
    </div>
  );
}
