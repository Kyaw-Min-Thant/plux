function sanitizeManifest(raw: any) {
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
