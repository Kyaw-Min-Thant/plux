import { useState, useRef, useCallback, useEffect } from "react";
import { useChatStore, useCurrentMessages } from "@/hooks/useChatStore";
import { handleSendMessage } from "@/lib/useChatHandler";
import {
  ChatInput,
  WelcomeMessage,
  MessageList,
  ConversationList,
} from "@/components/chat";
import { FileTree } from "@/components/FileTree";
import { FileViewer } from "@/components/FileViewer";
import { useFolderStore } from "@/hooks/useFolderStore";
import { useLayoutStore } from "@/hooks/useLayoutStore";
import { History, Plus } from "lucide-react";
import { useConversationStore } from "@/hooks/useConversationStore";

export default function ChatPage() {
  const { createConversation } = useConversationStore();

  const messages = useCurrentMessages();
  const { isLoading } = useChatStore();
  const { currentFolder } = useFolderStore();
  const { showChatPane, showFileTree } = useLayoutStore();
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [chatPaneWidth, setChatPaneWidth] = useState(600); // Wider to accommodate conversation list
  const [conversationListWidth, setConversationListWidth] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggingConvList, setIsDraggingConvList] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const messageListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

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

  const handleConvListMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingConvList(true);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!containerRef.current) return;

      if (isDragging) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const newWidth = containerRect.right - e.clientX;
        const minWidth = 400;
        const maxWidth = containerRect.width * 0.8;

        setChatPaneWidth(Math.min(Math.max(newWidth, minWidth), maxWidth));
      }

      if (isDraggingConvList) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const chatPaneLeft = containerRect.right - chatPaneWidth;
        const newWidth = e.clientX - chatPaneLeft;
        const minWidth = 200;
        const maxWidth = chatPaneWidth * 0.6;

        setConversationListWidth(
          Math.min(Math.max(newWidth, minWidth), maxWidth),
        );
      }
    },
    [isDragging, isDraggingConvList, chatPaneWidth],
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsDraggingConvList(false);
  }, []);

  useEffect(() => {
    if (isDragging || isDraggingConvList) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, isDraggingConvList, handleMouseMove, handleMouseUp]);

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
                  Choose a file from the file tree to start exploring your
                  project.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chat pane overlay - Cursor IDE style with conversation list */}
      {showChatPane && (
        <div
          className="absolute top-0 right-0 h-full bg-white border-l border-gray-200 shadow-lg flex overflow-hidden"
          style={{ width: `${chatPaneWidth}px` }}
        >
          {/* Main chat pane resize handle */}
          <div
            className="w-1 bg-gray-200 hover:bg-gray-400 cursor-col-resize flex-shrink-0 transition-colors"
            onMouseDown={handleMouseDown}
          />

          {/* Conversation list */}
          <div
            className="flex-shrink-0 border-r border-gray-200"
            style={{ width: `${conversationListWidth}px` }}
          >
            <ConversationList />
          </div>

          {/* Conversation list resize handle */}
          <div
            className="w-1 bg-gray-200 hover:bg-gray-400 cursor-col-resize flex-shrink-0 transition-colors"
            onMouseDown={handleConvListMouseDown}
          />

          {/* Chat content area */}
          <div className="flex flex-col flex-1 min-h-0">
            {/* Chat pane header */}
            <div className="flex justify-between w-max-full p-1 border-b border-gray-200">
              <span>New chat</span>
              <span className="flex">
                <button onClick={() => createConversation(undefined, "agent")}>
                  <Plus />
                </button>
                <button
                  onClick={() =>
                    setConversationListWidth((prev) => (prev === 0 ? 280 : 0))
                  }
                >
                  <History />
                </button>
              </span>
            </div>

            {messages.length === 0 && !isLoading ? (
              <WelcomeMessage />
            ) : (
              <div
                ref={messageListRef}
                className="flex-1 min-h-0 overflow-y-auto"
              >
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
