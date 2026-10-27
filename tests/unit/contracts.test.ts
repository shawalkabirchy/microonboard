import "fake-indexeddb/auto";
import { describe, it, expect } from "vitest";
import { parseConfig, textColor } from "../../src/core/config.ts";
import { sampleTour } from "../../src/core/sample.ts";
import {
  newDraft,
  freezeExport,
  exportBackup,
  parseBackup,
} from "../../src/core/drafts.ts";
import {
  readWorkspace,
  saveWorkspace,
} from "../../src/persistence/workspace.ts";

describe("configuration and export contract", () => {
  it("preserves ordered steps and rejects unknown fields, duplicate IDs, invalid limits and paths", () => {
    expect(parseConfig(sampleTour)).toEqual(sampleTour);
    for (const invalid of [
      { ...sampleTour, extra: true },
      { ...sampleTour, pagePath: "https://example.com/" },
      { ...sampleTour, pagePath: "/demo/?secret=yes" },
      { ...sampleTour, steps: [] },
      { ...sampleTour, steps: [sampleTour.steps[0], sampleTour.steps[0]] },
      { ...sampleTour, version: 0 },
      {
        ...sampleTour,
        steps: [{ ...sampleTour.steps[0], body: "x".repeat(501) }],
      },
      { ...sampleTour, title: "x".repeat(65537) },
    ])
      expect(() => parseConfig(invalid)).toThrow();
    const tenSteps = Array.from({ length: 10 }, () => ({
      ...sampleTour.steps[0],
      id: crypto.randomUUID(),
    }));
    expect(parseConfig({ ...sampleTour, steps: tenSteps }).steps).toHaveLength(
      10,
    );
    expect(() =>
      parseConfig({
        ...sampleTour,
        steps: [
          ...tenSteps,
          {
            ...sampleTour.steps[0],
            id: crypto.randomUUID(),
          },
        ],
      }),
    ).toThrow();
    expect(() =>
      parseConfig({
        ...sampleTour,
        steps: [
          {
            ...sampleTour.steps[0],
            selector: "x".repeat(301),
          },
        ],
      }),
    ).toThrow();
  });
  it("allows identical re-export and requires a higher version for changes", () => {
    const draft = freezeExport(newDraft(structuredClone(sampleTour)));
    expect(freezeExport(draft).lastExportedVersion).toBe(1);
    const changed = {
      ...draft,
      config: { ...draft.config, title: "Changed title" },
    };
    expect(() => freezeExport(changed)).toThrow("Increase its version");
    const next = freezeExport({
      ...changed,
      config: { ...changed.config, version: 2 },
    });
    expect(draft.lastExportedConfig?.title).toBe(sampleTour.title);
    expect(next.lastExportedVersion).toBe(2);
  });
  it("round trips complete backups and rejects corrupt envelopes and snapshots", () => {
    const drafts = [freezeExport(newDraft(structuredClone(sampleTour)))];
    expect(parseBackup(exportBackup(drafts))).toEqual(drafts);
    expect(() =>
      parseBackup(exportBackup(drafts).replace('"P09"', '"P01"')),
    ).toThrow();
    expect(() => parseBackup("not json")).toThrow();
    expect(() =>
      exportBackup([{ ...drafts[0], lastExportedVersion: 2 }]),
    ).toThrow();
    expect(() => exportBackup([drafts[0], drafts[0]])).toThrow();
    const fiftyDrafts = Array.from({ length: 50 }, () =>
      newDraft({
        ...structuredClone(sampleTour),
        tourId: crypto.randomUUID(),
      }),
    );
    expect(parseBackup(exportBackup(fiftyDrafts))).toHaveLength(50);
    expect(() => exportBackup([...fiftyDrafts, fiftyDrafts[0]])).toThrow();
    expect(() => parseBackup(" ".repeat(10 * 1024 * 1024 + 1))).toThrow(
      "10 MiB",
    );
  });
  it("selects contrasting text on dark and light primary colors", () => {
    expect(textColor("#ffffff")).toBe("#000000");
    expect(textColor("#777777")).toBe("#000000");
    expect(textColor("#000000")).toBe("#ffffff");
    expect(textColor("#7055E8")).toBe("#ffffff");
  });
});

describe("transactional workspace", () => {
  it("preserves the committed workspace when a stale tab or invalid import tries to replace it", async () => {
    const initial = await readWorkspace();
    const drafts = [newDraft(structuredClone(sampleTour))];
    const saved = await saveWorkspace(initial.revision, drafts);
    await expect(saveWorkspace(initial.revision, [])).rejects.toMatchObject({
      code: "STALE_LOCAL_STATE",
    });
    await expect(
      saveWorkspace(saved.revision, [drafts[0], drafts[0]]),
    ).rejects.toThrow();
    expect(await readWorkspace()).toEqual(saved);
    const replaced = await saveWorkspace(saved.revision, []);
    expect(replaced).toEqual({ revision: saved.revision + 1, drafts: [] });
  });
});
