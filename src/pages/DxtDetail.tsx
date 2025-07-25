import { BackButton } from "@/components/BackButton";
import { UserConfigForm } from "@/components/dxt";
import { Footer } from "@/components/dxt/Footer";
import { ToolPrompt } from "@/components/dxt/tool-prompt";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { DxtManifestSchema } from "@/schemas";
import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { z } from "zod";
import { toast } from "sonner";
import { DxtSetting } from "@/types";

export default function DxtDetail() {
  const { user, repo } = useParams();

  const [manifest, setManifest] = useState<z.infer<
    typeof DxtManifestSchema
  > | null>(null);
  const [userConfig, setUserConfig] = useState<Record<string, any>>({});
  const [enabled, setEnabled] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  async function readDxtSetting() {
    const setting = await invoke<DxtSetting>("read_dxt_setting", { user, repo });
    setIsInstalled(true);
    setEnabled(setting.isEnabled);
    setUserConfig(setting.userConfig);
    console.log(setting);
  }

  useEffect(() => {
    invoke("load_manifest", {
      user: user,
      repo: repo,
    }).then((data) => {
      setManifest(DxtManifestSchema.parse(data));
    });
    try {
      readDxtSetting();
    } catch (e) {
      console.error(e);
      getMergedMcpConfig();
    }
  }, [user, repo]);

  if (!manifest) return <div className="p-4">Not found</div>;

  const userConfigSchema = manifest.user_config ?? {};

  // Helper to merge userConfig into mcp_config
  function getMergedMcpConfig() {
    const baseConfig = structuredClone(
      manifest?.server.mcp_config || {},
    ) as any;
    // If there's an env object, update it with matching userConfig keys
    if (baseConfig.env && typeof baseConfig.env === "object") {
      for (const [k, v] of Object.entries(userConfig)) {
        if (k in baseConfig.env) {
          baseConfig.env[k] = v;
        } else {
          baseConfig[k] = v;
        }
      }
    } else {
      // No env object, just shallow merge
      Object.assign(baseConfig, userConfig);
    }
    return baseConfig;
  }

  async function saveDxtSetting() {
    const content = { isEnabled: enabled, userConfig };
    try {
      await invoke("save_dxt_setting", {
        user,
        repo,
        content,
      });
      toast.success("saved");
    } catch (e) {
      console.error(e);
    }
  }

  async function changeStatus(checked: boolean) {
    setEnabled(checked);
    const content = { isEnabled: checked, userConfig };
    try {
      await invoke("save_dxt_setting", {
        user,
        repo,
        content,
      });
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <BackButton />
      {/* Top section */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">
            {manifest.display_name ?? manifest.name}
          </h1>
          <p className="text-gray-700 mb-1">{manifest.description}</p>
        </div>
        {!isInstalled && (
          <button className="px-4 py-2 bg-blue-600 text-white rounded shadow">
            Install
          </button>
        )}
      </div>

      <div className="flex justify-between">
        <span>
          <Switch onCheckedChange={changeStatus} checked={enabled} />{" "}
          {enabled ? "Enabled" : "Disabled"}
        </span>
        <Button>Uninstall</Button>
      </div>

      {/* User config form */}
      {Object.keys(userConfigSchema).length > 0 && (
        <div className="mb-4 rounded-lg bg-white dark:bg-gray-800 shadow-md p-2 transition-all duration-200 hover:shadow-lg">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            User Configuration
          </h2>
          <UserConfigForm
            schema={userConfigSchema}
            values={userConfig}
            onChange={(k, v) => setUserConfig((prev) => ({ ...prev, [k]: v }))}
          />
        </div>
      )}

      {manifest.user_config && (
        <Button className="mb-2" onClick={saveDxtSetting}>
          save
        </Button>
      )}

      {/* Middle section: tools & prompts */}
      <ToolPrompt manifest={manifest} />

      <Footer manifest={manifest} />
    </div>
  );
}
