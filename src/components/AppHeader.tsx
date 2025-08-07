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
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useFolderStore } from "@/hooks/useFolderStore";

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
  const { setCurrentFolder } = useFolderStore();
  const navigate = useNavigate();

  const handleFolderClick = (folder: string) => {
    setCurrentFolder(folder);
    navigate("/"); // Always navigate to root route for file browsing
  };

  return (
    <div className="flex mt-2 justify-between px-2">
      <span className="flex gap-2">
        {/* Welcome button */}
        <Link to="/welcome">
          <PartyPopper />
        </Link>
        
        {/* Folder buttons */}
        {folderButtons.map(({ folder, icon }) => (
          <button
            key={folder}
            onClick={() => handleFolderClick(folder)}
            className="hover:bg-gray-100 p-1 rounded"
          >
            {icon}
          </button>
        ))}
      </span>
      <span className="flex gap-2">
        {/* Route links for settings and dxt */}
        {routeLinks.slice(1).map(({ to, icon }) => (
          <Link key={to} to={to}>
            {icon}
          </Link>
        ))}
      </span>
    </div>
  );
}
