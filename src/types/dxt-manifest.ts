import { DxtManifestSchema } from "@/schemas";
import { z } from "zod";

export type DxtManifest = z.infer<typeof DxtManifestSchema>;
