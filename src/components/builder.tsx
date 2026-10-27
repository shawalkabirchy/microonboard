"use client";

import { useEffect, useRef, useState } from "react";
import {
  Plus,
  Upload,
  Download,
  Archive,
  ShieldCheck,
  CheckCircle2,
  Circle,
  Trash2,
  ListOrdered,
  Tag,
  RefreshCw,
  Copy,
  AlertCircle,
} from "lucide-react";
import { SiteHeader } from "@/components/site";
import { EditorForm } from "@/components/editor-form";
import { InstallPanel } from "@/components/install-panel";
import { Preview, type PreviewHandle } from "@/components/preview";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty";
import { Separator } from "@/components/ui/separator";
import {
  parseConfig,
  readableError,
  TourError,
  type TourConfig,
} from "@/core/config";
import {
  newDraft,
  freezeExport,
  exportBackup,
  parseBackup,
  type Workspace,
  type TourDraft,
} from "@/core/drafts";
import { sampleTour, freshTour } from "@/core/sample";
import { readWorkspace, saveWorkspace } from "@/persistence/workspace";
import { downloadJson } from "@/lib/download";
import { cn } from "@/lib/utils";

type Confirmation = {
  title: string;
  message: string;
  label: string;
  action: () => void | Promise<void>;
};

