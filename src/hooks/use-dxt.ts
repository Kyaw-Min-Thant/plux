import { DxtManifest } from "@/types";

export function sanitizeManifest(raw: any) {
  return {
    ...raw,
    $schema: raw.$schema ?? "",
    documentation:
      raw.documentation &&
      typeof raw.documentation === "string" &&
      raw.documentation.trim() !== ""
        ? raw.documentation
        : undefined,
    support:
      raw.support &&
      typeof raw.support === "string" &&
      raw.support.trim() !== ""
        ? raw.support
        : undefined,
    icon: raw.icon ?? "",
    prompts_generated: raw.prompts_generated ?? false,
    compatibility: raw.compatibility ?? {},
    // add more fields as needed
  };
}

// Helper to merge userConfig into mcp_config
export function getMergedMcpConfig(
  manifest: DxtManifest,
  userConfig: Record<string, any>,
) {
  const baseConfig = structuredClone(manifest?.server.mcp_config || {}) as any;
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
