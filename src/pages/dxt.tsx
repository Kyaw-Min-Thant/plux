import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";
import { z } from "zod";
import { DxtManifestSchema } from "@/schemas";
import { DxtCard } from "@/components/dxt/dxt-card";
import { DxtSetting } from "@/types";

function DXTPage() {
  const [dxtList, setDxtList] = useState<z.infer<typeof DxtManifestSchema>[]>(
    [],
  );

  async function initMCPClients() {
    const loadedServers = await invoke("load_manifests");
    const parsedServers = z.array(DxtManifestSchema).safeParse(loadedServers);
    if (parsedServers.success) {
      parsedServers.data.map(async(server) => {
        const dxt_setting = await invoke<DxtSetting>("read_dxt_setting", {
          user: server.author.name, 
          repo: server.name
        });
        console.log(server.name, dxt_setting.isEnabled)
        console.log(dxt_setting.userConfig);
      })

      setDxtList(parsedServers.data);
    } else {
      console.error(parsedServers.error);
    }
  }

  useEffect(() => {
    initMCPClients();
  }, []);

  return (
    <div className="grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
      {dxtList.map((dxt, idx) => (
        <DxtCard key={idx} dxt={dxt} />
      ))}
    </div>
  );
}

export default DXTPage;
