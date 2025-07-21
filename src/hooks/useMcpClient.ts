import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Message, Tool } from '../types';

// Custom hook for MCP client state and logic
export const useMcpClient = () => {
  // List of active MCP servers
  const [servers, setServers] = useState<string[]>([]);
  // Currently selected server
  const [selectedServer, setSelectedServer] = useState<string>('');
  // List of available tools for the selected server
  const [tools, setTools] = useState<Tool[]>([]);
  // List of available Ollama models
  const [models, setModels] = useState<string[]>([]);
  // Currently selected Ollama model
  const [selectedModel, setSelectedModel] = useState<string>('');
  // Chat messages
  const [messages, setMessages] = useState<Message[]>([]);
  // Input message from user
  const [inputMessage, setInputMessage] = useState<string>('');
  // Loading state
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Load Ollama models on component mount
  useEffect(() => {
    loadModels();
  }, []);

  // Load available Ollama models
  const loadModels = async () => {
    try {
      const modelsList = await invoke<string[]>('get_ollama_models');
      setModels(modelsList);
      if (modelsList.length > 0) {
        setSelectedModel(modelsList[0]);
      }
    } catch (error) {
      console.error('Failed to load models:', error);
    }
  };

  // Start an MCP server
  const startMcpServer = async (name: string, command: string, args: string[]) => {
    try {
      setIsLoading(true);
      const result = await invoke<string>('start_mcp_server', {
        name,
        command,
        args: args || []
      });
      setServers(prev => [...prev.filter(s => s !== name), name]);
      setSelectedServer(name);
      await loadTools(name);
      addMessage('system', result);
    } catch (error) {
      addMessage('error', `Failed to start MCP server: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Load available tools for a server
  const loadTools = async (serverName: string) => {
    try {
      const toolsList = await invoke<Tool[]>('list_mcp_tools', {
        serverName
      });
      setTools(toolsList);
    } catch (error) {
      console.error('Failed to load tools:', error);
      addMessage('error', `Failed to load tools: ${error}`);
    }
  };

  // Call a tool on the selected server
  const callTool = async (toolName: string, args: Record<string, any>) => {
    try {
      setIsLoading(true);
      const result = await invoke<any>('call_mcp_tool', {
        serverName: selectedServer,
        toolName,
        arguments: args || {}
      });
      addMessage('tool', `Tool ${toolName} result: ${JSON.stringify(result, null, 2)}`);
      return result;
    } catch (error) {
      addMessage('error', `Tool call failed: ${error}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Send a message to Ollama, optionally using a tool
  const sendToOllama = async () => {
    if (!inputMessage.trim() || !selectedModel) return;
    const userMessage = inputMessage.trim();
    setInputMessage('');
    addMessage('user', userMessage);
    try {
      setIsLoading(true);
      // Check if message contains tool calls
      const toolCallRegex = /use tool (\w+)(?:\s+with\s+(.+))?/i;
      const toolMatch = userMessage.match(toolCallRegex);
      if (toolMatch && selectedServer) {
        const toolName = toolMatch[1];
        let toolArgs: Record<string, any> = {};
        if (toolMatch[2]) {
          try {
            toolArgs = JSON.parse(toolMatch[2]);
          } catch {
            toolArgs = { query: toolMatch[2] };
          }
        }
        const toolResult = await callTool(toolName, toolArgs);
        if (toolResult) {
          // Send tool result to Ollama for interpretation
          const contextMessage = `Tool ${toolName} returned: ${JSON.stringify(toolResult)}. Please interpret this result for the user.`;
          const response = await invoke<string>('chat_with_ollama', {
            model: selectedModel,
            messages: [
              { role: 'user', content: userMessage },
              { role: 'system', content: contextMessage }
            ]
          });
          addMessage('assistant', response);
        }
      } else {
        // Regular chat without tools
        const chatMessages = messages
          .filter((m) => m.role === 'user' || m.role === 'assistant')
          .map((m) => ({ role: m.role, content: m.content }));
        chatMessages.push({ role: 'user', content: userMessage });
        const response = await invoke<string>('chat_with_ollama', {
          model: selectedModel,
          messages: chatMessages
        });
        addMessage('assistant', response);
      }
    } catch (error) {
      addMessage('error', `Chat failed: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Add a message to the chat
  const addMessage = (role: Message['role'], content: string) => {
    setMessages(prev => [...prev, {
      role,
      content,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  // Stop an MCP server
  const stopServer = async (serverName: string) => {
    try {
      await invoke('stop_mcp_server', { serverName });
      setServers(prev => prev.filter(s => s !== serverName));
      if (selectedServer === serverName) {
        setSelectedServer('');
        setTools([]);
      }
      addMessage('system', `MCP server '${serverName}' stopped`);
    } catch (error) {
      addMessage('error', `Failed to stop server: ${error}`);
    }
  };

  return {
    servers,
    setServers,
    selectedServer,
    setSelectedServer,
    tools,
    setTools,
    models,
    setModels,
    selectedModel,
    setSelectedModel,
    messages,
    setMessages,
    inputMessage,
    setInputMessage,
    isLoading,
    setIsLoading,
    loadModels,
    startMcpServer,
    loadTools,
    callTool,
    sendToOllama,
    addMessage,
    stopServer,
  };
}; 