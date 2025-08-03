import { useFolderStore } from "@/hooks/useFolderStore";
import { Button } from "@/components/ui/button";
import { Folder, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { invoke } from "@tauri-apps/api/core";
import { toast } from "sonner";

export default function HomePage() {
  const { folderHistory, setCurrentFolder, removeFromHistory, clearHistory } = useFolderStore();
  const navigate = useNavigate();

  const uniqueFolders = folderHistory.filter((folder, index, array) => 
    array.findIndex(f => f.path === folder.path) === index
  );

  const handleFolderClick = async (path: string) => {
    try {
      // Check if folder exists by trying to read it
      await invoke("read_directory", { path });
      
      setCurrentFolder(path);
      navigate("/"); // Always navigate to root route for file browsing
    } catch (error) {
      toast.error(`Folder does not exist: ${path}`);
      // Remove the non-existent folder from history
      removeFromHistory(path);
    }
  };

  const formatLastVisited = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffHours < 168) return `${Math.floor(diffHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold">Recent Folders</h1>
        {uniqueFolders.length > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearHistory}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>

      {uniqueFolders.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No recent folders
        </div>
      ) : (
        <div className="space-y-1">
          {uniqueFolders.map((folder) => (
            <div 
              key={folder.path} 
              className="flex items-center justify-between p-2 hover:bg-gray-100 rounded cursor-pointer group"
              onClick={() => handleFolderClick(folder.path)}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Folder className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-sm truncate">{folder.name}</div>
                  <div className="text-xs text-gray-500 truncate">{folder.path}</div>
                </div>
                <div className="text-xs text-gray-400 flex-shrink-0">
                  {formatLastVisited(folder.lastVisited)}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 p-1 h-auto ml-2 text-red-500 hover:text-red-700"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFromHistory(folder.path);
                }}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}