import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import type { McpServerInfo, Tool, McpConfig } from "@/types/mcp";

interface McpStore {
  servers: McpServerInfo[];
  connectedServers: Set<string>;
  serverTools: Record<string, Tool[]>;
  expandedServers: Set<string>;
  loadServers: () => Promise<void>;
  toggleServerConnection: (serverName: string) => Promise<void>;
  loadServerTools: (serverName: string) => Promise<void>;
  toggleServerExpanded: (serverName: string) => void;
}

export const useMcpStore = create<McpStore>((set, get) => ({
  servers: [],
  connectedServers: new Set(),
  serverTools: {},
  expandedServers: new Set(),
  loadServers: async () => {
    try {
      const config = await invoke<McpConfig>("load_mcp_config");
      console.log(config);
      const serverList: McpServerInfo[] = Object.entries(config.mcpServers).map(
        ([name, config]) => ({
          name,
          config,
          connected: false,
        }),
      );
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
      const tools = await invoke<Tool[]>("get_available_tools", { serverName });
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
}));
