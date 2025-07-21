import React from "react";
import { Switch } from "./ui/switch";

// Server configuration for switch UI
const serverConfigs = [
  {
    name: "filesystem",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-filesystem", "/Users/gpt/Documents"],
    label: "Filesystem Server",
  },
  {
    name: "brave-search",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-brave-search"],
    env: {
      BRAVE_API_KEY: "abc"
    },
    label: "Brave Search",
  },
  {
    name: "sqlite",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-sqlite", "--db-path", "/tmp/test.db"],
    label: "SQLite Server",
  },
];

interface ServerManagerProps {
  servers: string[];
  selectedServer: string;
  isLoading: boolean;
  startMcpServer: (name: string, command: string, args: string[], env?: Record<string, any>) => void;
  stopServer: (serverName: string) => void;
  setSelectedServer: (server: string) => void;
}

// ServerManager handles MCP server management UI and logic
const ServerManager: React.FC<ServerManagerProps> = ({
  servers,
  selectedServer,
  isLoading,
  startMcpServer,
  stopServer,
  setSelectedServer,
}) => {
  // Handle switch toggle for each server
  const handleSwitch = (serverConfig: typeof serverConfigs[0], checked: boolean) => {
    if (checked) {
      startMcpServer(serverConfig.name, serverConfig.command, serverConfig.args, serverConfig.env);
    } else {
      stopServer(serverConfig.name);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">MCP Servers</h2>
      <div className="space-y-4">
        {serverConfigs.map((config) => {
          const isRunning = servers.includes(config.name);
          return (
            <div
              key={config.name}
              className="flex items-center justify-between bg-gray-100 rounded px-3 py-2"
            >
              <div className="flex items-center">
                <span className="mr-4 font-medium">{config.label}</span>
                {isRunning && (
                  <button
                    onClick={() => setSelectedServer(config.name)}
                    className={`mr-2 px-2 py-1 text-xs rounded ${
                      selectedServer === config.name
                        ? "bg-blue-500 text-white"
                        : "bg-gray-300 hover:bg-gray-400"
                    }`}
                  >
                    Select
                  </button>
                )}
              </div>
              <label className="flex items-center cursor-pointer">
                <Switch
                  checked={isRunning}
                  disabled={isLoading}
                  onCheckedChange={(checked) => handleSwitch(config, checked)}
                />
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ServerManager;
