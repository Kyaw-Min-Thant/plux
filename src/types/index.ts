export * from "./chat";
export * from "./mcp";

// Message type for chat messages
export interface Message {
  role: "user" | "assistant" | "system" | "error" | "tool";
  content: string;
  timestamp: string;
}

// Tool type for available tools
export interface Tool {
  name: string;
  description: string;
}
