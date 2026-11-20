import { ArrowUpRight, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const SOURCE = "https://github.com/shawalkabirchy/microonboard";

export function Brand() {
  return (
    // eslint-disable-next-line @next/next/no-html-link-for-pages -- Native navigation preserves the editor's browser Back/unload protection.
    <a href="/" className="brand" aria-label="MicroOnboard home">
      {/* eslint-disable-next-line @next/next/no-img-element -- A static SVG mark; next/image adds nothing here. */}
      <img src="/icon.svg" alt="" width={24} height={24} />
      <span>MicroOnboard</span>
    </a>
  );
}

export function SiteHeader({
  active,
  wide = false,
}: {
  active?: "builder" | "demo" | "case-study";
  wide?: boolean;
}) {
  return (
    <header className={cn("site-header", wide && "site-header-wide")}>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <div className="header-inner">
        <Brand />
        <nav aria-label="Main navigation" className="main-nav">
          {active ? (
            <a
              href="/builder/"
              aria-current={active === "builder" ? "page" : undefined}
            >
              Builder
            </a>
          ) : (
            <a href="#how-it-works">How it works</a>
          )}
          <a
            href="/demo/"
            aria-current={active === "demo" ? "page" : undefined}
          >
            Live demo
          </a>
          <a
            href="/case-study/"
            aria-current={active === "case-study" ? "page" : undefined}
          >
            Case study
          </a>
        </nav>
        {active === "builder" ? (
          <a
            className="source-link"
            href={SOURCE}
            target="_blank"
            rel="noreferrer"
          >
            <Code2 aria-hidden="true" /> <span>View source</span>
          </a>
        ) : (
          <Button asChild size="lg">
            <a href="/builder/">
              Open builder
              <ArrowUpRight data-icon="inline-end" />
            </a>
          </Button>
        )}
      </div>
    </header>
  );
}
