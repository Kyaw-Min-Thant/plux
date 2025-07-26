import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import { z } from "zod";
import { DxtManifestSchema } from "@/schemas";
import type { McpServerInfo, Tool } from "@/types/mcp";
import { DxtSetting } from "@/types";

interface McpStore {
  servers: McpServerInfo[];
  connectedServers: Set<string>;
  serverTools: Record<string, Tool[]>;
  expandedServers: Set<string>;
  loadServers: () => Promise<void>;
  toggleServerConnection: (
    fullName: string,
    content: DxtSetting,
  ) => Promise<void>;
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
      const manifests = await invoke("load_manifests");
      const parsedServers = z.array(DxtManifestSchema).safeParse(manifests);
      if (parsedServers.success) {
        let mcpConfigs: Record<string, any> = {};
        const serverList: McpServerInfo[] = await Promise.all(
          parsedServers.data.map(async (manifest) => {
            const dxt_setting = await invoke<DxtSetting>("read_dxt_setting", {
              user: manifest.author.name,
              repo: manifest.name,
            });
            console.log(dxt_setting.userConfig);
            mcpConfigs[manifest.name] = manifest.server.mcp_config;

            return {
              fullName: `${manifest.author.name}.${manifest.name}`,
              name: manifest.name,
              config: manifest.server.mcp_config,
              connected: dxt_setting.isEnabled,
              content: dxt_setting,
            };
          }),
        );
        console.log(mcpConfigs);
        set({ servers: serverList });
      } else {
        console.error(parsedServers.error);
      }
    } catch (error) {
      console.error("Failed to load MCP servers:", error);
    }
  },
  toggleServerConnection: async (fullName: string, content: DxtSetting) => {
    const [user, repo] = fullName.split(".");
    try {
      await invoke("save_dxt_setting", {
        user,
        repo,
        content,
      });
      console.log("saved");
    } catch (e) {
      console.error(e);
    }
    set((state) => {
      const updatedServers = state.servers.map((s) =>
        s.fullName === fullName ? { ...s, connected: content.isEnabled } : s,
      );
      return { servers: updatedServers };
    });
  },
  loadServerTools: async (serverName: string) => {},
  toggleServerExpanded: (serverName: string) => {},
}));
