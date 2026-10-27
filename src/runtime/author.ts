import {
  parseConfig,
  readableError,
  TourError,
  type TourConfig,
  type TourStep,
} from "../core/config.ts";
import { action, makeSurface, node, uniqueTarget, visible } from "./surface.ts";

export function stableSelector(target: Element): string {
  const element = target.closest("[data-tour-id], [id]");
  if (!element || !visible(element))
    throw new TourError(
      "TARGET_UNSTABLE",
      "Ask your developer to add a unique data-tour-id to this element.",
    );
  const tourId = element.getAttribute("data-tour-id");
  const candidates = [
    tourId ? `[data-tour-id="${CSS.escape(tourId)}"]` : "",
    element.id ? `#${CSS.escape(element.id)}` : "",
  ];
  for (const selector of candidates)
    if (selector && selector.length <= 300 && uniqueTarget(selector))
      return selector;
  throw new TourError(
    "TARGET_UNSTABLE",
    "This target needs a unique, stable data-tour-id. Fragile position selectors are not generated.",
  );
}

export function createPicker(options: {
  styleNonce?: string;
  onPick: (selector: string) => void;
  onCancel?: () => void;
}) {
  const surface = makeSurface(options.styleNonce);
  const previousFocus =
    document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
  const heading = node("h2", "Choose a moment");
  heading.id = "mo-picker-heading";
  const status = node(
    "p",
    "Select an element with a unique data-tour-id or stable ID. Tab to a target and press Enter, or click it.",
  );
  status.setAttribute("aria-live", "polite");
  surface.panel.setAttribute("role", "dialog");
  surface.panel.setAttribute("aria-modal", "false");
  surface.panel.setAttribute("aria-labelledby", heading.id);
  const cancel = action("Cancel picking", () => destroy(true));
  const footer = node("div", undefined, "mo-actions");
  footer.append(cancel);
  surface.panel.append(heading, status, footer);
  const position = () =>
    surface.position(
      12,
      Math.max(12, innerHeight - surface.panel.offsetHeight - 12),
    );
  position();
  cancel.focus();
  let ended = false;
  const isOwnUi = (event: Event) => event.composedPath().includes(surface.root);
  function point(event: PointerEvent) {
    if (isOwnUi(event) || !(event.target instanceof Element)) return;
    try {
      surface.highlight(uniqueTarget(stableSelector(event.target)));
    } catch {
      surface.highlight();
    }
  }
  function choose(target: Element) {
    try {
      const selector = stableSelector(target);
      destroy(false);
      options.onPick(selector);
    } catch (error) {
      status.textContent = readableError(error);
    }
  }
  function click(event: MouseEvent) {
    if (isOwnUi(event) || !(event.target instanceof Element)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    choose(event.target);
  }
  function keydown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopImmediatePropagation();
      destroy(true);
    } else if (
      event.key === "Enter" &&
      !isOwnUi(event) &&
      event.target instanceof Element
    ) {
      event.preventDefault();
      event.stopImmediatePropagation();
      choose(event.target);
    }
  }
  function destroy(cancelled = false) {
    if (ended) return;
    ended = true;
    document.removeEventListener("pointermove", point, true);
    document.removeEventListener("click", click, true);
    document.removeEventListener("keydown", keydown, true);
    window.removeEventListener("resize", position);
    surface.destroy();
    if (previousFocus?.isConnected)
      previousFocus.focus({ preventScroll: true });
    if (cancelled) options.onCancel?.();
  }
  document.addEventListener("pointermove", point, true);
  document.addEventListener("click", click, true);
  document.addEventListener("keydown", keydown, true);
  window.addEventListener("resize", position, { passive: true });
  return { destroy: () => destroy(true) };
}

