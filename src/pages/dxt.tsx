import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";
import { z } from "zod";
import { DxtManifestSchema } from "@/schemas";
import { DxtCard } from "@/components/dxt/dxt-card";
import McpServers from "@/components/McpServers";
import { Grid, Server, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function DXTPage() {
  const [dxtList, setDxtList] = useState<z.infer<typeof DxtManifestSchema>[]>(
    [],
  );
  const [activeView, setActiveView] = useState<"servers" | "dxt">("dxt");
  const [filterText, setFilterText] = useState("");

  async function initMCPClients() {
    const manifests = await invoke("load_manifests");
    const parsedServers = z.array(DxtManifestSchema).safeParse(manifests);
    if (parsedServers.success) {
      setDxtList(parsedServers.data);
    } else {
      console.error(parsedServers.error);
    }
  }

  useEffect(() => {
    initMCPClients();
  }, []);

  const filteredDxtList = dxtList.filter((dxt) => {
    if (!filterText) return true;
    const searchTerm = filterText.toLowerCase();
    return (
      dxt.name.toLowerCase().includes(searchTerm) ||
      dxt.display_name?.toLowerCase().includes(searchTerm) ||
      (dxt.description && dxt.description.toLowerCase().includes(searchTerm))
    );
  });

  return (
    <div className="relative">
      <div className="absolute top-0 right-0 flex gap-2 z-10">
        <Button
          variant={activeView === "servers" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveView("servers")}
        >
          <Server className="h-4 w-4" />
        </Button>
        <Button
          variant={activeView === "dxt" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveView("dxt")}
        >
          <Grid className="h-4 w-4" />
        </Button>
      </div>
      
      {activeView === "servers" ? (
        <div className="flex h-screen overflow-y-auto pt-12">
          <McpServers />
        </div>
      ) : (
        <div className="pt-12">
          <div className="mb-6 relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Filter DXT items..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 h-screen overflow-y-auto">
            {filteredDxtList.map((dxt, idx) => (
              <DxtCard key={idx} dxt={dxt} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default DXTPage;
