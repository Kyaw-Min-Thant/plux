import { useMcpClient } from "../hooks/useMcpClient";
import ServerManager from "./ServerManager";
import ToolPanel from "./ToolPanel";
import ChatPanel from "./ChatPanel";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";

// Main entry for MCP Client page, only layout and props passing
const McpClient = () => {
  const mcp = useMcpClient();

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Main content split into left and right panels */}
        <div className="flex gap-6">
          {/* Left panel: ChatPanel */}
          <div className="flex-1">
            <ChatPanel
              models={mcp.models}
              selectedModel={mcp.selectedModel}
              setSelectedModel={mcp.setSelectedModel}
              messages={mcp.messages}
              inputMessage={mcp.inputMessage}
              setInputMessage={mcp.setInputMessage}
              isLoading={mcp.isLoading}
              sendToOllama={mcp.sendToOllama}
            />
          </div>
          {/* Right panel: Tabs for ServerManager and ToolPanel */}
          <div className="w-80">
            <Tabs defaultValue="server" className="w-full">
              <TabsList>
                <TabsTrigger value="server">Servers</TabsTrigger>
                <TabsTrigger value="tools">Tools</TabsTrigger>
              </TabsList>
              <TabsContent value="server">
                {/* Server Management Tab */}
                <ServerManager
                  servers={mcp.servers}
                  selectedServer={mcp.selectedServer}
                  isLoading={mcp.isLoading}
                  startMcpServer={mcp.startMcpServer}
                  stopServer={mcp.stopServer}
                  setSelectedServer={mcp.setSelectedServer}
                />
              </TabsContent>
              <TabsContent value="tools">
                {/* Tools Panel Tab */}
                <ToolPanel
                  selectedServer={mcp.selectedServer}
                  tools={mcp.tools}
                  isLoading={mcp.isLoading}
                  callTool={mcp.callTool}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default McpClient;
