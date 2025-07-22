import { useProvider } from "@/hooks/useProvider";

function SettingsPage() {
  const {
    apiKey,
    setApiKey,
    selectedProvider,
    setSelectedProvider,
    providers,
    models,
  } = useProvider();

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
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter API Key"
            className="px-3 py-2 border rounded-md text-sm"
            autoComplete="off"
          />
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
      </div>
    </div>
  );
}

export default SettingsPage;