export function Builder() {
  const [workspace, setWorkspace] = useState<Workspace>({
    revision: 0,
    drafts: [],
  });
  const [editing, setEditing] = useState<TourDraft | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [selectedStep, setSelectedStep] = useState(0);
  const [needsValidation, setNeedsValidation] = useState(false);
  const [error, setError] = useState<{
    path?: string;
    message: string;
    code?: string;
  }>();
  const [notice, setNotice] = useState("");
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const file = useRef<HTMLInputElement>(null);
  const preview = useRef<PreviewHandle>(null);
  const allowLeave = useRef(false);
  const savedDraft = workspace.drafts.find((draft) => draft.id === editing?.id);
  const dirty = Boolean(
    editing && JSON.stringify(editing) !== JSON.stringify(savedDraft),
  );
  const listedDrafts =
    editing && !savedDraft ? [...workspace.drafts, editing] : workspace.drafts;

  function showError(problem: unknown) {
    setError({
      message: readableError(problem),
      path: problem instanceof TourError ? problem.fieldPath : undefined,
      code: problem instanceof TourError ? problem.code : undefined,
    });
    setNotice("");
    if (
      problem instanceof TourError &&
      problem.fieldPath?.startsWith("steps.")
    ) {
      const index = Number(problem.fieldPath.split(".")[1]);
      if (Number.isInteger(index)) setSelectedStep(index);
    }
  }
  function select(draft: TourDraft | null) {
    setEditing(draft ? structuredClone(draft) : null);
    setSelectedStep(0);
    setNeedsValidation(false);
    setError(undefined);
    setNotice("");
  }
  function requestAction(action: () => void) {
    if (dirty)
      setConfirmation({
        title: "Keep your changes?",
        message:
          "This tour has unsaved changes. Download a recovery copy before discarding them, or cancel to keep editing.",
        label: "Discard changes",
        action,
      });
    else action();
  }
  async function run(task: () => Promise<void> | void) {
    setBusy(true);
    try {
      await task();
    } catch (problem) {
      showError(problem);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    let active = true;
    readWorkspace()
      .then((value) => {
        if (!active) return;
        setWorkspace(value);
        setEditing(
          value.drafts[0] ??
            (value.revision === 0
              ? newDraft(structuredClone(sampleTour))
              : null),
        );
        setLoaded(true);
      })
      .catch((problem) => {
        if (active) {
          setError({
            message: readableError(problem),
            code: "STORAGE_UNAVAILABLE",
          });
          setEditing(newDraft(structuredClone(sampleTour)));
          setLoaded(true);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!dirty) return;
    function beforeUnload(event: BeforeUnloadEvent) {
      if (!allowLeave.current) {
        event.preventDefault();
        event.returnValue = "";
      }
    }
    function navigation(event: MouseEvent) {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        !(event.target instanceof Element)
      )
        return;
      const anchor = event.target.closest("a");
      if (
        !anchor ||
        anchor.hasAttribute("download") ||
        anchor.target === "_blank" ||
        !anchor.href ||
        anchor.getAttribute("href")?.startsWith("#")
      )
        return;
      event.preventDefault();
      event.stopPropagation();
      setConfirmation({
        title: "Keep your changes?",
        message:
          "You have unsaved work. Download a recovery copy or save your tour before leaving.",
        label: "Leave without saving",
        action: () => {
          allowLeave.current = true;
          location.assign(anchor.href);
        },
      });
    }
    window.addEventListener("beforeunload", beforeUnload);
    document.addEventListener("click", navigation, true);
    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
      document.removeEventListener("click", navigation, true);
    };
  }, [dirty]);

  function change(config: TourConfig, selectorChanged = false) {
    setEditing((draft) =>
      draft ? { ...draft, config, updatedAt: new Date().toISOString() } : null,
    );
    if (selectorChanged) setNeedsValidation(true);
    setError((current) =>
      current?.code?.startsWith("STORAGE_") ||
      current?.code === "STALE_LOCAL_STATE"
        ? current
        : undefined,
    );
    setNotice("");
  }
  async function save(exportVersion = false) {
    if (!editing) return;
    await run(async () => {
      const config = parseConfig(editing.config, document);
      if (needsValidation) {
        if (!preview.current)
          throw new TourError(
            "VALIDATION_ERROR",
            "Wait for the preview before validating a manual selector.",
          );
        await preview.current.validate(config);
      }
      const candidate = exportVersion
        ? freezeExport({ ...editing, config })
        : { ...editing, config };
      const drafts = workspace.drafts.some((draft) => draft.id === candidate.id)
        ? workspace.drafts.map((draft) =>
            draft.id === candidate.id ? candidate : draft,
          )
        : [...workspace.drafts, candidate];
      const next = await saveWorkspace(workspace.revision, drafts);
      setWorkspace(next);
      setEditing(candidate);
      setNeedsValidation(false);
      setError(undefined);
      if (exportVersion) {
        downloadJson(
          `microonboard-tour-v${config.version}.json`,
          JSON.stringify(config, null, 2),
        );
        setNotice(
          `Version ${config.version} exported. Its snapshot is saved on this device.`,
        );
      } else setNotice("Tour saved on this device.");
    });
  }
  function createTour(sample = false) {
    requestAction(() => {
      if (workspace.drafts.length >= 50) {
        showError(
          new TourError(
            "VALIDATION_ERROR",
            "You can save up to 50 tours. Export a backup and remove an unused draft first.",
          ),
        );
        return;
      }
      if (sample) {
        const existing = workspace.drafts.find(
          (draft) => draft.config.tourId === sampleTour.tourId,
        );
        if (existing) {
          select(existing);
          return;
        }
      }
      select(newDraft(sample ? structuredClone(sampleTour) : freshTour()));
    });
  }
  function backup() {
    try {
      const drafts = editing
        ? [
            ...workspace.drafts.filter((draft) => draft.id !== editing.id),
            editing,
          ]
        : workspace.drafts;
      downloadJson("microonboard-workspace.json", exportBackup(drafts));
      setNotice("Workspace backup generated, including valid pending changes.");
    } catch (problem) {
      showError(problem);
    }
  }
  function recovery() {
    downloadJson(
      "microonboard-unsaved-recovery.json",
      JSON.stringify(
        { recoveryOnly: true, draft: editing, savedWorkspace: workspace },
        null,
        2,
      ),
    );
    setNotice(
      "Recovery copy generated. Keep it for manual recovery; it is not an importable workspace backup.",
    );
  }
  async function importFile(selected: File) {
    await run(async () => {
      if (selected.size > 10 * 1024 * 1024)
        throw new TourError(
          "FILE_TOO_LARGE",
          "JSON imports are limited to 10 MiB.",
        );
      const text = await selected.text();
      let input: unknown;
      try {
        input = JSON.parse(text);
      } catch {
        throw new TourError("IMPORT_INVALID", "This file is not valid JSON.");
      }
      if (
        input &&
        typeof input === "object" &&
        ("appId" in input || "payload" in input)
      ) {
        const drafts = parseBackup(text);
        setConfirmation({
          title: "Replace this workspace?",
          message: `This backup contains ${drafts.length} tour${drafts.length === 1 ? "" : "s"}. It will replace all ${workspace.drafts.length} saved tours and any pending edits. Download your current workspace first if you want to keep it.`,
          label: "Replace workspace",
          action: async () => {
            const next = await saveWorkspace(workspace.revision, drafts);
            setWorkspace(next);
            select(drafts[0] ?? null);
            setNotice("Workspace replaced successfully.");
          },
        });
      } else {
        const config = parseConfig(input, document);
        if (
          workspace.drafts.some(
            (draft) => draft.config.tourId === config.tourId,
          )
        )
          throw new TourError(
            "IMPORT_INVALID",
            "A tour with this ID already exists. Open that draft, or restore a full workspace backup to replace it.",
          );
        requestAction(() => {
          select(newDraft(config));
          setNotice(
            "Tour imported into the editor. Save it to keep it on this device. Custom-host targets must be checked on their host.",
          );
        });
      }
    });
  }
  function removeTour() {
    if (!editing) return;
    const id = editing.id;
    setConfirmation({
      title: "Delete this tour?",
      message: `Remove “${editing.config.title}” from this browser? Download a backup first if you want to keep a copy. Installed tours are not affected.`,
      label: "Delete tour",
      action: async () => {
        const drafts = workspace.drafts.filter((draft) => draft.id !== id);
        const next = await saveWorkspace(workspace.revision, drafts);
        setWorkspace(next);
        select(drafts[0] ?? null);
        setNotice("Tour deleted from this device.");
      },
    });
  }
  async function reload() {
    await run(async () => {
      const next = await readWorkspace();
      setWorkspace(next);
      select(next.drafts[0] ?? null);
      setNotice("Loaded the latest saved workspace.");
    });
  }

  return (
    <>
      <SiteHeader active="builder" wide />
      <main id="main" className="builder-page">
        <div className="builder-heading">
          <div>
            <h1>A little guidance goes a long way.</h1>
            <p>Create a thoughtful welcome, one step at a time.</p>
          </div>
          <Button
            size="lg"
            disabled={!loaded || busy}
            onClick={() => createTour()}
          >
            <Plus data-icon="inline-start" />
            New tour
          </Button>
        </div>
        {error ? (
          <Alert variant="destructive" className="builder-alert">
            <AlertCircle />
            <AlertTitle>
              {error.code === "STALE_LOCAL_STATE"
                ? "Your saved workspace changed"
                : "This needs a little attention"}
            </AlertTitle>
            <AlertDescription>
              <p>{error.message}</p>
              <div className="recovery-actions">
                <Button variant="outline" size="sm" onClick={recovery}>
                  <Download data-icon="inline-start" />
                  Download unsaved work
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    requestAction(() => {
                      void reload();
                    })
                  }
                >
                  <RefreshCw data-icon="inline-start" />
                  Reload saved workspace
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(
                        JSON.stringify(editing, null, 2),
                      );
                      setNotice("Unsaved draft copied.");
                    } catch {
                      recovery();
                    }
                  }}
                >
                  <Copy data-icon="inline-start" />
                  Copy unsaved text
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        ) : null}
        <p className="builder-notice" role="status" aria-live="polite">
          {notice || (!loaded ? "Opening your local workspace…" : "")}
        </p>
        <div className="builder-grid">
          <aside className="tours-rail" aria-label="Your tours">
            <div className="rail-title">
              Your tours <span>{listedDrafts.length}/50</span>
            </div>
            <div className="tour-items">
              {listedDrafts.map((draft) => (
                <button
                  type="button"
                  key={draft.id}
                  className={cn(
                    "tour-item",
                    editing?.id === draft.id && "is-selected",
                  )}
                  onClick={() => {
                    if (editing?.id !== draft.id)
                      requestAction(() => select(draft));
                  }}
                >
                  <strong>
                    {editing?.id === draft.id
                      ? editing.config.title || "Untitled tour"
                      : draft.config.title}
                  </strong>
                  <span>
                    <ListOrdered aria-hidden="true" />
                    {draft.config.steps.length} step
                    {draft.config.steps.length === 1 ? "" : "s"}
                  </span>
                  <span>
                    <Tag aria-hidden="true" />
                    Version {draft.config.version}
                  </span>
                </button>
              ))}
            </div>
            <Separator />
            <div className="rail-actions">
              <Button
                variant="outline"
                disabled={busy || !loaded}
                onClick={() => file.current?.click()}
              >
                <Upload data-icon="inline-start" />
                Import JSON
              </Button>
              <Button
                variant="outline"
                disabled={busy || !loaded}
                onClick={backup}
              >
                <Archive data-icon="inline-start" />
                Workspace backup
              </Button>
              <Button
                variant="ghost"
                disabled={busy || !loaded}
                onClick={() => createTour(true)}
              >
                Load sample tour
              </Button>
              {editing ? (
                <Button variant="ghost" disabled={busy} onClick={removeTour}>
                  <Trash2 data-icon="inline-start" />
                  Delete tour
                </Button>
              ) : null}
            </div>
            <p className="local-note">
              <ShieldCheck aria-hidden="true" />
              Your work stays in this browser. Back it up to keep it safe.
            </p>
            <input
              ref={file}
              aria-label="Import tour or workspace JSON"
              type="file"
              accept=".json,application/json"
              className="sr-only"
              onChange={(event) => {
                const selected = event.target.files?.[0];
                event.target.value = "";
                if (selected) void importFile(selected);
              }}
            />
          </aside>
          {editing ? (
            <>
              <section className="inspector" aria-label="Tour editor">
                <Tabs defaultValue="edit">
                  <TabsList variant="line" className="editor-tabs">
                    <TabsTrigger value="edit">Edit tour</TabsTrigger>
                    <TabsTrigger value="install">Install</TabsTrigger>
                  </TabsList>
                  <TabsContent value="edit">
                    <fieldset disabled={busy} className="inspector-fields">
                      <EditorForm
                        config={editing.config}
                        selectedStep={selectedStep}
                        onSelect={setSelectedStep}
                        onChange={change}
                        onPick={() => preview.current?.pick()}
                        error={error}
                      />
                    </fieldset>
                  </TabsContent>
                  <TabsContent value="install">
                    <InstallPanel
                      draft={editing}
                      onExport={() => void save(true)}
                      busy={busy}
                    />
                  </TabsContent>
                </Tabs>
                <div className="save-bar">
                  <span
                    className={cn(
                      "save-status",
                      !dirty && !error && "is-saved",
                    )}
                  >
                    {dirty || error ? (
                      <Circle aria-hidden="true" />
                    ) : (
                      <CheckCircle2 aria-hidden="true" />
                    )}
                    {busy
                      ? "Saving…"
                      : dirty
                        ? "Not saved"
                        : "Saved on this device"}
                  </span>
                  <Button disabled={busy} onClick={() => void save()}>
                    {busy ? "Saving…" : "Save tour"}
                  </Button>
                </div>
              </section>
              <Preview
                ref={preview}
                config={editing.config}
                onPick={(selector) => {
                  change(
                    {
                      ...editing.config,
                      steps: editing.config.steps.map((step, index) =>
                        index === selectedStep ? { ...step, selector } : step,
                      ),
                    },
                    true,
                  );
                  setNotice(
                    "Target selected. Save your tour when you are ready.",
                  );
                }}
                onError={(message) => showError(new Error(message))}
              />
            </>
          ) : (
            <div className="builder-empty">
              <Empty>
                <EmptyHeader>
                  <EmptyTitle>
                    {loaded
                      ? "Your next welcome starts here."
                      : "Opening your workspace…"}
                  </EmptyTitle>
                  <EmptyDescription>
                    Create a tour from scratch, load the example, or import your
                    own JSON.
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button disabled={!loaded} onClick={() => createTour(true)}>
                    Load sample tour
                  </Button>
                </EmptyContent>
              </Empty>
            </div>
          )}
        </div>
      </main>
      <AlertDialog
        open={confirmation !== null}
        onOpenChange={(open) => {
          if (!open) setConfirmation(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmation?.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmation?.message}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="confirmation-backup">
            <Button variant="outline" size="sm" onClick={backup}>
              Download current backup
            </Button>
            <Button variant="ghost" size="sm" onClick={recovery}>
              Download recovery copy
            </Button>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const action = confirmation?.action;
                setConfirmation(null);
                if (action) void run(action);
              }}
            >
              {confirmation?.label}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
