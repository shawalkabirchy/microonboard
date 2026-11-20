import type { Metadata } from "next";
import {
  Arrow,
  KitHead,
  MAIN_ACTION,
  MarketingFooter,
  MarketingNav,
} from "@/components/marketing";

export const metadata: Metadata = {
  title: "Page not found",
  other: { "site-kind": "software", "page-type": "software" },
};

export default function NotFound() {
  return (
    <>
      <KitHead />
      <MarketingNav />
      <main id="main">
        <section
          className="hero hero--statement"
          id="top"
          aria-labelledby="hero-h"
        >
          <div className="wrap">
            <div className="hero-text hero__in">
              <div>
                <h1 id="hero-h">Page not found</h1>
                <p className="hero__lead">
                  This address has no page. The builder, the live demo and the
                  case study are linked below.
                </p>
                <div className="btn-row">
                  <a className="btn btn--primary" href="/builder/">
                    {MAIN_ACTION}
                    <Arrow />
                  </a>
                  {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- Native navigation loads the page with its own stylesheet. */}
                  <a className="btn btn--secondary" href="/">
                    Go to the home page
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </>
  );
}
