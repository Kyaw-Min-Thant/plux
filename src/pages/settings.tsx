import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { useProvider } from "@/hooks/useProvider";
import { useSettingsStore } from "@/hooks/useSettingsStore";
import { useState } from "react";

function SettingsPage() {
  const {
    apiKey,
    setApiKey,
    selectedProvider,
    setSelectedProvider,
    providers,
    models,
    baseUrl,
    setBaseUrl,
    selectedProviderConfig,
  } = useProvider();

  const { excludeFolders, addExcludeFolder, removeExcludeFolder } =
    useSettingsStore();
  const [newExcludeFolder, setNewExcludeFolder] = useState("");

  const handleAddExcludeFolder = () => {
    if (
      newExcludeFolder.trim() &&
      !excludeFolders.includes(newExcludeFolder.trim())
    ) {
      addExcludeFolder(newExcludeFolder.trim());
      setNewExcludeFolder("");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-lg font-semibold mb-4">
        Settings for {selectedProvider}
      </h1>
      <div className="flex gap-8">
        <div className="flex flex-col space-y-2">
          {providers.map((provider) => (
            <button
              key={provider.value}
              onClick={() => setSelectedProvider(provider.value)}
              className={`px-3 py-2 text-sm rounded ${
                selectedProvider === provider.value
                  ? "bg-gray-200 font-medium"
                  : "hover:bg-gray-100"
              }`}
            >
              {provider.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col space-y-1 max-w-sm">
          <label className="text-xs text-gray-500">
            API Key for {selectedProvider}
            {selectedProvider === "ollama" && (
              <span className="text-gray-400"> (Usually not required)</span>
            )}
          </label>
          <Input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={
              selectedProvider === "ollama"
                ? "Leave empty for local Ollama"
                : "Enter API Key"
            }
            autoComplete="off"
          />

          <label className="text-xs text-gray-500 mt-4">
            Base URL (Optional)
          </label>
          <Input
            type="text"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder={
              selectedProviderConfig?.defaultBaseUrl || "Enter custom base URL"
            }
            className="text-sm"
          />
          <div className="text-xs text-gray-400 mt-1">
            {selectedProviderConfig?.defaultBaseUrl ? (
              <>Default: {selectedProviderConfig.defaultBaseUrl}</>
            ) : (
              "Enter custom base URL for this provider"
            )}
          </div>
          {selectedProvider === "ollama" && (
            <div className="text-xs text-blue-600 mt-1">
              💡 Make sure Ollama is running locally with:{" "}
              <code className="bg-gray-100 px-1 rounded">ollama serve</code>
            </div>
          )}

          <label className="text-xs text-gray-500 mt-4">Available Models</label>
          <div className="flex flex-col gap-2 mt-1">
            {models.map((model) => (
              <div
                key={model}
                className="px-2 py-1 text-sm rounded bg-gray-100 border text-gray-800"
              >
                {model}
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col space-y-4 max-w-sm">
          <label className="text-xs text-gray-500">
            Exclude Folders from File Tree
          </label>

          <div className="flex gap-2">
            <Input
              type="text"
              value={newExcludeFolder}
              onChange={(e) => setNewExcludeFolder(e.target.value)}
              placeholder="Add folder to exclude"
              onKeyDown={(e) => e.key === "Enter" && handleAddExcludeFolder()}
              className="text-sm"
            />
            <Button
              size="sm"
              onClick={handleAddExcludeFolder}
              disabled={
                !newExcludeFolder.trim() ||
                excludeFolders.includes(newExcludeFolder.trim())
              }
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {excludeFolders.map((folder) => (
              <Badge
                key={folder}
                variant="secondary"
                className="flex items-center gap-1 cursor-pointer hover:bg-gray-200"
                onClick={() => removeExcludeFolder(folder)}
              >
                {folder}
                <X className="w-3 h-3" />
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
