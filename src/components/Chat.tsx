import McpProviderSelector from "./McpProviderSelector";
import { Send, Settings2 } from "lucide-react";
import { useProvider } from "@/hooks/useProvider";
import { useChatStore } from "@/hooks/useChatStore";
import { handleSendMessage } from "@/lib/useChatHandler";
import { Textarea } from "./ui/textarea";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import McpServers from "./McpServers";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

export default function McpChat() {
  const { messages, inputMessage, setInputMessage, isLoading } = useChatStore();

  const { selectedProvider, providers, apiKey, selectedModel } = useProvider();
  const selectedProviderConfig = providers.find(
    (p) => p.value === selectedProvider,
  );

  const handleSend = () => {
    if (selectedProviderConfig) {
      handleSendMessage(selectedProviderConfig.value, selectedModel, apiKey);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col flex-1">
        <div className="flex-1 overflow-y-auto space-y-4 p-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                "flex items-end gap-2",
                message.role === "user" ? "justify-end" : "justify-start",
              )}
            >
              <div
                className={cn(
                  "max-w-[70%] px-4 py-2 rounded-lg",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted",
                )}
              >
                <div className="whitespace-pre-wrap">{message.content}</div>
                <div
                  className={cn(
                    "text-xs mt-1",
                    message.role === "user"
                      ? "text-primary-foreground/80"
                      : "text-muted-foreground",
                  )}
                >
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted px-4 py-2 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-border border-t-primary"></div>
                  <span className="text-sm text-muted-foreground">
                    Thinking...
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="px-4">
          <div className="relative w-full">
            <Textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Type your message..."
              className="w-full resize-none pb-2"
              disabled={isLoading}
              rows={3}
            />
            <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Settings2 />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-80" side="top" align="start">
                  <McpServers />
                </PopoverContent>
              </Popover>
              <div className="flex items-center gap-2">
                <div className="max-w-[200px]">
                  <McpProviderSelector />
                </div>
                <Button
                  onClick={handleSend}
                  disabled={isLoading || !inputMessage.trim()}
                  size="icon"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
