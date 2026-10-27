"use client";

import { useEffect } from "react";
import { Workspace } from "@/components/workspace";
import { create, type TourInstance } from "@/runtime/tour";
import { createPicker } from "@/runtime/author";
import { uniqueTarget } from "@/runtime/surface";
import { parseConfig, readableError, TourError } from "@/core/config";

export function PreviewHost() {
  useEffect(() => {
    if (parent === window) return;
    let tour: TourInstance | undefined;
    let picker: ReturnType<typeof createPicker> | undefined;
    const report = (message: Record<string, unknown>) =>
      parent.postMessage(
        { channel: "microonboard-preview", ...message },
        location.origin,
      );
    async function receive(event: MessageEvent) {
      if (
        event.origin !== location.origin ||
        event.source !== parent ||
        event.data?.channel !== "microonboard-preview"
      )
        return;
      const { action, config: input, requestId } = event.data;
      if (action === "hello") {
        report({ type: "ready" });
        return;
      }
      if (action === "validate") {
        try {
          const config = parseConfig(input, document);
          for (const [index, step] of config.steps.entries())
            if (!uniqueTarget(step.selector))
              throw new TourError(
                "VALIDATION_ERROR",
                `Step ${index + 1}: target must match exactly one visible element in the preview. Use author mode for another host page.`,
                `steps.${index}.selector`,
              );
          report({ type: "validated", requestId });
        } catch (error) {
          report({
            type: "validated",
            requestId,
            error: readableError(error),
            fieldPath: error instanceof TourError ? error.fieldPath : undefined,
          });
        }
        return;
      }
      tour?.resetCompletion();
      tour?.destroy();
      picker?.destroy();
      try {
        if (action === "play") {
          const config = parseConfig(input, document);
          tour = create({
            ...config,
            tourId: crypto.randomUUID(),
            pagePath: location.pathname,
          });
          await tour.start(true);
        } else if (action === "pick")
          picker = createPicker({
            onPick(selector) {
              report({ type: "picked", selector });
            },
          });
      } catch (error) {
        report({ type: "error", message: readableError(error) });
      }
    }
    window.addEventListener("message", receive);
    report({ type: "ready" });
    return () => {
      window.removeEventListener("message", receive);
      tour?.resetCompletion();
      tour?.destroy();
      picker?.destroy();
    };
  }, []);
  return (
    <main id="main" className="preview-host">
      <h1 className="sr-only">Example project workspace</h1>
      <Workspace />
    </main>
  );
}
