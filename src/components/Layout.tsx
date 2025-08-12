import { Outlet } from "react-router-dom";
import { AppHeader } from "@/components/AppHeader";
import { Toaster } from "sonner";
import { useLayoutStore } from "@/hooks/useLayoutStore";
import { usePlatform } from "@/hooks/usePlatform";
import { Button } from "@/components/ui/button";
import { PanelLeft, MessageSquare } from "lucide-react";

export function Layout() {
  const { showChatPane, showFileTree, toggleChatPane, toggleFileTree } =
    useLayoutStore();
  const platform = usePlatform();

  // Adjust padding based on platform for native title bar buttons
  const getLeftPadding = () => {
    switch (platform) {
      case 'macos':
        return 'pl-20'; // Space for traffic light buttons
      case 'windows':
        return 'pl-20'; // Space for window controls (align with overlay)
      case 'linux':
        return 'pl-20'; // Space for window controls (align with overlay)
      default:
        return 'pl-20'; // Default padding for overlay mode
    }
  };

  return (
    <div className="h-screen w-full flex flex-col">
      <div data-tauri-drag-region className="flex items-center justify-between h-8">
        {/* Left side - platform-aware spacing for native title bar buttons */}
        <div className={`flex items-center gap-1 ${getLeftPadding()}`}>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFileTree}
            className={`h-6 w-6 ${showFileTree ? "bg-primary/20" : ""}`}
          >
            <PanelLeft className="w-3 h-3" />
          </Button>
        </div>
        
        {/* Right side - additional controls */}
        <div className="flex items-center gap-1 pr-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleChatPane}
            className={`h-6 w-6 ${showChatPane ? "bg-primary/20" : ""}`}
          >
            <MessageSquare className="w-3 h-3" />
          </Button>
        </div>
      </div>
      <AppHeader />
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
      <Toaster />
    </div>
  );
}
