//
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Settings2 } from "lucide-react";
import McpServers from "@/components/McpServers";

export function ServersPopover() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings2 />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-80" side="top" align="start">
        <McpServers />
      </PopoverContent>
    </Popover>
  );
}
