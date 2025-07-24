import { MessageCircle, Settings } from "lucide-react";
import { Link } from "react-router-dom";

export function AppSidebar() {
  return (
    <div className="fixed top-0 left-0 w-12 z-20 flex flex-col items-center h-full bg-gray-200 pt-4 space-y-6">
      <Link to="/">
        <MessageCircle />
      </Link>
      <Link to="/settings">
        <Settings />
      </Link>
    </div>
  );
}
