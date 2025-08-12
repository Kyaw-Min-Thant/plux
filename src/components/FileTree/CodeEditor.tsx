import { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, Search, ChevronUp, ChevronDown, X } from "lucide-react";
import AceEditor from "react-ace";
import { useEditorStore } from "@/hooks/useEditorStore";
// Import Ace Editor modes
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/mode-typescript";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/mode-html";
import "ace-builds/src-noconflict/mode-css";
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/mode-c_cpp";
import "ace-builds/src-noconflict/mode-rust";
import "ace-builds/src-noconflict/mode-golang";
import "ace-builds/src-noconflict/mode-php";
import "ace-builds/src-noconflict/mode-ruby";
import "ace-builds/src-noconflict/mode-xml";
import "ace-builds/src-noconflict/mode-yaml";
import "ace-builds/src-noconflict/mode-markdown";
import "ace-builds/src-noconflict/mode-text";
import "ace-builds/src-noconflict/mode-sh";
import "ace-builds/src-noconflict/mode-sql";
import "ace-builds/src-noconflict/mode-dockerfile";
import "ace-builds/src-noconflict/mode-ini";
import "ace-builds/src-noconflict/mode-toml";
// Import themes
import "ace-builds/src-noconflict/theme-monokai";
import "ace-builds/src-noconflict/theme-github";
import { aceMapping, editableExtensions } from "./languageMap";

interface CodeEditorProps {
  content: string;
  filePath: string;
  isReadOnly?: boolean;
  onContentChange?: (content: string) => void;
  onSave?: (content: string) => Promise<void>;
  onSelectionChange?: (selectedText: string) => void;
  className?: string;
}

