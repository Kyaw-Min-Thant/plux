import React from "react";
import { Message } from "../types";

interface ChatPanelProps {
  models: string[];
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  messages: Message[];
  inputMessage: string;
  setInputMessage: (msg: string) => void;
  isLoading: boolean;
  sendToOllama: () => void;
}

// ChatPanel displays chat messages and input box
const ChatPanel: React.FC<ChatPanelProps> = ({
  models,
  selectedModel,
  setSelectedModel,
  messages,
  inputMessage,
  setInputMessage,
  isLoading,
  sendToOllama,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className="border rounded px-3 py-1"
        >
          <option value="">Select Model</option>
          {models.map((model) => (
            <option key={model} value={model}>
              {model}
            </option>
          ))}
        </select>
      </div>
      <div className="h-96 overflow-y-auto border rounded p-4 mb-4 bg-gray-50">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`mb-3 ${message.role === "user" ? "text-right" : ""}`}
          >
            <div
              className={`inline-block max-w-3xl p-3 rounded-lg ${
                message.role === "user"
                  ? "bg-blue-500 text-white"
                  : message.role === "assistant"
                    ? "bg-white border"
                    : message.role === "error"
                      ? "bg-red-100 text-red-800"
                      : message.role === "tool"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
              }`}
            >
              <div className="text-xs opacity-70 mb-1">
                {message.role} - {message.timestamp}
              </div>
              <pre className="whitespace-pre-wrap text-sm">
                {message.content}
              </pre>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="text-center text-gray-500">
            <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div>
            <span className="ml-2">Processing...</span>
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && sendToOllama()}
          placeholder="Type your message... (Use 'use tool toolname with {args}' to call MCP tools)"
          className="flex-1 border rounded px-3 py-2"
          disabled={isLoading || !selectedModel}
        />
        <button
          onClick={sendToOllama}
          disabled={isLoading || !selectedModel || !inputMessage.trim()}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-6 py-2 rounded"
        >
          Send
        </button>
      </div>
      <div className="mt-2 text-xs text-gray-500">
        <p>Examples:</p>
        <p>
          • <code>use tool read_file with {`{"path": "/tmp/test.txt"}`}</code> -
          Read a file
        </p>
        <p>
          • <code>use tool web_search with {`{"query": "latest news"}`}</code> -
          Search the web
        </p>
        <p>• "use tool list_tables" - List database tables</p>
      </div>
    </div>
  );
};

export default ChatPanel;
