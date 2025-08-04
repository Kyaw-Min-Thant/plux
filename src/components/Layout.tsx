import { Outlet } from "react-router-dom";
import { AppHeader } from "@/components/AppHeader";
import { Toaster } from "sonner";
import { useLayoutStore } from "@/hooks/useLayoutStore";
import { Button } from "@/components/ui/button";
import { PanelLeft, MessageSquare } from "lucide-react";

export function Layout() {
  const { showChatPane, showFileTree, toggleChatPane, toggleFileTree } = useLayoutStore();

  return (
    <div className="h-screen w-full flex flex-col">
      <div className="flex items-center justify-end gap-1 pr-2 pt-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleFileTree}
          className={`h-6 w-6 ${showFileTree ? 'bg-primary/20' : ''}`}
        >
          <PanelLeft className="w-3 h-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleChatPane}
          className={`h-6 w-6 ${showChatPane ? 'bg-primary/20' : ''}`}
        >
          <MessageSquare className="w-3 h-3" />
        </Button>
      </div>
      <AppHeader />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
      <Toaster />
    </div>
  );
}
