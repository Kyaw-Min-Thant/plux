import { Button } from "@/components/ui/button";
import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";
import { z } from "zod";
import { DxtManifestSchema } from "@/schemas";
import { DxtCard } from "@/components/dxt/dxt-card";

function DXTPage() {
    const [dxtList, setDxtList] = useState<z.infer<typeof DxtManifestSchema>[]>(
        [],
      );

  async function initMCPClients() {
    const loadedServers = await invoke("load_manifests");
    console.log(loadedServers);
    setDxtList(loadedServers)
  }

  useEffect(() => {
    initMCPClients()
  }, [])

  return (
    <div className="grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
    {dxtList.map((dxt, idx) => (
      <DxtCard key={idx} dxt={dxt} />
    ))}
  </div>
  );
}

export default DXTPage;
