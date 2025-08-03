import {
  Download,
  FileText,
  Film,
  History,
  Home,
  Image,
  Music,
  Settings,
  Usb,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useFolderStore } from "@/hooks/useFolderStore";

const leftLinks = [
  { to: "/history", icon: <History /> },
  { to: "/", icon: <Home /> },
  { to: "/documents", icon: <FileText /> },
  { to: "/downloads", icon: <Download /> },
  { to: "/picture", icon: <Image /> },
  { to: "/movies", icon: <Film /> },
  { to: "/music", icon: <Music /> },
];

const rightLinks = [
  { to: "/dxt", icon: <Usb /> },
  { to: "/settings", icon: <Settings /> },
];

export function AppHeader() {
  const { setCurrentFolder } = useFolderStore();

  const handleHomeClick = () => {
    setCurrentFolder("~/");
  };

  return (
    <div className="flex mt-2 justify-between px-2">
      <span className="flex gap-2">
        {leftLinks.map(({ to, icon }) => (
          <Link 
            key={to} 
            to={to}
            onClick={to === "/" ? handleHomeClick : undefined}
          >
            {icon}
          </Link>
        ))}
      </span>
      <span className="flex gap-2">
        {rightLinks.map(({ to, icon }) => (
          <Link key={to} to={to}>
            {icon}
          </Link>
        ))}
      </span>
    </div>
  );
}
