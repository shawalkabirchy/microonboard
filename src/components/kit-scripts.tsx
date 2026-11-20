"use client";

import { useEffect } from "react";

// The tasteskill kit's modules, in starter.html order. They are appended after
// hydration so the kit never changes DOM that React is still hydrating.
// system.js loads ui.js, fx.js and moments.js itself when the page needs them.
const MODULES = [
  "/assets/system.js",
  "/assets/motion/motion.js",
  "/assets/layout/layout.js",
];

export function KitScripts() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("mo-js");
    const safe = window.setTimeout(() => root.classList.add("mo-safe"), 2500);
    for (const src of MODULES) {
      if (document.querySelector(`script[data-kit="${src}"]`)) continue;
      const script = document.createElement("script");
      script.type = "module";
      script.async = false;
      script.src = src;
      script.dataset.kit = src;
      document.body.append(script);
    }
    return () => window.clearTimeout(safe);
  }, []);
  return null;
}
