import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import type { McpServerInfo, Tool } from "../types/mcp";
import type { ChatMessage } from "../types/chat";

interface McpStore {
  servers: McpServerInfo[];
  connectedServers: Set<string>;
  serverTools: Record<string, Tool[]>;
  expandedServers: Set<string>;
  messages: ChatMessage[];
  inputMessage: string;
  isLoading: boolean;
  loadServers: () => Promise<void>;
  toggleServerConnection: (serverName: string) => Promise<void>;
  loadServerTools: (serverName: string) => Promise<void>;
  toggleServerExpanded: (serverName: string) => void;
  sendMessage: (
    provider: string,
    model: string,
    apiKey?: string,
  ) => Promise<void>;
  setInputMessage: (msg: string) => void;
}

export const useMcpStore = create<McpStore>((set, get) => ({
  servers: [],
  connectedServers: new Set(),
  serverTools: {},
  expandedServers: new Set(),
  messages: [],
  inputMessage: "",
  isLoading: false,
  loadServers: async () => {
    try {
      const serverList = await invoke<McpServerInfo[]>("get_mcp_servers");
      set({ servers: serverList });
    } catch (error) {
      console.error("Failed to load MCP servers:", error);
    }
  },
  toggleServerConnection: async (serverName: string) => {
    const { servers, connectedServers, serverTools, loadServerTools } = get();
    const server = servers.find((s) => s.name === serverName);
    if (!server) return;
    try {
      if (connectedServers.has(serverName)) {
        await invoke("disconnect_mcp_server", { name: serverName });
        const next = new Set(connectedServers);
        next.delete(serverName);
        const nextTools = { ...serverTools };
        delete nextTools[serverName];
        set({ connectedServers: next, serverTools: nextTools });
      } else {
        await invoke("connect_mcp_server", {
          name: serverName,
          config: server.config,
        });
        const next = new Set(connectedServers);
        next.add(serverName);
        set({ connectedServers: next });
        await loadServerTools(serverName);
      }
    } catch (error) {
      console.error(`Failed to toggle server connection:`, error);
    }
  },
  loadServerTools: async (serverName: string) => {
    try {
      const tools = await invoke<Tool[]>("list_tools", { serverName });
      set((state) => ({
        serverTools: { ...state.serverTools, [serverName]: tools },
      }));
    } catch (error) {
      console.error(`Failed to load tools for ${serverName}:`, error);
    }
  },
  toggleServerExpanded: (serverName: string) => {
    set((state) => {
      const next = new Set(state.expandedServers);
      if (next.has(serverName)) {
        next.delete(serverName);
      } else {
        next.add(serverName);
      }
      return { expandedServers: next };
    });
  },
  sendMessage: async (provider: string, model: string, apiKey?: string) => {
    console.log("apiKey", apiKey);
    const { inputMessage, messages } = get();
    if (!inputMessage.trim()) return;
    const userMessage: ChatMessage = {
      role: "user",
      content: inputMessage,
      timestamp: Date.now(),
    };
    set({
      messages: [...messages, userMessage],
      inputMessage: "",
      isLoading: true,
    });

    const payload = {
      message: userMessage.content,
      provider,
      model,
      api_key: apiKey,
    };
    console.log("payload", payload);

    try {
      const response = await invoke<string>("send_chat_message", {
        request: payload,
      });
      console.log("response", response);
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: response,
        timestamp: Date.now(),
      };
      set((state) => ({ messages: [...state.messages, assistantMessage] }));
    } catch (error) {
      // Add error message to chat if send fails
      const errorMessage: ChatMessage = {
        role: "assistant",
        content: `Error: Failed to send message.`,
        timestamp: Date.now(),
      };
      set((state) => ({ messages: [...state.messages, errorMessage] }));
      console.error("Failed to send message:", error);
    } finally {
      set({ isLoading: false, inputMessage: "" });
    }
  },
  setInputMessage: (msg: string) => set({ inputMessage: msg }),
}));
