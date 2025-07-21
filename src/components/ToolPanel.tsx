import React from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import { Tool } from "../types";

interface ToolPanelProps {
  selectedServer: string;
  tools: Tool[];
  isLoading: boolean;
  callTool: (toolName: string, args: Record<string, any>) => void;
}

// ToolPanel displays available tools and call buttons
const ToolPanel: React.FC<ToolPanelProps> = ({
  selectedServer,
  tools,
  isLoading,
  callTool,
}) => {
  if (!selectedServer || tools.length === 0) return null;
  return (
    <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-lg shadow-lg p-2 mb-6">
      <h2 className="text-xl font-semibold mb-4">
        Available Tools ({selectedServer})
      </h2>
      <div className="space-y-2">
        {/* Render each tool as a collapsible item with spacing and divider */}
        {tools.map((tool, idx) => (
          <Collapsible key={tool.name} className="border border-gray-100 rounded-lg shadow-sm bg-white">
            <CollapsibleTrigger className="w-full text-left px-4 py-2 font-medium text-indigo-700 hover:bg-indigo-50 rounded-t-lg transition-colors flex items-center justify-between">
              <span>{tool.name}</span>
              {/* Add an icon or arrow if needed */}
            </CollapsibleTrigger>
            <CollapsibleContent className="px-4 py-3 border-t border-gray-100 bg-gray-50 rounded-b-lg flex flex-col gap-3">
              <div className="text-gray-700 text-sm mb-2">{tool.description}</div>
              <button
                onClick={() => callTool(tool.name, {})}
                className="self-start bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 text-white px-4 py-1.5 text-sm rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow"
                disabled={isLoading}
              >
                Call Tool
              </button>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>
    </div>
  );
};

export default ToolPanel;