export function enableAuthorMode(
  options: {
    styleNonce?: string;
    onExport?: (config: TourConfig) => void;
  } = {},
) {
  const priorFocus =
    document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
  const surface = makeSurface(options.styleNonce);
  surface.panel.classList.add("mo-author");
  const heading = node("h2", "Build a little guidance");
  heading.id = "mo-author-heading";
  surface.panel.setAttribute("role", "dialog");
  surface.panel.setAttribute("aria-modal", "false");
  surface.panel.setAttribute("aria-labelledby", heading.id);
  const status = node(
    "p",
    "Author mode · Only selectors and the text you enter are exported.",
    "mo-note",
  );
  const feedback = node("p", "", "mo-status");
  feedback.setAttribute("role", "status");
  let picker: ReturnType<typeof createPicker> | undefined;
  let selected = "";
  let destroyed = false;
  const tourId = crypto.randomUUID();
  const steps: TourStep[] = [];
  const list = node("ol");
  function field(
    label: string,
    initial: string,
    maxLength: number,
    multiline = false,
  ) {
    const wrapper = node("label", undefined, "mo-field");
    wrapper.append(node("span", label));
    const input = multiline ? node("textarea") : node("input");
    input.value = initial;
    input.maxLength = maxLength;
    wrapper.append(input);
    surface.panel.append(wrapper);
    return input;
  }
  const close = action("×", destroy);
  close.className = "mo-close";
  close.setAttribute("aria-label", "Close author mode");
  surface.panel.append(close, heading, status);
  const title = field("Tour title", "Welcome tour", 80);
  const version = field("Tour version", "1", 8);
  const stepTitle = field("Step title", "Your next step", 80);
  const body = field(
    "Step content",
    "Write a short, helpful introduction to this part of your product.",
    500,
    true,
  );
  const targetLabel = node("p", "No target selected", "mo-note");
  const controls = node("div", undefined, "mo-actions");
  controls.append(
    action("Pick target", () => {
      surface.panel.hidden = true;
      picker = createPicker({
        styleNonce: options.styleNonce,
        onPick(selector) {
          selected = selector;
          targetLabel.textContent = selector;
          surface.panel.hidden = false;
        },
        onCancel() {
          surface.panel.hidden = false;
        },
      });
    }),
    action(
      "Add step",
      () => {
        try {
          if (steps.length >= 10)
            throw new TourError(
              "VALIDATION_ERROR",
              "A tour can contain at most 10 steps.",
            );
          if (!selected || !uniqueTarget(selected))
            throw new TourError(
              "VALIDATION_ERROR",
              "Select one visible, unique target first.",
            );
          const step: TourStep = {
            id: crypto.randomUUID(),
            selector: selected,
            title: stepTitle.value,
            body: body.value,
            placement: "auto",
          };
          parseConfig(
            {
              schemaVersion: 1,
              tourId,
              title: title.value,
              version: Number(version.value),
              pagePath: location.pathname,
              theme: { primaryColor: "#7055E8" },
              steps: [...steps, step],
            },
            document,
          );
          steps.push(step);
          list.append(node("li", step.title));
          selected = "";
          targetLabel.textContent = "No target selected";
          feedback.textContent = `${steps.length} step${steps.length === 1 ? "" : "s"} added.`;
        } catch (error) {
          feedback.textContent = readableError(error);
        }
      },
      true,
    ),
  );
  function exportConfig() {
    if (destroyed)
      throw new TourError("RUNTIME_DESTROYED", "Author mode has been closed.");
    return parseConfig(
      {
        schemaVersion: 1,
        tourId,
        title: title.value,
        version: Number(version.value),
        pagePath: location.pathname,
        steps,
        theme: { primaryColor: "#7055E8" },
      },
      document,
    );
  }
  const download = action("Download tour JSON", () => {
    try {
      const config = exportConfig();
      const url = URL.createObjectURL(
        new Blob([JSON.stringify(config, null, 2)], {
          type: "application/json",
        }),
      );
      const anchor = node("a");
      anchor.href = url;
      anchor.download = `microonboard-${config.tourId}.json`;
      surface.panel.append(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      options.onExport?.(config);
      feedback.textContent =
        "JSON generated. Import the downloaded tour into the builder.";
    } catch (error) {
      feedback.textContent = readableError(error);
    }
  });
  surface.panel.append(targetLabel, controls, list, download, feedback);
  function position() {
    surface.position(
      Math.max(12, innerWidth - surface.panel.offsetWidth - 12),
      12,
    );
  }
  position();
  title.focus();
  window.addEventListener("resize", position, { passive: true });
  function destroy() {
    if (destroyed) return;
    destroyed = true;
    picker?.destroy();
    window.removeEventListener("resize", position);
    surface.destroy();
    if (priorFocus?.isConnected) priorFocus.focus({ preventScroll: true });
  }
  return { exportConfig, destroy };
}
