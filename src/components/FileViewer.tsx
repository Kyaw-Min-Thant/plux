import { useState, useEffect, useMemo, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Button } from "@/components/ui/button";
import { X, Copy, Check, Sun, Moon } from "lucide-react";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow, prism } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface FileViewerProps {
  filePath: string | null;
  onClose: () => void;
}

export function FileViewer({ filePath, onClose }: FileViewerProps) {
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [showFullContent, setShowFullContent] = useState(false);

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
        const fileContent = await invoke<string>("read_file", { filePath });
        setContent(fileContent);
      } catch (err) {
        setError(err as string);
      } finally {
        setLoading(false);
      }
    };

    loadFile();
  }, [filePath]);

  const handleCopy = async () => {
    if (content) {
      try {
        await navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy content:", err);
      }
    }
  };

  const getFileName = () => {
    if (!filePath) return "";
    return filePath.split('/').pop() || filePath;
  };

  const getFileExtension = () => {
    if (!filePath) return "";
    const fileName = getFileName();
    const lastDot = fileName.lastIndexOf('.');
    return lastDot > -1 ? fileName.substring(lastDot + 1).toLowerCase() : "";
  };

  const getLanguage = useMemo(() => {
    const extension = getFileExtension();
    const languageMap: Record<string, string> = {
      'js': 'javascript',
      'jsx': 'jsx',
      'ts': 'typescript',
      'tsx': 'tsx',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'cs': 'csharp',
      'php': 'php',
      'rb': 'ruby',
      'go': 'go',
      'rs': 'rust',
      'swift': 'swift',
      'kt': 'kotlin',
      'html': 'html',
      'css': 'css',
      'scss': 'scss',
      'sass': 'sass',
      'less': 'less',
      'json': 'json',
      'xml': 'xml',
      'yaml': 'yaml',
      'yml': 'yaml',
      'md': 'markdown',
      'sh': 'bash',
      'sql': 'sql',
      'dockerfile': 'dockerfile',
      'toml': 'toml',
      'ini': 'ini',
      'conf': 'ini',
      'gitignore': 'gitignore'
    };
    return languageMap[extension] || 'text';
  }, [filePath]);

  const isCodeFile = useMemo(() => {
    return getLanguage !== 'text';
  }, [getLanguage]);

  const MAX_LINES = 500;
  
  const displayContent = useMemo(() => {
    if (!content) return '';
    if (showFullContent) return content;
    
    const lines = content.split('\n');
    if (lines.length <= MAX_LINES) return content;
    
    return lines.slice(0, MAX_LINES).join('\n');
  }, [content, showFullContent]);

  const isLargeFile = useMemo(() => {
    return content.split('\n').length > MAX_LINES;
  }, [content]);

  const handleToggleContent = useCallback(() => {
    setShowFullContent(prev => !prev);
  }, []);

  if (!filePath) return null;

  return (
    <div className="flex flex-col h-full border-l border-gray-200">
      <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-medium truncate" title={filePath}>
            {getFileName()}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {isLargeFile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleContent}
              className="p-1 h-auto text-xs"
              title={`${showFullContent ? 'Show first 500 lines' : 'Show all lines'} (${content.split('\n').length} total)`}
            >
              {showFullContent ? '500' : 'All'}
            </Button>
          )}
          {isCodeFile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDarkTheme(!isDarkTheme)}
              className="p-1 h-auto"
              title={isDarkTheme ? "Switch to light theme" : "Switch to dark theme"}
            >
              {isDarkTheme ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            disabled={!content || loading}
            className="p-1 h-auto"
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
      
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-gray-500">Loading file...</div>
        ) : error ? (
          <div className="p-4 text-center text-red-500">{error}</div>
        ) : isCodeFile ? (
          <div>
            <SyntaxHighlighter
              language={getLanguage}
              style={isDarkTheme ? tomorrow : prism}
              customStyle={{
                margin: 0,
                padding: '1rem',
                background: 'transparent',
                fontSize: '0.875rem',
              }}
              showLineNumbers={true}
              wrapLines={true}
              wrapLongLines={true}
            >
              {displayContent}
            </SyntaxHighlighter>
            {isLargeFile && !showFullContent && (
              <div className="p-4 text-center border-t border-gray-200 bg-gray-50">
                <p className="text-sm text-gray-600 mb-2">
                  Showing first {MAX_LINES} lines of {content.split('\n').length} total lines
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
        ) : (
          <div>
            <pre className="p-4 text-sm font-mono whitespace-pre-wrap break-words">
              {displayContent}
            </pre>
            {isLargeFile && !showFullContent && (
              <div className="p-4 text-center border-t border-gray-200 bg-gray-50">
                <p className="text-sm text-gray-600 mb-2">
                  Showing first {MAX_LINES} lines of {content.split('\n').length} total lines
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