import type { ChatMessage } from "../types/chat";
import { Send } from "lucide-react";
import { useMcpStore } from "@/hooks/useMcpStore";
import { useProvider } from "@/hooks/useProvider";

export default function McpChat() {
  const { messages, inputMessage, setInputMessage, sendMessage, isLoading } =
    useMcpStore();
  const { selectedProvider, providers, apiKey } = useProvider();
  const selectedProviderConfig = providers.find(
    (p) => p.value === selectedProvider,
  );

  const handleSend = () => {
    if (selectedProviderConfig) {
      // Pass apiKey to sendMessage
      sendMessage(
        selectedProviderConfig.value,
        selectedProviderConfig.model,
        apiKey,
      );
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[70%] px-4 py-2 rounded-lg ${
                message.role === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-white border"
              }`}
            >
              <div className="whitespace-pre-wrap">{message.content}</div>
              <div
                className={`text-xs mt-1 ${
                  message.role === "user" ? "text-blue-100" : "text-gray-500"
                }`}
              >
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border px-4 py-2 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-gray-600"></div>
                <span className="text-sm text-gray-600">Thinking...</span>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Input */}
      <div className="border-t bg-white p-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type your message..."
            className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !inputMessage.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
