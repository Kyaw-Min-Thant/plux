// ChatInput.tsx
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import McpProviderSelector from "./McpProviderSelector";
import { Send } from "lucide-react";
import { useChatStore } from "@/hooks/useChatStore";
import { ServersPopover } from "./ServersPopover";

type ChatInputProps = {
  onSend: () => void;
  isLoading: boolean;
};

export function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const { inputMessage, setInputMessage } = useChatStore();

  return (
    <div className="px-4">
      <div className="relative w-full">
        <Textarea
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
          placeholder="Type your message..."
          className="w-full resize-none pb-2"
          disabled={isLoading}
          rows={3}
        />
        <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center">
          <ServersPopover />
          <div className="flex items-center gap-2">
            <div className="max-w-[200px]">
              <McpProviderSelector />
            </div>
            <Button
              onClick={onSend}
              disabled={isLoading || !inputMessage.trim()}
              size="icon"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}