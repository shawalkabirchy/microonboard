import { TourError } from "../core/config.ts";

const css = `
:host{all:initial;position:fixed;inset:0;z-index:2147483000;pointer-events:none;color:#202033;font:14px/1.55 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;direction:ltr;color-scheme:light}
*{box-sizing:border-box}button,input,textarea{font:inherit}button{cursor:pointer;border-radius:7px;padding:9px 14px;border:1px solid #dcdce7;background:#fff;color:#29283d;min-height:40px}button:focus-visible,input:focus-visible,textarea:focus-visible{outline:3px solid #a28bf4;outline-offset:3px}button:disabled{opacity:.45;cursor:default}
.mo-panel{position:fixed;pointer-events:auto;width:330px;max-width:calc(100vw - 24px);max-height:calc(100dvh - 24px);overflow:auto;border:1px solid var(--mo-primary,#7055e8);border-radius:12px;background:#fff;box-shadow:0 12px 44px #24203e25;padding:22px;left:12px;top:12px}
h2{font-size:17px;line-height:1.35;letter-spacing:-.025em;margin:0 24px 8px 0;font-weight:650;outline:none}p{margin:0;color:#5c5d72;white-space:pre-wrap;overflow-wrap:anywhere}.mo-close{position:absolute;right:9px;top:8px;padding:3px 8px;border:0;font-size:22px;background:transparent;color:#76768c;min-height:32px}.mo-footer{display:flex;align-items:center;gap:8px;margin-top:20px;padding-top:15px;border-top:1px solid #ededf3}.mo-progress{margin-right:auto;font-size:12px;color:#727286}.mo-primary{background:var(--mo-primary,#7055e8);color:var(--mo-on-primary,#fff);border-color:var(--mo-primary,#7055e8)}.mo-ring{position:fixed;pointer-events:none;border:2px solid var(--mo-primary,#7055e8);border-radius:8px;box-shadow:0 0 0 5px #7055e822;left:-10000px;top:-10000px;width:0;height:0}.mo-note{font-size:12px;margin-top:12px}.mo-field{display:grid;gap:5px;margin-top:10px;font-size:12px}.mo-field input,.mo-field textarea{width:100%;min-height:36px;border:1px solid #dcdce7;border-radius:6px;padding:8px;color:#202033;background:#fff}.mo-field textarea{min-height:72px}.mo-status{color:#854713;font-size:12px;margin-top:10px}.mo-author{width:340px}.mo-author h2{margin-right:20px}.mo-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:15px}.mo-author ol{padding-left:22px;font-size:12px}.mo-author a{color:#5234bb}
@media(prefers-reduced-motion:reduce){*{scroll-behavior:auto!important}}
`;

export function node<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  text?: string,
  className?: string,
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);
  if (text !== undefined) element.textContent = text;
  if (className) element.className = className;
  return element;
}

export function action(text: string, onClick: () => void, primary = false) {
  const button = node("button", text, primary ? "mo-primary" : undefined);
  button.type = "button";
  button.addEventListener("click", onClick);
  return button;
}

export function makeSurface(
  styleNonce?: string,
  color = "#7055E8",
  onColor = "#ffffff",
) {
  const root = node("div");
  root.dataset.microonboardRoot = "";
  const shadow = root.attachShadow({ mode: "open" });
  const stylesheet = node("style");
  if (styleNonce) stylesheet.nonce = styleNonce;
  stylesheet.textContent =
    css + `:host{--mo-primary:${color};--mo-on-primary:${onColor}}`;
  const panel = node("section", undefined, "mo-panel");
  const ring = node("div", undefined, "mo-ring");
  ring.setAttribute("aria-hidden", "true");
  shadow.append(stylesheet, ring, panel);
  document.body.append(root);
  if (!stylesheet.sheet) {
    root.remove();
    throw new TourError(
      "STYLE_UNAVAILABLE",
      "The host policy blocked tour styles. Pass the host's permitted style nonce.",
    );
  }
  const rules = Array.from(stylesheet.sheet.cssRules);
  const panelRule = rules.find(
    (rule) => rule instanceof CSSStyleRule && rule.selectorText === ".mo-panel",
  ) as CSSStyleRule;
  const ringRule = rules.find(
    (rule) => rule instanceof CSSStyleRule && rule.selectorText === ".mo-ring",
  ) as CSSStyleRule;
  return {
    root,
    shadow,
    panel,
    ring,
    position(x: number, y: number) {
      panelRule.style.setProperty("left", `${x}px`);
      panelRule.style.setProperty("top", `${y}px`);
    },
    center() {
      this.position(
        Math.max(12, (innerWidth - panel.offsetWidth) / 2),
        Math.max(12, (innerHeight - panel.offsetHeight) / 2),
      );
    },
    highlight(target?: Element) {
      const rect = target?.getBoundingClientRect();
      for (const [key, value] of Object.entries(
        rect
          ? {
              left: rect.left - 4,
              top: rect.top - 4,
              width: rect.width + 8,
              height: rect.height + 8,
            }
          : { left: -10000, top: -10000, width: 0, height: 0 },
      ))
        ringRule.style.setProperty(key, `${value}px`);
    },
    destroy() {
      root.remove();
    },
  };
}

export function visible(element: Element): boolean {
  const style = getComputedStyle(element);
  return (
    element.getClientRects().length > 0 &&
    style.visibility !== "hidden" &&
    style.visibility !== "collapse" &&
    style.display !== "none" &&
    style.opacity !== "0"
  );
}

export function uniqueTarget(selector: string): Element | undefined {
  const matches = document.querySelectorAll(selector);
  return matches.length === 1 && visible(matches[0]) ? matches[0] : undefined;
}
