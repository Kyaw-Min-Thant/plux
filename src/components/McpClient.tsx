import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Switch } from './ui/switch';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { ChevronDown, ChevronRight, Send, Settings } from 'lucide-react';
import type { McpServerInfo, Tool, ChatMessage, Provider } from '../types/mcp';

export default function McpClient() {
  const [servers, setServers] = useState<McpServerInfo[]>([]);
  const [connectedServers, setConnectedServers] = useState<Set<string>>(new Set());
  const [serverTools, setServerTools] = useState<Record<string, Tool[]>>({});
  const [expandedServers, setExpandedServers] = useState<Set<string>>(new Set());
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<Provider>('claude');
  const [isLoading, setIsLoading] = useState(false);

  const providers: { value: Provider; label: string; model: string }[] = [
    { value: 'claude', label: 'Claude', model: 'claude-3-sonnet' },
    { value: 'gpt-4o', label: 'GPT-4o', model: 'gpt-4o' },
    { value: 'openrouter', label: 'OpenRouter', model: 'anthropic/claude-3-sonnet' },
    { value: 'gemini', label: 'Gemini', model: 'gemini-pro' },
  ];

  useEffect(() => {
    loadServers();
  }, []);

  const loadServers = async () => {
    try {
      const serverList = await invoke<McpServerInfo[]>('get_mcp_servers');
      setServers(serverList);
    } catch (error) {
      console.error('Failed to load MCP servers:', error);
    }
  };

  const toggleServerConnection = async (serverName: string) => {
    const server = servers.find(s => s.name === serverName);
    if (!server) return;

    try {
      if (connectedServers.has(serverName)) {
        await invoke('disconnect_mcp_server', { name: serverName });
        setConnectedServers(prev => {
          const next = new Set(prev);
          next.delete(serverName);
          return next;
        });
        setServerTools(prev => {
          const next = { ...prev };
          delete next[serverName];
          return next;
        });
      } else {
        await invoke('connect_mcp_server', { name: serverName, config: server.config });
        setConnectedServers(prev => new Set(prev).add(serverName));
        loadServerTools(serverName);
      }
    } catch (error) {
      console.error(`Failed to toggle server connection:`, error);
    }
  };

  const loadServerTools = async (serverName: string) => {
    try {
      const tools = await invoke<Tool[]>('list_tools', { serverName });
      setServerTools(prev => ({ ...prev, [serverName]: tools }));
    } catch (error) {
      console.error(`Failed to load tools for ${serverName}:`, error);
    }
  };

  const toggleServerExpanded = (serverName: string) => {
    setExpandedServers(prev => {
      const next = new Set(prev);
      if (next.has(serverName)) {
        next.delete(serverName);
      } else {
        next.add(serverName);
      }
      return next;
    });
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const selectedProviderConfig = providers.find(p => p.value === selectedProvider)!;
      const response = await invoke<string>('send_chat_message', {
        request: {
          message: inputMessage,
          provider: selectedProvider,
          model: selectedProviderConfig.model,
        }
      });

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="border-b bg-white p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">MCP Client</h1>
          <div className="flex items-center space-x-4">
            <select
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value as Provider)}
              className="px-3 py-1 border rounded-md text-sm"
            >
              {providers.map(provider => (
                <option key={provider.value} value={provider.value}>
                  {provider.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - MCP Servers */}
        <div className="w-80 border-r bg-white overflow-y-auto">
          <div className="p-4">
            <h2 className="font-medium mb-3">MCP Servers</h2>
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
                        Command: {server.config.command} {server.config.args.join(' ')}
                      </div>
                      
                      {connectedServers.has(server.name) && serverTools[server.name] && (
                        <div className="mt-2">
                          <div className="text-xs font-medium text-gray-700 mb-1">Tools:</div>
                          <div className="space-y-1">
                            {serverTools[server.name].map((tool) => (
                              <div key={tool.name} className="text-xs p-2 bg-gray-50 rounded">
                                <div className="font-medium">{tool.name}</div>
                                {tool.description && (
                                  <div className="text-gray-600 mt-1">{tool.description}</div>
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

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[70%] px-4 py-2 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white border'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  <div className={`text-xs mt-1 ${
                    message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border px-4 py-2 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-gray-600"></div>
                    <span className="text-sm text-gray-600">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t bg-white p-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !inputMessage.trim()}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
