import { Collapsible, CollapsibleContent } from "./ui/collapsible";
import { ChevronRight, Search } from "lucide-react";
import { Switch } from "./ui/switch";
import { Input } from "./ui/input";
import { useMcpStore } from "@/hooks/useMcpStore";
import { useEffect, useState } from "react";
import { McpServerTransportConfig, StdioConfig } from "@/types/mcp";

function isStdioConfig(
  config: McpServerTransportConfig,
): config is StdioConfig {
  return "command" in config;
}

export default function McpServers() {
  const {
    connectedServers,
    serverTools,
    expandedServers,
    toggleServerConnection,
    toggleServerExpanded,
    servers,
    loadServers,
  } = useMcpStore();

  const [filterText, setFilterText] = useState("");

  const filteredServers = servers.filter(server =>
    server.name.toLowerCase().includes(filterText.toLowerCase())
  );

  useEffect(() => {
    loadServers();
  }, [loadServers]);

  return (
    <div className="w-80 border-r bg-gray-50 overflow-y-auto">
      <div className="p-4">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Filter servers..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="space-y-2">
          {filteredServers.map((server) => (
            <div key={server.name} className=" rounded-lg p-1">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">{server.name}</span>
                <div className="flex items-center">
                  <Switch
                    checked={server.connected}
                    onCheckedChange={async (checked) => {
                      await toggleServerConnection(server.fullName, {
                        ...server.content,
                        isEnabled: checked,
                      });
                    }}
                    className="data-[state=checked]:bg-green-500"
                  />
                  <button
                    onClick={() => toggleServerExpanded(server.name)}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <Collapsible
                open={expandedServers.has(server.name)}
                onOpenChange={() => toggleServerExpanded(server.name)}
              >
                <CollapsibleContent className="mt-2 bg-white border rounded p-2 shadow-sm">
                  <div className="text-xs text-gray-600 mb-2">
                    {isStdioConfig(server.config) && (
                      <>
                        {server.config.command} {server.config.args?.join(" ")}
                      </>
                    )}
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
                              className="text-xs p-2 bg-gray-100 rounded border"
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
