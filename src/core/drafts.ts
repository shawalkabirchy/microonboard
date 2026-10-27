import { z } from "zod";
import {
  parseConfig,
  tourSchema,
  TourError,
  type TourConfig,
} from "./config.ts";

export const draftSchema = z.strictObject({
  id: z.string().uuid(),
  config: tourSchema,
  lastExportedVersion: z.number().int().nonnegative().safe(),
  lastExportedConfig: z.optional(tourSchema),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type TourDraft = z.infer<typeof draftSchema>;
export type Workspace = { revision: number; drafts: TourDraft[] };

export function newDraft(config: TourConfig): TourDraft {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    config,
    lastExportedVersion: 0,
    createdAt: now,
    updatedAt: now,
  };
}

export function validateDrafts(input: unknown): TourDraft[] {
  const result = z.array(draftSchema).max(50).safeParse(input);
  if (!result.success)
    throw new TourError(
      "IMPORT_INVALID",
      result.error.issues[0].message,
      result.error.issues[0].path.join("."),
    );
  const ids = new Set<string>();
  const tourIds = new Set<string>();
  for (const draft of result.data) {
    if (ids.has(draft.id) || tourIds.has(draft.config.tourId))
      throw new TourError(
        "IMPORT_INVALID",
        "Duplicate draft or tour IDs are not allowed.",
      );
    ids.add(draft.id);
    tourIds.add(draft.config.tourId);
    parseConfig(
      draft.config,
      typeof document === "undefined" ? undefined : document,
    );
    const snapshot = draft.lastExportedConfig;
    if (
      (draft.lastExportedVersion === 0) !== (snapshot === undefined) ||
      (snapshot &&
        (snapshot.version !== draft.lastExportedVersion ||
          snapshot.tourId !== draft.config.tourId))
    ) {
      throw new TourError(
        "IMPORT_INVALID",
        "The exported version and saved snapshot do not match.",
      );
    }
    if (snapshot)
      parseConfig(
        snapshot,
        typeof document === "undefined" ? undefined : document,
      );
  }
  return result.data;
}

export function freezeExport(draft: TourDraft): TourDraft {
  const config = parseConfig(
    draft.config,
    typeof document === "undefined" ? undefined : document,
  );
  if (
    draft.lastExportedVersion &&
    config.version <= draft.lastExportedVersion &&
    JSON.stringify(config) !== JSON.stringify(draft.lastExportedConfig)
  ) {
    throw new TourError(
      "VALIDATION_ERROR",
      `This tour changed after export. Increase its version above ${draft.lastExportedVersion}.`,
      "version",
    );
  }
  return {
    ...draft,
    config,
    lastExportedVersion: config.version,
    lastExportedConfig: structuredClone(config),
    updatedAt: new Date().toISOString(),
  };
}

export function exportBackup(drafts: TourDraft[]): string {
  return JSON.stringify(
    {
      appId: "P09",
      formatVersion: 1,
      exportedAt: new Date().toISOString(),
      payload: { drafts: validateDrafts(drafts) },
    },
    null,
    2,
  );
}

export function parseBackup(text: string): TourDraft[] {
  if (new TextEncoder().encode(text).byteLength > 10 * 1024 * 1024)
    throw new TourError(
      "FILE_TOO_LARGE",
      "Workspace backups are limited to 10 MiB.",
    );
  let input: unknown;
  try {
    input = JSON.parse(text);
  } catch {
    throw new TourError("IMPORT_INVALID", "This file is not valid JSON.");
  }
  const result = z
    .strictObject({
      appId: z.literal("P09"),
      formatVersion: z.literal(1),
      exportedAt: z.string().datetime(),
      payload: z.strictObject({ drafts: z.array(draftSchema).max(50) }),
    })
    .safeParse(input);
  if (!result.success)
    throw new TourError(
      "IMPORT_INVALID",
      "Use a valid MicroOnboard format-version 1 workspace backup.",
    );
  return validateDrafts(result.data.payload.drafts);
}
