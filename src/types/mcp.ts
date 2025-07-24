export type StdioConfig = {
  command: string;
  args?: string[];
  envs?: Record<string, string>;
};

export type SseConfig = {
  url: string;
};

export type McpServerTransportConfig = StdioConfig | SseConfig;

export type McpConfig = {
  mcpServers: Record<string, McpServerTransportConfig>;
};

export interface McpServerInfo {
  name: string;
  config: McpServerTransportConfig;
  connected: boolean;
}

export interface Tool {
  name: string;
  description?: string;
  input_schema?: any;
}
