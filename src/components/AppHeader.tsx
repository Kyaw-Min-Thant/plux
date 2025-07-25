import {
  Download,
  FileText,
  Film,
  Home,
  Image,
  Music,
  Settings,
  Usb,
} from "lucide-react";
import { Link } from "react-router-dom";

const leftLinks = [
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
  return (
    <div className="flex mt-2 justify-between px-2">
      <span className="flex gap-2">
        {leftLinks.map(({ to, icon }) => (
          <Link key={to} to={to}>
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
