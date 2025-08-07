import {
  Bot,
  Check,
  Edit2,
  MessageSquare,
  PenBox,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
import { useConversationStore } from "@/hooks/useConversationStore";
import type { ChatMode } from "@/types/chat";

export function ConversationList() {
  const {
    conversations,
    currentConversationId,
    createConversation,
    deleteConversation,
    setCurrentConversation,
    updateConversationTitle,
  } = useConversationStore();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const handleNewConversation = (mode: ChatMode = "agent") => {
    createConversation(undefined, mode);
  };

  const handleSelectConversation = (id: string) => {
    if (editingId) return; // Prevent switching while editing
    setCurrentConversation(id);
  };

  const handleDeleteConversation = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteConversation(id);
  };

  const handleStartEdit = (
    e: React.MouseEvent,
    id: string,
    currentTitle: string,
  ) => {
    e.stopPropagation();
    setEditingId(id);
    setEditTitle(currentTitle);
  };

  const handleSaveEdit = () => {
    if (editingId && editTitle.trim()) {
      updateConversationTitle(editingId, editTitle.trim());
    }
    setEditingId(null);
    setEditTitle("");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveEdit();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 border-r border-gray-200">
      {/* Header */}
      <div className="p-2 border-b border-gray-200 bg-white flex justify-end">
        <button type="button" onClick={() => handleNewConversation("chat")}>
          <PenBox className="w-4 h-4" />
        </button>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No conversations yet</p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => handleSelectConversation(conversation.id)}
                className={`group relative p-3 rounded-lg cursor-pointer transition-colors ${
                  conversation.id === currentConversationId
                    ? "bg-blue-100 border border-blue-200"
                    : "hover:bg-white hover:shadow-sm"
                }`}
              >
                {editingId === conversation.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={handleKeyPress}
                      className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={handleSaveEdit}
                      className="p-1 text-green-600 hover:bg-green-100 rounded"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="p-1 text-red-600 hover:bg-red-100 rounded"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {conversation.mode === "agent" ? (
                            <Bot className="w-3 h-3 text-blue-600" />
                          ) : (
                            <MessageSquare className="w-3 h-3 text-gray-600" />
                          )}
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {conversation.title}
                          </h3>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={(e) =>
                            handleStartEdit(
                              e,
                              conversation.id,
                              conversation.title,
                            )
                          }
                          className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) =>
                            handleDeleteConversation(e, conversation.id)
                          }
                          className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    {conversation.messages.length > 0 && (
                      <p className="text-xs text-gray-400 mt-2 truncate">
                        {conversation.messages[
                          conversation.messages.length - 1
                        ]?.content?.substring(0, 60)}
                        ...
                      </p>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
