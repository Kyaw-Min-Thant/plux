// MessageList.tsx
import { cn } from "@/lib/utils";

export function MessageList({ messages, isLoading }: { messages: any[]; isLoading: boolean }) {
  return (
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
  );
}