import { Outlet } from "react-router-dom";
import { AppHeader } from "@/components/AppHeader";
import { Toaster } from "sonner";

export function Layout() {
  return (
    <div className="h-screen w-full flex flex-col">
      <AppHeader />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
      <Toaster />
    </div>
  );
}
