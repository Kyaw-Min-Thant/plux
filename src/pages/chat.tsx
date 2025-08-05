import { useState, useRef, useCallback, useEffect } from "react";
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
  const [chatPaneWidth, setChatPaneWidth] = useState(400);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSend = () => {
    handleSendMessage();
  };

  const handleFileClick = (filePath: string) => {
    setSelectedFile(filePath);
  };

  const handleCloseFile = () => {
    setSelectedFile(null);
  };

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const newWidth = containerRect.right - e.clientX;
    const minWidth = 300;
    const maxWidth = containerRect.width * 0.8;
    
    setChatPaneWidth(Math.min(Math.max(newWidth, minWidth), maxWidth));
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div className="relative h-full" ref={containerRef}>
      {/* Main content area */}
      <div className="flex h-full">
        {showFileTree && (
          <div className="w-80 border-r border-gray-200 flex-shrink-0">
            <FileTree
              currentFolder={currentFolder || undefined}
              onFileClick={handleFileClick}
            />
          </div>
        )}
        <div className="flex-1">
          {selectedFile ? (
            <FileViewer filePath={selectedFile} onClose={handleCloseFile} />
          ) : (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center space-y-4 max-w-md">
                <h2 className="text-2xl font-semibold text-gray-800">
                  Select a file to view
                </h2>
                <p className="text-gray-600">
                  Choose a file from the file tree to start exploring your project.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chat pane overlay - Cursor IDE style */}
      {showChatPane && (
        <div 
          className="absolute top-0 right-0 h-full bg-white border-l border-gray-200 shadow-lg flex overflow-hidden"
          style={{ width: `${chatPaneWidth}px` }}
        >
          <div 
            className="w-1 bg-gray-200 hover:bg-gray-400 cursor-col-resize flex-shrink-0 transition-colors"
            onMouseDown={handleMouseDown}
          />
          <div className="flex flex-col flex-1 min-h-0">
            {messages.length === 0 && !isLoading ? (
              <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
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
              <div className="flex-1 min-h-0">
                <MessageList messages={messages} isLoading={isLoading} />
              </div>
            )}
            <div className="flex-shrink-0">
              <ChatInput onSend={handleSend} isLoading={isLoading} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
