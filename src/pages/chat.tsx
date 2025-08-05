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
            <FileViewer filePath={selectedFile} onClose={handleCloseFile} />
          </div>
        )}
        {showChatPane && (
          <div className="flex flex-col flex-1">
            {messages.length === 0 && !isLoading ? (
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center space-y-4 max-w-md">
                  <h2 className="text-2xl font-semibold text-gray-800">
                    Welcome to Chat
                  </h2>
                  <p className="text-gray-600">
                    Start a conversation with AI. You can add files from the
                    file tree to provide context for your questions.
                  </p>
                  <div className="text-sm text-gray-500">
                    <p>💡 Tips:</p>
                    <ul className="mt-2 space-y-1 text-left">
                      <li>• Use the file tree to browse your project</li>
                      <li>• Click + to add files to context</li>
                      <li>• Ask questions</li>
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <MessageList messages={messages} isLoading={isLoading} />
            )}
            <ChatInput onSend={handleSend} isLoading={isLoading} />
          </div>
        )}
      </div>
    </div>
  );
}
