import {
  autoUpdate,
  autoPlacement,
  computePosition,
  flip,
  offset,
  shift,
  type Placement,
} from "@floating-ui/dom";
import { parseConfig, textColor, TourError } from "../core/config.ts";
import { action, makeSurface, node, uniqueTarget } from "./surface.ts";

export type TourState =
  "idle" | "running" | "completed" | "dismissed" | "destroyed";
const sessionCompletions = new Set<string>();

export function create(input: unknown, styleNonce?: string) {
  const config = parseConfig(input, document);
  const storageKey = `microonboard:${config.tourId}:${config.version}`;
  let state: TourState = "idle";
  let index = 0;
  let generation = 0;
  let surface: ReturnType<typeof makeSurface> | undefined;
  let priorFocus: HTMLElement | null = null;
  let disposePosition: (() => void) | undefined;
  let cancelWait: (() => void) | undefined;
  let cancelFrame = 0;
  let activeTarget: Element | undefined;
  const traversed = new Set<number>();
  const skipped = new Set<number>();

  function emit(name: string) {
    document.dispatchEvent(
      new CustomEvent(`microonboard:${name}`, {
        detail: {
          tourId: config.tourId,
          version: config.version,
          completedStepCount: traversed.size,
        },
      }),
    );
  }
  function storageUnavailable() {
    emit("storageUnavailable");
  }
  function hasCompletion() {
    try {
      return (
        Boolean(localStorage.getItem(storageKey)) ||
        sessionCompletions.has(storageKey)
      );
    } catch {
      storageUnavailable();
      return sessionCompletions.has(storageKey);
    }
  }
  function cleanStep() {
    cancelWait?.();
    cancelWait = undefined;
    disposePosition?.();
    disposePosition = undefined;
    cancelAnimationFrame(cancelFrame);
    cancelFrame = 0;
    activeTarget = undefined;
  }
  function restoreFocus() {
    if (priorFocus?.isConnected) priorFocus.focus({ preventScroll: true });
    priorFocus = null;
  }
  function cleanup() {
    generation++;
    cleanStep();
    document.removeEventListener("keydown", keydown);
    surface?.destroy();
    surface = undefined;
    restoreFocus();
  }
  function dismiss() {
    if (state !== "running") return;
    state = "dismissed";
    cleanup();
    emit("dismissed");
  }
  function finish() {
    sessionCompletions.add(storageKey);
    try {
      localStorage.setItem(storageKey, new Date().toISOString());
    } catch {
      storageUnavailable();
    }
    state = "completed";
    cleanup();
    emit("completed");
  }
  function keydown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      event.preventDefault();
      dismiss();
    }
  }

  function render(
    title: string,
    body: string,
    missing = false,
    waiting = false,
  ) {
    if (!surface) return;
    const heading = node("h2", title);
    heading.id = "mo-heading";
    heading.tabIndex = -1;
    heading.setAttribute("aria-describedby", "mo-progress");
    surface.panel.setAttribute("role", "dialog");
    surface.panel.setAttribute("aria-modal", "false");
    surface.panel.setAttribute("aria-labelledby", heading.id);
    const close = action("×", dismiss);
    close.className = "mo-close";
    close.setAttribute("aria-label", "Close tour");
    const progress = node(
      "span",
      `Step ${index + 1} of ${config.steps.length}`,
      "mo-progress",
    );
    progress.setAttribute("aria-live", "polite");
    progress.id = "mo-progress";
    const footer = node("div", undefined, "mo-footer");
    footer.append(progress);
    if (index > 0 && !waiting)
      footer.append(
        action("Back", () => {
          void showStep(index - 1);
        }),
      );
    if (waiting) footer.append(action("End tour", dismiss));
    else if (missing) {
      footer.append(action("End tour", dismiss));
      footer.append(
        action(
          "Skip step",
          () => {
            skipped.add(index);
            if (index === config.steps.length - 1) dismiss();
            else void showStep(index + 1);
          },
          true,
        ),
      );
    } else {
      const last = index === config.steps.length - 1;
      const canFinish =
        last && skipped.size === 0 && traversed.size >= config.steps.length - 1;
      footer.append(
        action(
          last ? (canFinish ? "Finish" : "End tour") : "Next",
          () => {
            if (!activeTarget) return;
            if (uniqueTarget(config.steps[index].selector) !== activeTarget) {
              void showStep(index);
              return;
            }
            traversed.add(index);
            skipped.delete(index);
            if (last) {
              if (traversed.size === config.steps.length && skipped.size === 0)
                finish();
              else dismiss();
            } else void showStep(index + 1);
          },
          true,
        ),
      );
    }
    surface.panel.replaceChildren(close, heading, node("p", body), footer);
    if (!waiting) heading.focus({ preventScroll: true });
  }

  function waitForTarget(selector: string): Promise<Element | undefined> {
    const target = uniqueTarget(selector);
    if (target) return Promise.resolve(target);
    return new Promise((resolve) => {
      let settled = false;
      const observer = new MutationObserver(check);
      const interval = setInterval(check, 80);
      const timeout = setTimeout(() => done(undefined), 2000);
      function done(found?: Element) {
        if (settled) return;
        settled = true;
        observer.disconnect();
        clearInterval(interval);
        clearTimeout(timeout);
        resolve(found);
      }
      function check() {
        const found = uniqueTarget(selector);
        if (found) done(found);
      }
      observer.observe(document.documentElement, {
        childList: true,
        attributes: true,
        subtree: true,
      });
      cancelWait = () => done(undefined);
      check();
    });
  }

  async function showStep(nextIndex: number) {
    cleanStep();
    index = nextIndex;
    const token = ++generation;
    const step = config.steps[index];
    surface?.highlight();
    render(
      "Finding your next step…",
      "Waiting briefly for this part of the page to appear.",
      false,
      true,
    );
    surface?.center();
    const target = await waitForTarget(step.selector);
    if (token !== generation || state !== "running" || !surface) return;
    cancelWait = undefined;
    if (!target) {
      render(
        "This step isn't available",
        "The target is missing, hidden, or matches more than one element. Skip this step or end the tour.",
        true,
      );
      surface.center();
      const center = () => surface?.center();
      window.addEventListener("resize", center, { passive: true });
      disposePosition = () => window.removeEventListener("resize", center);
      return;
    }
    activeTarget = target;
    const bounds = target.getBoundingClientRect();
    if (
      bounds.top < 0 ||
      bounds.left < 0 ||
      bounds.bottom > innerHeight ||
      bounds.right > innerWidth
    ) {
      target.scrollIntoView({
        block: "nearest",
        inline: "nearest",
        behavior: "instant",
      });
    }
    render(step.title, step.body);
    const ui = surface;
    const update = () => {
      if (cancelFrame) return;
      cancelFrame = requestAnimationFrame(() => {
        cancelFrame = 0;
        if (token !== generation || !target.isConnected) return;
        ui.highlight(target);
        void computePosition(target, ui.panel, {
          strategy: "fixed",
          placement:
            step.placement === "auto"
              ? "bottom"
              : (step.placement as Placement),
          middleware: [
            offset(16),
            ...(step.placement === "auto"
              ? [autoPlacement({ padding: 12 })]
              : [flip({ padding: 12 })]),
            shift({ padding: 12, crossAxis: true }),
          ],
        }).then(({ x, y }) => {
          if (token === generation && state === "running") ui.position(x, y);
        });
      });
    };
    disposePosition = autoUpdate(target, ui.panel, update);
    update();
  }

  return {
    get state() {
      return state;
    },
    async start(replay = false) {
      if (state === "destroyed")
        throw new TourError(
          "RUNTIME_DESTROYED",
          "Create a new instance to run this tour again.",
        );
      if (location.pathname !== config.pagePath)
        throw new TourError(
          "PAGE_MISMATCH",
          `This tour belongs on ${config.pagePath}.`,
        );
      if (state === "running") return;
      if (!replay && (state === "completed" || hasCompletion())) {
        state = "completed";
        return;
      }
      if (!document.body)
        throw new TourError(
          "DOCUMENT_NOT_READY",
          "Start the tour after the host document is ready.",
        );
      traversed.clear();
      skipped.clear();
      priorFocus =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
      surface = makeSurface(
        styleNonce,
        config.theme.primaryColor,
        textColor(config.theme.primaryColor),
      );
      state = "running";
      document.addEventListener("keydown", keydown);
      await showStep(0);
    },
    stop() {
      if (state === "running") {
        state = "idle";
        cleanup();
      }
    },
    resetCompletion() {
      sessionCompletions.delete(storageKey);
      try {
        localStorage.removeItem(storageKey);
      } catch {
        storageUnavailable();
      }
      if (state === "completed") state = "idle";
    },
    destroy() {
      if (state === "destroyed") return;
      cleanup();
      state = "destroyed";
    },
  };
}

export type TourInstance = ReturnType<typeof create>;
