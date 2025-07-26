import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";
import { z } from "zod";
import { DxtManifestSchema } from "@/schemas";
import { DxtCard } from "@/components/dxt/dxt-card";
import McpServers from "@/components/McpServers";

function DXTPage() {
  const [dxtList, setDxtList] = useState<z.infer<typeof DxtManifestSchema>[]>(
    [],
  );

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

  return (
    <div>
      <McpServers />
      <div className="grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
        {dxtList.map((dxt, idx) => (
          <DxtCard key={idx} dxt={dxt} />
        ))}
      </div>
    </div>
  );
}

export default DXTPage;
