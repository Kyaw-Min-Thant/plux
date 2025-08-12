import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Button } from "@/components/ui/button";
import { X, Copy, Check, Sun, Moon, Send, FileText } from "lucide-react";
import { CodeEditor } from "./CodeEditor";
import { useEditorStore } from "@/hooks/useEditorStore";
import { useChatStore } from "@/hooks/useChatStore";

interface FileViewerProps {
  filePath: string | null;
  onClose: () => void;
  addToNotepad?: (text: string, source?: string) => void;
}

export function FileViewer({ filePath, onClose, addToNotepad }: FileViewerProps) {
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showFullContent, setShowFullContent] = useState(false);
  const [selectedText, setSelectedText] = useState<string>("");
  const [currentContent, setCurrentContent] = useState<string>("");
  const { isDarkTheme, setIsDarkTheme } = useEditorStore();
  const { addFileContent } = useChatStore();

  const getFileName = () => {
    if (!filePath) return "";
    return filePath.split("/").pop() || filePath;
  };

  const getFileExtension = () => {
    if (!filePath) return "";
    const fileName = getFileName();
    const lastDot = fileName.lastIndexOf(".");
    return lastDot > -1 ? fileName.substring(lastDot + 1).toLowerCase() : "";
  };

  useEffect(() => {
    if (!filePath) {
      setContent("");
      setError(null);
      return;
    }

    const loadFile = async () => {
      setLoading(true);
      setError(null);

      try {
        const extension = getFileExtension();
        let fileContent: string;

        switch (extension) {
          case "pdf":
            fileContent = await invoke<string>("read_pdf_content", {
              filePath,
            });
            break;
          case "csv":
            fileContent = await invoke<string>("read_csv_content", {
              filePath,
            });
            break;
          case "xlsx":
            fileContent = await invoke<string>("read_xlsx_content", {
              filePath,
            });
            break;
          default:
            fileContent = await invoke<string>("read_file", { filePath });
            break;
        }

        setContent(fileContent);
        setCurrentContent(fileContent);
      } catch (err) {
        setError(err as string);
      } finally {
        setLoading(false);
      }
    };

    loadFile();
  }, [filePath]);

  useEffect(() => {
    setCurrentContent(content);
  }, [content]);

  const handleCopy = async () => {
    const textToCopy = selectedText || currentContent;
    if (textToCopy) {
      try {
        await navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy content:", err);
      }
    }
  };

  const handleSave = async (newContent: string) => {
    if (!filePath) return;
    
    try {
      await invoke("write_file", { 
        filePath, 
        content: newContent 
      });
      setContent(newContent);
      setCurrentContent(newContent);
    } catch (err) {
      console.error("Failed to save file:", err);
      throw new Error(`Failed to save file: ${err}`);
    }
  };

  const handleSendToAI = () => {
    if (currentContent) {
      const fileName = getFileName();
      addFileContent(fileName, currentContent, selectedText || undefined);
    }
  };

  const handleAddToNote = () => {
    if (addToNotepad && currentContent) {
      const fileName = getFileName();
      const textToAdd = selectedText || currentContent;
      addToNotepad(textToAdd, `File: ${fileName}`);
    }
  };

  const handleSelectionChange = (newSelectedText: string) => {
    setSelectedText(newSelectedText);
  };

  const handleContentChange = (newContent: string) => {
    setCurrentContent(newContent);
  };

  const handleToggleContent = () => {
    setShowFullContent(!showFullContent);
  };

  const MAX_LINES = 500;
  const isLargeFile = content.split("\n").length > MAX_LINES;

  const displayContent = showFullContent ? content : (() => {
    const lines = content.split("\n");
    if (lines.length <= MAX_LINES) return content;
    return lines.slice(0, MAX_LINES).join("\n");
  })();

  if (!filePath) return null;

  return (
    <div className="flex flex-col h-full border-l border-gray-200 min-w-0">
      <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-medium truncate" title={filePath}>
            {getFileName()}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {selectedText && (
            <span className="text-xs text-blue-600 mr-2">
              {selectedText.length} chars selected
            </span>
          )}
          {isLargeFile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleContent}
              className="p-1 h-auto text-xs"
              title={`${showFullContent ? "Show first 500 lines" : "Show all lines"} (${content.split("\n").length} total)`}
            >
              {showFullContent ? "500" : "All"}
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsDarkTheme(!isDarkTheme)}
            className="p-1 h-auto"
            title={
              isDarkTheme ? "Switch to light theme" : "Switch to dark theme"
            }
          >
            {isDarkTheme ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSendToAI}
            disabled={!content || loading}
            className="p-1 h-auto"
            title={
              selectedText
                ? "Send selected text to AI"
                : "Send file content to AI"
            }
          >
            <Send className="w-4 h-4" />
          </Button>
          {addToNotepad && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleAddToNote}
              disabled={!content || loading}
              className="p-1 h-auto"
              title={
                selectedText
                  ? "Add selected text to note"
                  : "Add file content to note"
              }
            >
              <FileText className="w-4 h-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            disabled={!content || loading}
            className="p-1 h-auto"
            title={selectedText ? "Copy selected text" : "Copy file content"}
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-1 h-auto"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="p-4 text-center text-gray-500">Loading file...</div>
        ) : error ? (
          <div className="p-4 text-center text-red-500">{error}</div>
        ) : (
          <div className="h-full flex flex-col">
            <CodeEditor
              content={displayContent}
              filePath={filePath}
              onContentChange={handleContentChange}
              onSave={handleSave}
              onSelectionChange={handleSelectionChange}
              className="flex-1"
            />
            {isLargeFile && !showFullContent && (
              <div className="p-4 text-center border-t border-gray-200 bg-gray-50">
                <p className="text-sm text-gray-600 mb-2">
                  Showing first {MAX_LINES} lines of{" "}
                  {content.split("\n").length} total lines
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleToggleContent}
                >
                  Show All Lines
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}