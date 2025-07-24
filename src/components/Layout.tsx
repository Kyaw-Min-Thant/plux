import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

export function Layout() {
  return (
    <SidebarProvider>
      <div className="h-screen w-full flex flex-col">
    
        {/* Main Content */}
        <div className="flex flex-1">
          <AppSidebar />
          <main className="flex-1 min-w-0 overflow-auto pl-12">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}