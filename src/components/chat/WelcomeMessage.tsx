import { useConversationStore } from "@/hooks/useConversationStore";
import { MessageSquare, Bot } from "lucide-react";

export function WelcomeMessage() {
  const getCurrentConversation = useConversationStore(
    (state) => state.getCurrentConversation,
  );
  const currentConversation = getCurrentConversation();
  const mode = currentConversation?.mode || "chat";

  const modeConfig = {
    chat: {
      icon: MessageSquare,
      title: "Normal Chat Mode",
      description: "Start a simple conversation with AI",
      features: ["Fast responses", "Casual conversations", "Basic Q&A"],
    },
    agent: {
      icon: Bot,
      title: "Agent Mode",
      description: "AI assistant can use tools to complete complex tasks",
      features: [
        "Tool usage",
        "Complex reasoning",
        "Multi-step tasks",
        "Code generation",
      ],
    },
  };

  const currentMode = modeConfig[mode];
  const Icon = currentMode.icon;

  return (
    <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
      <div className="text-center space-y-6 max-w-md">
        <div className="flex justify-center">
          <div className="p-4 bg-blue-50 rounded-full">
            <Icon className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-gray-800">
            {currentMode.title}
          </h2>
          <p className="text-gray-600 mt-2">{currentMode.description}</p>
        </div>

        <div className="text-sm text-gray-500">
          <p className="font-medium mb-2">Features:</p>
          <ul className="space-y-1">
            {currentMode.features.map((feature, index) => (
              <li
                key={index}
                className="flex items-center justify-center gap-2"
              >
                <span>•</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="text-sm text-gray-500 border-t pt-4">
          <p className="font-medium mb-2">💡 Usage Tips:</p>
          <ul className="space-y-1 text-left">
            <li>• Browse project via file tree</li>
            <li>• Click + to add files to context</li>
            <li>• Switch chat mode in the top-right corner</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
