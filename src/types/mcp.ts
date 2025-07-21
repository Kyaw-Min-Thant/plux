export interface McpServerConfig {
  command: string;
  args: string[];
  env?: Record<string, string>;
}

export interface McpConfig {
  mcpServers: Record<string, McpServerConfig>;
}

export interface McpServerInfo {
  name: string;
  config: McpServerConfig;
  connected: boolean;
}

export interface Tool {
  name: string;
  description?: string;
  input_schema?: any;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface ChatRequest {
  message: string;
  provider: string;
  model: string;
}

export type Provider = 'claude' | 'gpt-4o' | 'openrouter' | 'gemini';
