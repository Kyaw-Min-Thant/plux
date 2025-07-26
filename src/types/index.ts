export * from "./chat";
export * from "./mcp";
export * from "./dxt-setting";
export * from "./dxt-manifest";

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
