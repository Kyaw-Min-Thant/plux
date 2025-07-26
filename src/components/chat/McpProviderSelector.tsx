import { useState } from "react";
import { useProvider } from "@/hooks/useProvider";
import { Provider } from "@/types";
import {
  Command,
  CommandInput,
  CommandList,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

export default function McpProviderSelector() {
  const {
    providers,
    selectedProvider,
    selectedModel,
    setSelectedProvider,
    setSelectedModel,
  } = useProvider();
  const [open, setOpen] = useState(false);

  // Find the selected provider object
  const selectedProviderObj = providers.find(
    (p) => p.value === selectedProvider,
  );

  // Handle provider selection
  const handleProviderSelect = (providerValue: string) => {
    setSelectedProvider(providerValue as Provider);
    const newProvider = providers.find((p) => p.value === providerValue);
    if (newProvider?.models.length) {
      setSelectedModel(newProvider.models[0]);
    }
  };

  // Handle model selection
  const handleModelSelect = (model: string) => {
    setSelectedModel(model);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between"
          onClick={() => setOpen(!open)}
        >
          <span>
            {selectedProviderObj
              ? selectedProviderObj.label
              : "Choose provider"}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-80">
        <Command>
          <CommandInput placeholder="Search provider or model..." />
          <CommandList>
            <CommandGroup heading="Providers">
              {providers.map((provider) => (
                <CommandItem
                  key={provider.value}
                  value={provider.value}
                  onSelect={() => handleProviderSelect(provider.value)}
                  // Highlight selected provider
                  className={
                    provider.value === selectedProvider
                      ? "bg-accent text-accent-foreground"
                      : ""
                  }
                >
                  {provider.label}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            {selectedProviderObj && (
              <CommandGroup heading="Models">
                {selectedProviderObj.models.map((model) => (
                  <CommandItem
                    key={model}
                    value={model}
                    onSelect={() => handleModelSelect(model)}
                    // Highlight selected model
                    className={
                      model === selectedModel
                        ? "bg-accent text-accent-foreground"
                        : ""
                    }
                  >
                    {model}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
