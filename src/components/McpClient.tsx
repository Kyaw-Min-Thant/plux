import McpSidebar from "./McpSidebar";
import McpChat from "./Chat";
import McpProviderSelector from "./McpProviderSelector";
export default function McpClient() {
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="border-b bg-white p-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <McpProviderSelector />
          </div>
        </div>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <McpSidebar />
        <McpChat />
      </div>
    </div>
  );
}
