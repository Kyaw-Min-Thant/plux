export interface ChatMessage {
    role: "user" | "assistant" | "system";
    content: string;
    timestamp: number;
  }
  
  export interface ChatRequest {
    message: string;
    provider: string;
    model: string;
  }
  
  export type Provider = "claude" | "openai" | "openrouter" | "gemini";
  
  export interface AppConfig {
    provider?: string;
    api_key?: string;
    chat_url?: string;
    model_name?: string;
    proxy?: boolean;
    support_tool?: boolean;
  }
  