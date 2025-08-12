import { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, Save, XCircle, Search, ChevronUp, ChevronDown, X } from "lucide-react";
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
  const [isEditing, setIsEditing] = useState(false);
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

  const handleEdit = () => {
    setIsEditing(true);
    setEditedContent(content);
  };

  const handleSave = async () => {
    if (!onSave || !isEditing) return;
    
    setIsSaving(true);
    try {
      await onSave(editedContent);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedContent(content);
  };

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
    const targetContent = isEditing ? editedContent : content;
    performSearch(term, targetContent);
  }, [content, editedContent, isEditing, performSearch, setSearchTerm]);

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
    if (aceEditor && searchResults.length > 0 && currentSearchIndex >= 0) {
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
            const currentContent = isEditing ? editedContent : content;
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
  }, [aceEditor, searchResults, currentSearchIndex, searchTerm, isEditing, editedContent, content]);


  const currentContent = isEditing ? editedContent : content;

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b border-gray-200 bg-gray-50">
        {isEditing && (
          <span className="text-xs text-orange-600 mr-2">
            Editing
          </span>
        )}
        
        {!isReadOnly && isEditableFile && !isEditing && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEdit}
            className="p-1 h-auto"
            title="Edit file"
          >
            <Edit className="w-4 h-4" />
          </Button>
        )}
        
        {isEditing && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
              className="p-1 h-auto"
              title="Save changes"
            >
              <Save className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancelEdit}
              disabled={isSaving}
              className="p-1 h-auto"
              title="Cancel editing"
            >
              <XCircle className="w-4 h-4" />
            </Button>
          </>
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
          readOnly={!isEditing || isReadOnly}
          fontSize={fontSize}
          width="100%"
          height="100%"
          showPrintMargin={false}
          showGutter={showLineNumbers}
          highlightActiveLine={isEditing}
          setOptions={{
            enableBasicAutocompletion: isEditing,
            enableLiveAutocompletion: false,
            enableSnippets: false,
            showLineNumbers: showLineNumbers,
            tabSize: tabSize,
            wrap: true,
            useWorker: false, // Disable worker to avoid console errors
          }}
          onChange={(value) => {
            if (isEditing) {
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