export function CodeEditor({
  content,
  filePath,
  isReadOnly = false,
  onContentChange,
  onSave,
  onSelectionChange,
  className = "",
}: CodeEditorProps) {
  // Local state
  const [editedContent, setEditedContent] = useState(content);
  const [isSaving, setIsSaving] = useState(false);
  const [aceEditor, setAceEditor] = useState<any>(null);
  
  // Zustand store
  const {
    isDarkTheme,
    showLineNumbers,
    fontSize,
    tabSize,
    searchTerm,
    searchResults,
    currentSearchIndex,
    showSearch,
    setSearchTerm,
    setSearchResults,
    setCurrentSearchIndex,
    setShowSearch,
    resetSearch,
    setCursorPosition,
    getCursorPosition,
  } = useEditorStore();

  const getFileExtension = () => {
    const fileName = filePath.split("/").pop() || filePath;
    const lastDot = fileName.lastIndexOf(".");
    return lastDot > -1 ? fileName.substring(lastDot + 1).toLowerCase() : "";
  };

  const getAceMode = useMemo(() => {
    const extension = getFileExtension();
    return aceMapping[extension] || "text";
  }, [filePath]);

  // Determine if we should allow editing based on file extension
  const isEditableFile = useMemo(() => {
    const extension = getFileExtension();
    return editableExtensions.includes(extension);
  }, [getFileExtension]);


  // Update edited content when content prop changes
  useEffect(() => {
    setEditedContent(content);
  }, [content]);

  const handleSave = useCallback(async () => {
    if (!onSave || isReadOnly || !isEditableFile) return;
    
    setIsSaving(true);
    try {
      await onSave(editedContent);
      setIsSaving(false);
    } catch (error) {
      console.error("Failed to save:", error);
      setIsSaving(false);
    }
  }, [onSave, isReadOnly, isEditableFile, editedContent]);

  // Handle cursor position tracking
  useEffect(() => {
    if (!aceEditor) return;

    // Restore cursor position for this file
    const savedPosition = getCursorPosition(filePath);
    if (savedPosition) {
      setTimeout(() => {
        aceEditor.gotoLine(savedPosition.row + 1, savedPosition.column, false);
      }, 100);
    }

    // Add cursor change listener to save position
    const handleCursorChange = () => {
      const cursorPosition = aceEditor.getCursorPosition();
      setCursorPosition(filePath, {
        row: cursorPosition.row,
        column: cursorPosition.column,
      });
    };

    aceEditor.on('changeSelection', handleCursorChange);
    aceEditor.on('changeCursor', handleCursorChange);

    return () => {
      // Save current cursor position when switching files
      if (aceEditor.getCursorPosition) {
        const cursorPosition = aceEditor.getCursorPosition();
        setCursorPosition(filePath, {
          row: cursorPosition.row,
          column: cursorPosition.column,
        });
      }
      
      // Clean up listeners
      aceEditor.off('changeSelection', handleCursorChange);
      aceEditor.off('changeCursor', handleCursorChange);
    };
  }, [aceEditor, filePath, getCursorPosition, setCursorPosition]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S or Cmd+S to save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleSave]);

  const handleContentChange = (newContent: string) => {
    setEditedContent(newContent);
    if (onContentChange) {
      onContentChange(newContent);
    }
  };

  const handleAceLoad = useCallback((editor: any) => {
    setAceEditor(editor);
  }, []);

  const handleAceSelection = (aceEditor: any) => {
    const selectedText = aceEditor.getSelectedText();
    if (onSelectionChange) {
      onSelectionChange(selectedText);
    }
  };

  // Search functionality
  const performSearch = useCallback((term: string, targetContent: string) => {
    if (!term.trim()) {
      setSearchResults([]);
      setCurrentSearchIndex(-1);
      return;
    }

    const lines = targetContent.split('\n');
    const results: number[] = [];
    
    lines.forEach((line, index) => {
      if (line.toLowerCase().includes(term.toLowerCase())) {
        results.push(index);
      }
    });

    setSearchResults(results);
    setCurrentSearchIndex(results.length > 0 ? 0 : -1);
  }, [setSearchResults, setCurrentSearchIndex]);

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    performSearch(term, editedContent);
  }, [editedContent, performSearch, setSearchTerm]);

  const handleSearchNext = () => {
    if (searchResults.length > 0) {
      const newIndex = currentSearchIndex < searchResults.length - 1 ? currentSearchIndex + 1 : 0;
      setCurrentSearchIndex(newIndex);
    }
  };

  const handleSearchPrev = () => {
    if (searchResults.length > 0) {
      const newIndex = currentSearchIndex > 0 ? currentSearchIndex - 1 : searchResults.length - 1;
      setCurrentSearchIndex(newIndex);
    }
  };

  const toggleSearch = () => {
    if (showSearch) {
      resetSearch();
    } else {
      setShowSearch(true);
    }
  };

  // Effect to handle search navigation in Ace Editor
  useEffect(() => {
    if (aceEditor && searchResults.length > 0 && currentSearchIndex >= 0 && showSearch) {
      const targetLine = searchResults[currentSearchIndex];
      aceEditor.gotoLine(targetLine + 1, 0, true);
      aceEditor.scrollToLine(targetLine, true, true, () => {});
      
      // Highlight search term
      if (searchTerm) {
        try {
          const Range = (window as any).ace?.require('ace/range').Range;
          if (Range) {
            if (aceEditor._searchMarker) {
              aceEditor.removeMarker(aceEditor._searchMarker);
            }
            const currentContent = editedContent;
            const lines = currentContent.split('\n');
            const line = lines[targetLine];
            const index = line.toLowerCase().indexOf(searchTerm.toLowerCase());
            if (index >= 0) {
              const range = new Range(targetLine, index, targetLine, index + searchTerm.length);
              aceEditor._searchMarker = aceEditor.addMarker(range, 'ace_selected-word', 'text');
            }
          }
        } catch (e) {
          console.warn('Could not highlight search term:', e);
        }
      }
    }
  }, [aceEditor, searchResults, currentSearchIndex, searchTerm, showSearch]);


  const currentContent = editedContent;

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b border-gray-200 bg-gray-50">
        {!isReadOnly && isEditableFile && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="p-1 h-auto"
            title="Save changes (Ctrl+S)"
          >
            <Save className="w-4 h-4" />
          </Button>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSearch}
          className="p-1 h-auto"
          title="Search in file"
        >
          <Search className="w-4 h-4" />
        </Button>
      </div>

      {/* Search Bar */}
      {showSearch && (
        <div className="flex items-center gap-2 p-2 border-b border-gray-200 bg-gray-50">
          <Search className="w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search in file..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (e.shiftKey) {
                  handleSearchPrev();
                } else {
                  handleSearchNext();
                }
              } else if (e.key === 'Escape') {
                toggleSearch();
              }
            }}
            className="flex-1 h-8"
            autoFocus
          />
          {searchResults.length > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-600">
                {currentSearchIndex + 1} of {searchResults.length}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSearchPrev}
                className="p-1 h-auto"
                title="Previous match"
              >
                <ChevronUp className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSearchNext}
                className="p-1 h-auto"
                title="Next match"
              >
                <ChevronDown className="w-3 h-3" />
              </Button>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSearch}
            className="p-1 h-auto"
            title="Close search"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      )}

      {/* Editor Content */}
      <div className="flex-1 overflow-hidden">
        <AceEditor
          mode={getAceMode}
          theme={isDarkTheme ? "monokai" : "github"}
          value={currentContent}
          readOnly={isReadOnly || !isEditableFile}
          fontSize={fontSize}
          width="100%"
          height="100%"
          showPrintMargin={false}
          showGutter={showLineNumbers}
          highlightActiveLine={!isReadOnly && isEditableFile}
          setOptions={{
            enableBasicAutocompletion: !isReadOnly && isEditableFile,
            enableLiveAutocompletion: false,
            enableSnippets: false,
            showLineNumbers: showLineNumbers,
            tabSize: tabSize,
            wrap: true,
            useWorker: false, // Disable worker to avoid console errors
          }}
          onChange={(value) => {
            if (!isReadOnly && isEditableFile) {
              handleContentChange(value);
            }
          }}
          onSelectionChange={(_, event) => {
            if (event?.editor) {
              handleAceSelection(event.editor);
            }
          }}
          onLoad={handleAceLoad}
        />
      </div>
    </div>
  );
}