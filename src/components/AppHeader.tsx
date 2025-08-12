import {
  Download,
  FileText,
  Film,
  PartyPopper,
  Home,
  Image,
  Music,
  Settings,
  Usb,
  Pin,
  PanelLeft,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useFolderStore } from "@/hooks/useFolderStore";
import { useLayoutStore } from "@/hooks/useLayoutStore";

const folderButtons = [
  { folder: "~/", icon: <Home /> },
  { folder: "~/Documents", icon: <FileText /> },
  { folder: "~/Downloads", icon: <Download /> },
  { folder: "~/Pictures", icon: <Image /> },
  { folder: "~/Movies", icon: <Film /> },
  { folder: "~/Music", icon: <Music /> },
];

const routeLinks = [
  { to: "/welcome", icon: <PartyPopper /> },
  { to: "/dxt", icon: <Usb /> },
  { to: "/settings", icon: <Settings /> },
];

export function AppHeader() {
  const { showChatPane, showFileTree, toggleChatPane, toggleFileTree } =
    useLayoutStore();
  const { currentFolder, setCurrentFolder } = useFolderStore();
  const navigate = useNavigate();

  const handleFolderClick = (folder: string) => {
    setCurrentFolder(folder);
    navigate("/"); // Always navigate to root route for file browsing
  };

  return (
    <div data-tauri-drag-region className="flex pl-20 mt-2 justify-between px-2">
      <span className="flex gap-1">
        {/* Welcome button */}
        <Link to="/welcome">
          <PartyPopper className="w-5 h-5" />
        </Link>

        {/* Current folder pin button */}
        {currentFolder && (
          <button
            className="hover:bg-gray-100 rounded flex items-center"
            onClick={() => handleFolderClick(currentFolder)}
          >
            <Pin className="w-4 h-4" />
          </button>
        )}
        
        {/* Folder buttons */}
        {folderButtons.map(({ folder, icon }) => (
          <button
            key={folder}
            onClick={() => handleFolderClick(folder)}
            className="hover:bg-gray-100 rounded"
          >
            {icon}
          </button>
        ))}
        
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleFileTree}
          className={`h-6 w-6 ${showFileTree ? "bg-primary/20" : ""}`}
        >
          <PanelLeft className="w-3 h-3" />
        </Button>
        
      </span>
      
      <span className="flex gap-2">
        {/* Route links for settings and dxt */}
        {routeLinks.slice(1).map(({ to, icon }) => (
          <Link key={to} to={to}>
            {icon}
          </Link>
        ))}
        
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleChatPane}
          className={`h-6 w-6 ${showChatPane ? "bg-primary/20" : ""}`}
        >
          <MessageSquare className="w-3 h-3" />
        </Button>
        
      </span>
    </div>
  );
}
