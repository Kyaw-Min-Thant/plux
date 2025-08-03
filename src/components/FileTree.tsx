import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { 
  Folder, 
  FolderOpen, 
  File, 
  Plus, 
  Filter,
  ChevronRight,
  ChevronDown,
  FolderCheck
} from "lucide-react";
import { useChatStore } from "@/hooks/useChatStore";
import { useSettingsStore } from "@/hooks/useSettingsStore";
import { useFolderStore } from "@/hooks/useFolderStore";

interface FileEntry {
  name: string;
  path: string;
  is_directory: boolean;
  size?: number;
  extension?: string;
}

interface FileTreeProps {
  currentFolder?: string;
  onAddToChat?: (path: string) => void;
}


export function FileTree({ currentFolder, onAddToChat }: FileTreeProps) {
  const [entries, setEntries] = useState<FileEntry[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterText, setFilterText] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [tokenCache, setTokenCache] = useState<Map<string, number>>(new Map());
  const { setInputMessage, inputMessage } = useChatStore();
  const { excludeFolders } = useSettingsStore();
  const { currentFolder: storedCurrentFolder, setCurrentFolder } = useFolderStore();

  const loadDirectory = async (path?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      let targetPath = path || currentFolder || storedCurrentFolder;
      if (!targetPath) {
        const defaultDirs = await invoke<string[]>("get_default_directories");
        targetPath = defaultDirs[0]; // Use home directory as default
      }
      
      // Update the store with the current folder if it's different
      if (targetPath && targetPath !== storedCurrentFolder) {
        setCurrentFolder(targetPath);
      }
      
      const result = await invoke<FileEntry[]>("read_directory", { path: targetPath });
      setEntries(result);
    } catch (err) {
      setError(err as string);
    } finally {
      setLoading(false);
    }
  };

  const calculateTokens = async (filePath: string): Promise<number | null> => {
    if (tokenCache.has(filePath)) {
      return tokenCache.get(filePath) || null;
    }
    
    try {
      const tokens = await invoke<number | null>("calculate_file_tokens", { filePath });
      if (tokens !== null) {
        setTokenCache(prev => new Map(prev).set(filePath, tokens));
      }
      return tokens;
    } catch {
      return null;
    }
  };

  const toggleFolder = async (folderPath: string) => {
    const newExpanded = new Set(expandedFolders);
    if (expandedFolders.has(folderPath)) {
      newExpanded.delete(folderPath);
    } else {
      newExpanded.add(folderPath);
    }
    setExpandedFolders(newExpanded);
  };

  const handleAddToChat = (path: string) => {
    const currentInput = inputMessage || "";
    const newInput = currentInput ? `${currentInput}\n${path}` : path;
    setInputMessage(newInput);
    if (onAddToChat) {
      onAddToChat(path);
    }
  };

  const handleSetWorkingFolder = (folderPath: string) => {
    setCurrentFolder(folderPath);
    loadDirectory(folderPath);
  };

  const getCurrentDirectoryName = () => {
    const currentPath = currentFolder || storedCurrentFolder;
    if (!currentPath) return "Home";
    return currentPath.split('/').pop() || currentPath;
  };

  const isFiltered = (entry: FileEntry): boolean => {
    if (filterText && !entry.name.toLowerCase().includes(filterText.toLowerCase())) {
      return true;
    }
    
    if (entry.is_directory && excludeFolders.includes(entry.name)) {
      return true;
    }
    
    return false;
  };

  const getFileIcon = (entry: FileEntry) => {
    if (entry.is_directory) {
      return expandedFolders.has(entry.path) ? 
        <FolderOpen className="w-4 h-4 text-blue-500" /> : 
        <Folder className="w-4 h-4 text-blue-500" />;
    }
    return <File className="w-4 h-4 text-gray-500" />;
  };

  const FileTreeItem = ({ entry, level = 0 }: { entry: FileEntry; level?: number }) => {
    const [tokens, setTokens] = useState<number | null>(null);
    const [loadingTokens, setLoadingTokens] = useState(false);

    const handleMouseEnter = async () => {
      if (!entry.is_directory && tokens === null && !loadingTokens) {
        setLoadingTokens(true);
        const calculatedTokens = await calculateTokens(entry.path);
        setTokens(calculatedTokens);
        setLoadingTokens(false);
      }
    };

    if (isFiltered(entry)) return null;

    return (
      <div 
        className="group"
        style={{ marginLeft: `${level * 16}px` }}
        onMouseEnter={handleMouseEnter}
      >
        <div className="flex items-center gap-1 py-1 px-1 hover:bg-gray-100 rounded">
          {entry.is_directory && (
            <Button
              variant="ghost"
              size="icon"
              className="p-1 w-5 h-5 mr-0.5"
              onClick={() => toggleFolder(entry.path)}
            >
              {expandedFolders.has(entry.path) ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </Button>
          )}
          
          {getFileIcon(entry)}
          
          <span 
            className="flex-1 text-sm cursor-pointer"
            onClick={() => entry.is_directory && toggleFolder(entry.path)}
          >
            {entry.name}
          </span>
          
          {tokens !== null && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Badge variant="secondary" className="text-xs">
                    {tokens}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{tokens} tokens</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          
          {entry.is_directory && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 p-1 h-auto mr-1"
                    onClick={() => handleSetWorkingFolder(entry.path)}
                  >
                    <FolderCheck className="w-3 h-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Set as working folder</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            className="opacity-0 group-hover:opacity-100 p-1 h-auto"
            onClick={() => handleAddToChat(entry.path)}
          >
            <Plus className="w-3 h-3" />
          </Button>
        </div>
        
        {entry.is_directory && expandedFolders.has(entry.path) && (
          <SubFolderContent folderPath={entry.path} level={level + 1} />
        )}
      </div>
    );
  };

  const SubFolderContent = ({ folderPath, level }: { folderPath: string; level: number }) => {
    const [subEntries, setSubEntries] = useState<FileEntry[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
      const loadSubFolder = async () => {
        setLoading(true);
        try {
          const result = await invoke<FileEntry[]>("read_directory", { path: folderPath });
          setSubEntries(result);
        } catch (err) {
          console.error("Failed to load subfolder:", err);
        } finally {
          setLoading(false);
        }
      };

      loadSubFolder();
    }, [folderPath]);

    if (loading) {
      return <div style={{ marginLeft: `${level * 16}px` }} className="text-sm text-gray-500">Loading...</div>;
    }

    return (
      <>
        {subEntries.map((entry) => (
          <FileTreeItem key={entry.path} entry={entry} level={level} />
        ))}
      </>
    );
  };

  useEffect(() => {
    loadDirectory();
  }, [currentFolder, storedCurrentFolder]);

  if (loading && entries.length === 0) {
    return <div className="p-4 text-center text-gray-500">Loading files...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div className="p-2 border-b space-y-2">
        <div className="flex items-center gap-2 mb-2">
          <Folder className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-medium text-gray-700 truncate" title={currentFolder || storedCurrentFolder || "Home"}>
            {getCurrentDirectoryName()}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilter(!showFilter)}
          >
            <Filter className="w-4 h-4" />
          </Button>
          <Input
            placeholder="Filter files..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="text-sm"
          />
        </div>
        
        {showFilter && (
          <div className="text-xs">
            <div className="mb-2 font-medium">Excluded folders:</div>
            <div className="flex flex-wrap gap-1">
              {excludeFolders.map((folder) => (
                <Badge 
                  key={folder} 
                  variant="outline" 
                  className="text-xs"
                >
                  {folder}
                </Badge>
              ))}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Go to Settings to manage excluded folders
            </div>
          </div>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {entries.map((entry) => (
          <FileTreeItem key={entry.path} entry={entry} />
        ))}
      </div>
    </div>
  );
}