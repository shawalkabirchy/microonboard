import { openDB, type IDBPDatabase } from "idb";
import { TourError } from "../core/config.ts";
import {
  validateDrafts,
  type TourDraft,
  type Workspace,
} from "../core/drafts.ts";

let connection: Promise<IDBPDatabase> | undefined;

function database() {
  if (!connection) {
    connection = new Promise<IDBPDatabase>((resolve, reject) => {
      openDB("microonboard", 1, {
        upgrade(db) {
          db.createObjectStore("workspace");
        },
        blocked() {
          reject(
            new TourError(
              "STORAGE_UNAVAILABLE",
              "Close other MicroOnboard tabs, then reload. Your data has not been changed.",
            ),
          );
        },
        blocking() {
          connection?.then((db) => db.close());
          connection = undefined;
        },
        terminated() {
          connection = undefined;
        },
      }).then(resolve, reject);
    }).catch((error) => {
      connection = undefined;
      throw storageError(error);
    });
  }
  return connection;
}

function storageError(error: unknown): TourError {
  if (error instanceof TourError) return error;
  if (error instanceof Error && error.name === "QuotaExceededError")
    return new TourError(
      "STORAGE_FULL",
      "Browser storage is full. Export your pending work, then free some space.",
    );
  return new TourError(
    "STORAGE_UNAVAILABLE",
    "Browser storage is unavailable. Keep this page open and export your pending work.",
  );
}

export async function readWorkspace(): Promise<Workspace> {
  try {
    const db = await database();
    const record = (await db.get("workspace", "current")) as
      Workspace | undefined;
    if (!record) return { revision: 0, drafts: [] };
    if (!Number.isSafeInteger(record.revision) || record.revision < 0)
      throw new TourError(
        "STORAGE_UNAVAILABLE",
        "The saved workspace is invalid. It has been preserved for recovery.",
      );
    return { revision: record.revision, drafts: validateDrafts(record.drafts) };
  } catch (error) {
    throw storageError(error);
  }
}

export async function saveWorkspace(
  expectedRevision: number,
  drafts: TourDraft[],
): Promise<Workspace> {
  const valid = validateDrafts(drafts);
  try {
    const db = await database();
    const tx = db.transaction("workspace", "readwrite");
    const current = (await tx.store.get("current")) as Workspace | undefined;
    if ((current?.revision ?? 0) !== expectedRevision) {
      tx.abort();
      await tx.done.catch(() => undefined);
      throw new TourError(
        "STALE_LOCAL_STATE",
        "Another tab changed this workspace. Export your unsaved work or reload the latest saved version.",
      );
    }
    const next = { revision: expectedRevision + 1, drafts: valid };
    try {
      await tx.store.put(next, "current");
      await tx.done;
    } catch (error) {
      await tx.done.catch(() => undefined);
      throw error;
    }
    return next;
  } catch (error) {
    throw storageError(error);
  }
}
