import { cn } from "@/lib/utils";
import { FileText, Edit2, Copy, StickyNote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";

export function MessageList({
  messages,
  isLoading,
  addToNotepad,
  onEditMessage,
}: {
  messages: any[];
  isLoading: boolean;
  addToNotepad?: (text: string, source?: string) => void;
  onEditMessage?: (index: number, newContent: string) => void;
}) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editContent, setEditContent] = useState<string>("");
  const [selectedText, setSelectedText] = useState<string>("");
  const [selectionPosition, setSelectionPosition] = useState<{ x: number; y: number } | null>(null);
  const [selectedMessageIndex, setSelectedMessageIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleStartEdit = (index: number, content: string) => {
    setEditingIndex(index);
    setEditContent(content);
  };

  const handleSaveEdit = (index: number) => {
    if (onEditMessage) {
      onEditMessage(index, editContent);
    }
    setEditingIndex(null);
    setEditContent("");
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditContent("");
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleTextSelection = (messageIndex: number) => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      const selectedText = selection.toString().trim();
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      setSelectedText(selectedText);
      setSelectedMessageIndex(messageIndex);
      setSelectionPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 10
      });
    } else {
      setSelectedText("");
      setSelectionPosition(null);
      setSelectedMessageIndex(null);
    }
  };

  const handleAddSelectedToNote = () => {
    if (selectedText && addToNotepad && selectedMessageIndex !== null) {
      const message = messages[selectedMessageIndex];
      const source = message.role === "user" ? "User" : "Assistant";
      addToNotepad(selectedText, source);
      clearSelection();
    }
  };

  const clearSelection = () => {
    setSelectedText("");
    setSelectionPosition(null);
    setSelectedMessageIndex(null);
    window.getSelection()?.removeAllRanges();
  };

  useEffect(() => {
    const handleClickOutside = () => {
      if (!window.getSelection()?.toString()) {
        clearSelection();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="space-y-1 p-2 relative" ref={containerRef}>
      {messages.map((message, index) => (
        <div key={index} className="group">
          <div className={cn(
            "flex gap-2 p-3 rounded-lg hover:bg-gray-50/50 transition-colors",
            message.role === "user" ? "bg-blue-50/30" : "bg-white"
          )}>
            {/* Avatar/Role indicator */}
            <div className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium bg-gray-200">
              {message.role === "user" ? "U" : "A"}
            </div>
            
            {/* Message content */}
            <div className="flex-1 min-w-0">
              {editingIndex === index ? (
                <div className="space-y-2">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full min-h-[60px] p-2 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => handleSaveEdit(index)}
                      className="h-7 px-3"
                    >
                      Save
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={handleCancelEdit}
                      className="h-7 px-3"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div 
                    className="whitespace-pre-wrap text-sm leading-relaxed break-words cursor-text"
                    onMouseUp={() => handleTextSelection(index)}
                    onKeyUp={() => handleTextSelection(index)}
                  >
                    {message.content}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
                      {message.role === "assistant" && message.model && (
                        <span className="px-2 py-0.5 bg-gray-100 rounded text-gray-600">
                          {message.model}
                        </span>
                      )}
                    </div>
                    
                    {/* Action buttons - shown below message content */}
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 w-6 p-0 opacity-50 hover:opacity-100" 
                        onClick={() => copyToClipboard(message.content)}
                        title="Copy"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      {addToNotepad && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 w-6 p-0 opacity-50 hover:opacity-100" 
                          onClick={() => addToNotepad(message.content, message.role === "user" ? "User" : "Assistant")}
                          title="Add to Notes"
                        >
                          <FileText className="h-3 w-3" />
                        </Button>
                      )}
                      {message.role === "user" && onEditMessage && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 w-6 p-0 opacity-50 hover:opacity-100" 
                          onClick={() => handleStartEdit(index, message.content)}
                          title="Edit"
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

          </div>
        </div>
      ))}
      
      {isLoading && (
        <div className="flex gap-2 p-3">
          <div className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium bg-gray-200">
            A
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-500"></div>
              <span>Thinking...</span>
            </div>
          </div>
        </div>
      )}

      {/* Floating Add to Note button */}
      {selectedText && selectionPosition && addToNotepad && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            left: `${selectionPosition.x}px`,
            top: `${selectionPosition.y}px`,
            transform: 'translate(-50%, -100%)'
          }}
        >
          <div className="pointer-events-auto">
            <Button
              size="sm"
              onClick={handleAddSelectedToNote}
              className="bg-blue-500 hover:bg-blue-600 text-white shadow-lg border-0 px-3 py-1.5 h-auto text-xs"
            >
              <StickyNote className="w-3 h-3 mr-1.5" />
              Add to Note
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
