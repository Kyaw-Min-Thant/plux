import { DxtManifestSchema } from "@/schemas";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";

// ToolPrompt component displays tools and prompts from the manifest
export function ToolPrompt({
  manifest,
}: {
  manifest: z.infer<typeof DxtManifestSchema>;
}) {
  return (
    <div className="flex flex-col md:flex-row gap-8 mb-8">
      {/* Tools */}
      <div className="flex-1 bg-white rounded-lg shadow p-6 border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">🛠️ Tools</h2>
        </div>
        {manifest.tools && manifest.tools.length > 0 ? (
          <Collapsible>
            <ul className="flex flex-wrap gap-2">
              {manifest.tools.slice(0, 3).map((tool, idx) => (
                <li key={idx} className="text-gray-700">
                  <Badge variant="secondary">{tool.name}</Badge>
                </li>
              ))}
            </ul>
            {manifest.tools.length > 3 && (
              <>
                <CollapsibleContent className="mt-2">
                  <ul className="flex flex-wrap gap-2">
                    {manifest.tools.slice(3).map((tool, idx) => (
                      <li key={idx + 3} className="text-gray-700">
                        <Badge variant="secondary">{tool.name}</Badge>
                      </li>
                    ))}
                  </ul>
                </CollapsibleContent>
                <CollapsibleTrigger className="text-blue-500 underline text-sm mt-2">
                  Show more tools ({manifest.tools.length - 3})
                </CollapsibleTrigger>
              </>
            )}
          </Collapsible>
        ) : (
          <div className="text-gray-400 italic">No tools available</div>
        )}
      </div>

      {/* Prompts */}
      <div className="flex-1 bg-white rounded-lg shadow p-6 border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">💬 Prompts</h2>
        </div>
        {manifest.prompts && manifest.prompts.length > 0 ? (
          <Collapsible>
            <ul className="space-y-4">
              {manifest.prompts.slice(0, 3).map((prompt, idx) => (
                <li key={idx}>
                  <Badge>{prompt.name}</Badge>
                  {prompt.description && (
                    <div className="text-gray-500 text-sm">
                      {prompt.description}
                    </div>
                  )}
                  <div className="text-gray-700 text-sm mt-1 whitespace-pre-line">
                    {prompt.text}
                  </div>
                </li>
              ))}
            </ul>
            {manifest.prompts.length > 3 && (
              <>
                <CollapsibleContent className="mt-4">
                  <ul className="space-y-4">
                    {manifest.prompts.slice(3).map((prompt, idx) => (
                      <li key={idx + 3}>
                        <Badge>{prompt.name}</Badge>
                        {prompt.description && (
                          <div className="text-gray-500 text-sm">
                            {prompt.description}
                          </div>
                        )}
                        <div className="text-gray-700 text-sm mt-1 whitespace-pre-line">
                          {prompt.text}
                        </div>
                      </li>
                    ))}
                  </ul>
                </CollapsibleContent>
                <CollapsibleTrigger className="text-blue-500 underline text-sm mt-2">
                  Show more prompts ({manifest.prompts.length - 3})
                </CollapsibleTrigger>
              </>
            )}
          </Collapsible>
        ) : (
          <div className="text-gray-400 italic">No prompts available</div>
        )}
      </div>
    </div>
  );
}
