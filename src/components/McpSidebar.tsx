import { Collapsible, CollapsibleContent } from "./ui/collapsible";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Switch } from "./ui/switch";
import { useMcpStore } from "../hooks/useMcpStore";
import { useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Button } from "./ui/button";

export default function McpSidebar() {
  const {
    connectedServers,
    serverTools,
    expandedServers,
    toggleServerConnection,
    toggleServerExpanded,
    servers, loadServers
  } = useMcpStore();

  async function listTools() {
    const tools = await invoke("get_available_tools")
    console.log(tools)
  }

  async function initMCPClients() {
    const loadedServers = await invoke("initialize_mcp_clients")
    console.log(loadedServers)
  }

  useEffect(() => {
    loadServers();
  }, [loadServers]);


  return (
    <div className="w-80 border-r bg-white overflow-y-auto">
      <div className="p-4">
        <h2 className="font-medium mb-3">MCP Servers</h2>
        <Button onClick={listTools}>list tools</Button>
        <Button onClick={initMCPClients}>init MCP Clients</Button>
        <div className="space-y-2">
          {servers.map((server) => (
            <div key={server.name} className="border rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleServerExpanded(server.name)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    {expandedServers.has(server.name) ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                  <span className="font-medium text-sm">{server.name}</span>
                </div>
                <Switch
                  checked={connectedServers.has(server.name)}
                  onCheckedChange={() => toggleServerConnection(server.name)}
                />
              </div>

              <Collapsible
                open={expandedServers.has(server.name)}
                onOpenChange={() => toggleServerExpanded(server.name)}
              >
                <CollapsibleContent className="mt-2">
                  <div className="text-xs text-gray-600 mb-2">
                    {server.config.command}{" "}
                    {server.config.args.join(" ")}
                  </div>
                  {connectedServers.has(server.name) &&
                    serverTools[server.name] && (
                      <div className="mt-2">
                        <div className="text-xs font-medium text-gray-700 mb-1">
                          Tools:
                        </div>
                        <div className="space-y-1">
                          {serverTools[server.name].map((tool) => (
                            <div
                              key={tool.name}
                              className="text-xs p-2 bg-gray-50 rounded"
                            >
                              <div className="font-medium">{tool.name}</div>
                              {tool.description && (
                                <div className="text-gray-600 mt-1">
                                  {tool.description}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </CollapsibleContent>
              </Collapsible>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
