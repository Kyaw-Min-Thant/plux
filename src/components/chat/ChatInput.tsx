// ChatInput.tsx
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import McpProviderSelector from "./McpProviderSelector";
import { Send, X, Maximize2, Minimize2 } from "lucide-react";
import { useChatStore } from "@/hooks/useChatStore";
import { useContextFilesStore } from "@/hooks/useContextFilesStore";
import { ServersPopover } from "./ServersPopover";

type ChatInputProps = {
  onSend: () => void;
  isLoading: boolean;
};

export function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const { inputMessage, setInputMessage } = useChatStore();
  const { contextFiles, removeFile, clearFiles } = useContextFilesStore();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSendWithContext = () => {
    // Include context files in the message if any exist
    if (contextFiles.length > 0) {
      const contextPaths = contextFiles.map(f => f.path).join('\n');
      const messageWithContext = contextPaths + (inputMessage ? '\n\n' + inputMessage : '');
      setInputMessage(messageWithContext);
      
      // Clear context files after sending
      setTimeout(() => {
        clearFiles();
        setInputMessage(inputMessage); // Reset to original message
      }, 100);
    }
    onSend();
  };

  return (
    <div className="px-4">
      <div className="w-full space-y-2">
        {/* Context Files Badge Area */}
        {contextFiles.length > 0 && (
          <div className="border rounded-lg p-3 bg-gray-50/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-600">Context Files ({contextFiles.length})</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFiles}
                className="h-6 px-2 text-xs text-gray-500 hover:text-red-600"
              >
                Clear All
              </Button>
            </div>
            <div className="flex flex-wrap gap-1">
              {contextFiles.map((file) => (
                <TooltipProvider key={file.path}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="secondary" className="text-xs cursor-pointer">
                        {file.name}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-1 h-3 w-3 p-0 hover:bg-red-100"
                          onClick={() => removeFile(file.path)}
                        >
                          <X className="h-2 w-2" />
                        </Button>
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">{file.path}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </div>
        )}

        {/* Chat Input Area */}
        <div className="relative w-full">
          <Textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendWithContext();
              }
            }}
            placeholder="Type your message..."
            className="w-full resize-none pr-24"
            disabled={isLoading}
            rows={isExpanded ? 8 : 3}
          />
          
          {/* Expand/Collapse Button */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 h-6 w-6 p-0"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
          </Button>
          
          {/* Bottom Controls */}
          <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center">
            <ServersPopover />
            <div className="flex items-center gap-2">
              <div className="max-w-72">
                <McpProviderSelector />
              </div>
              <Button
                onClick={handleSendWithContext}
                disabled={isLoading || (!inputMessage.trim() && contextFiles.length === 0)}
                size="icon"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}