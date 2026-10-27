import { ArrowRight, ArrowUpRight } from "lucide-react";
import { SiteHeader, SiteFooter, SOURCE } from "@/components/site";
import { Button } from "@/components/ui/button";
import { Preview } from "@/components/preview";
import size from "../../../public/embed/1.0.0/size.json";

export const metadata = { title: "The MicroOnboard story" };
export default function CaseStudy() {
  return (
    <>
      <SiteHeader active="case-study" />
      <main id="main" className="case-study">
        <section className="case-heading">
          <h1>
            A thoughtful welcome.
            <br />
            <span>A smaller footprint.</span>
          </h1>
          <p>
            A self-initiated ConsoleLog Studio project exploring how a SaaS team
            can guide new users without adding an account system, tracking, or a
            second framework to their product.
          </p>
          <div className="case-actions">
            <Button asChild>
              <a href="/demo/">
                Try the working demo
                <ArrowRight data-icon="inline-end" />
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href={SOURCE} target="_blank" rel="noreferrer">
                Explore the source
                <ArrowUpRight data-icon="inline-end" />
              </a>
            </Button>
          </div>
        </section>
        <Preview hero />
        <div className="case-content">
          <section>
            <h2>The first visit is a small, important moment.</h2>
            <p>
              A useful product can still feel unfamiliar. New users need a few
              well-placed hints: where to begin, where their work lives, and
              what to do next. MicroOnboard gives a product owner a focused way
              to build that introduction.
            </p>
            <p>
              The deliverable is a working editor, an independent TypeScript
              runtime, and a sample workspace where visitors can try both sides
              of the experience.
            </p>
          </section>
          <section>
            <h2>One page. A few good steps.</h2>
            <div className="workflow-strip">
              <span>Pick a stable target</span>
              <ArrowRight />
              <span>Write a helpful step</span>
              <ArrowRight />
              <span>Preview and export</span>
              <ArrowRight />
              <span>Install on your page</span>
            </div>
            <p>
              The builder keeps up to 50 drafts in IndexedDB. Each tour has 1–10
              steps and exports as portable JSON. A versioned script runs the
              tour on a host page without requiring React or Next.js.
            </p>
          </section>
          <section>
            <h2>The details are part of the product.</h2>
            <dl className="decision-list">
              <div>
                <dt>A target can arrive late.</dt>
                <dd>
                  The runtime waits up to two seconds, then offers Skip or End
                  rather than highlighting the wrong element.
                </dd>
              </div>
              <div>
                <dt>Finishing means finishing.</dt>
                <dd>
                  Dismissed or skipped tours do not receive a completion flag.
                  Completion belongs to one tour version in one browser profile.
                </dd>
              </div>
              <div>
                <dt>A keyboard deserves a clear path.</dt>
                <dd>
                  Non-modal controls, visible focus, announced progress, and
                  focus restoration keep guidance from becoming a barrier.
                </dd>
              </div>
              <div>
                <dt>Local data still needs care.</dt>
                <dd>
                  Revision-checked transactions prevent stale tabs from
                  overwriting saved work. Backups and explicit replacement
                  protect the last valid workspace.
                </dd>
              </div>
            </dl>
          </section>
          <section>
            <h2>A measured runtime, without a size promise.</h2>
            <p>
              The current standalone bundle is{" "}
              <strong>{(size.bytes / 1024).toFixed(1)} KiB minified</strong>,{" "}
              <strong>{(size.gzipBytes / 1024).toFixed(1)} KiB gzipped</strong>,
              and{" "}
              <strong>
                {(size.brotliBytes / 1024).toFixed(1)} KiB Brotli-compressed
              </strong>
              . These are build measurements of runtime {size.runtimeVersion},
              including its validation and positioning dependencies.
            </p>
            <p>
              The repository includes contract tests, browser integration tests,
              and a recorded acceptance matrix. Browser coverage and unrun
              checks are listed explicitly. No activation or conversion
              improvement is claimed.
            </p>
            <a
              className="text-link"
              href={`${SOURCE}/blob/main/docs/acceptance.md`}
              target="_blank"
              rel="noreferrer"
            >
              Read verification evidence
              <ArrowUpRight />
            </a>
          </section>
          <section id="privacy">
            <h2>Your tours stay yours.</h2>
            <p>
              No accounts, analytics, session replay, or user-content uploads.
              The builder stores drafts in this browser; clearing browser
              storage can remove them. Export backups for anything you want to
              keep.
            </p>
            <p>
              The embed runtime makes no network requests. A host downloads the
              runtime asset and supplies its own configuration. Author mode
              exports only stable selectors and text the author explicitly
              enters.
            </p>
          </section>
          <section>
            <h2>Focused by design.</h2>
            <p>
              The first release supports a single page per tour on sites where
              the owner installs it. It does not inspect arbitrary websites,
              target shadow roots or iframe contents, orchestrate cross-page
              tours, or remember completion across devices.
            </p>
            <p>Want a thoughtful welcome for your own product?</p>
            <Button variant="outline" asChild>
              <a
                href="https://consolelog.studio/"
                target="_blank"
                rel="noreferrer"
              >
                Talk to ConsoleLog Studio
                <ArrowUpRight data-icon="inline-end" />
              </a>
            </Button>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
