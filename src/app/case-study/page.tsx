/*
  A long-copy sub-page on the landing page's system (the same deal, nav and footer.closing).
  Screens at 1440x900: hero 1, #preview 1, #story 1, #details 1, #privacy 1, footer.closing 1.
*/
import type { Metadata } from "next";
import { Preview } from "@/components/preview";
import {
  Arrow,
  KitHead,
  MAIN_ACTION,
  MarketingFooter,
  MarketingNav,
  SOURCE,
} from "@/components/marketing";
import size from "../../../public/embed/1.0.0/size.json";

export const metadata: Metadata = {
  title: "Case study",
  other: { "site-kind": "software", "page-type": "software" },
};

const kB = (bytes: number) => `${(bytes / 1000).toFixed(1)} kB`;

const workflow = [
  [
    "Pick a stable target",
    "A data-tour-id first, then a unique element id. No fragile nth-child selectors are generated.",
  ],
  [
    "Write the step",
    "A title and plain text only. Markup in a step renders literally on the host page.",
  ],
  [
    "Preview and export",
    "The real runtime plays the tour beside the editor; export freezes a version as JSON.",
  ],
  [
    "Install on the page",
    "The host loads the versioned script, passes the JSON and calls start.",
  ],
] as const;

const decisions = [
  [
    "A target can arrive late",
    "The runtime waits up to two seconds, then offers Skip step or End tour rather than highlighting the wrong element.",
  ],
  [
    "Finishing means finishing",
    "Dismissed or skipped tours store no completion. Completion belongs to one tour version in one browser profile.",
  ],
  [
    "A keyboard gets a clear path",
    "Non-modal controls, visible focus, announced progress and focus restoration keep guidance from becoming a barrier.",
  ],
  [
    "Local data still needs care",
    "Revision-checked transactions stop a stale tab overwriting saved work. Backups and explicit replacement protect the last valid workspace.",
  ],
] as const;

export default function CaseStudy() {
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
                <h1 id="hero-h">
                  Case study: a product tour builder with a 17.7&nbsp;kB runtime
                </h1>
                <p className="hero__lead">
                  A self-initiated ConsoleLog Studio project: guide new users
                  through a SaaS product without an account system, tracking or
                  a second framework on the host page.
                </p>
                <div className="btn-row">
                  <a className="btn btn--primary" href="/builder/">
                    {MAIN_ACTION}
                    <Arrow />
                  </a>
                  <a className="btn btn--secondary" href="/demo/">
                    See a live tour
                  </a>
                </div>
              </div>
              <dl className="hero__facts">
                <div>
                  <dt>Runtime with Brotli</dt>
                  <dd>{kB(size.brotliBytes)}</dd>
                </div>
                <div>
                  <dt>Steps per tour</dt>
                  <dd>1 to 10</dd>
                </div>
                <div>
                  <dt>Drafts in IndexedDB</dt>
                  <dd>Up to 50</dd>
                </div>
                <div>
                  <dt>Accounts and tracking</dt>
                  <dd>None</dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

        <section className="section" id="preview" aria-labelledby="preview-h">
          <div className="wrap">
            <div className="grid">
              <h2 id="preview-h" className="span-6">
                The tour a first-time visitor sees
              </h2>
              <p className="span-6 start-7">
                The sample workspace below runs the real runtime with the
                example tour. Use Next, Back or Escape, or close it and replay
                it from the live demo.
              </p>
            </div>
            <div className="ui app app--single frame fill">
              <div className="app__pane app__pane--open">
                <Preview hero bare />
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="story" aria-labelledby="story-h">
          <div className="wrap">
            <div className="grid">
              <div className="span-6 stack-4">
                <h2 id="story-h">An editor, a runtime and a sample app</h2>
                <p>
                  A useful product can still feel unfamiliar. MicroOnboard gives
                  its owner a focused way to write the first few hints.
                </p>
              </div>
              <div className="span-6 start-7 stack-6">
                <p>
                  The deliverable is a working editor, an independent TypeScript
                  runtime and a sample workspace where visitors can try both
                  sides. The builder keeps up to 50 drafts in IndexedDB; each
                  tour has 1 to 10 steps and exports as portable JSON.
                </p>
                <ol className="rows">
                  {workflow.map(([name, line], index) => (
                    <li key={name}>
                      <span className="rows__name">
                        {index + 1}. {name}
                      </span>
                      <p>{line}</p>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="details" aria-labelledby="details-h">
          <div className="wrap">
            <div className="grid">
              <div className="span-6 stack-4">
                <h2 id="details-h">Decisions in the runtime</h2>
                <p>
                  Runtime {size.runtimeVersion} measures {kB(size.bytes)}{" "}
                  minified, {kB(size.gzipBytes)} with gzip and{" "}
                  {kB(size.brotliBytes)} with Brotli, validation and positioning
                  included. No activation or conversion gain is claimed.
                </p>
                <a
                  className="link"
                  href={`${SOURCE}/blob/main/docs/acceptance.md`}
                >
                  Read the verification evidence
                </a>
              </div>
              <div className="faq span-6 start-7">
                {decisions.map(([question, answer]) => (
                  <div className="faq__item" key={question}>
                    <h3>{question}</h3>
                    <p>{answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="privacy" aria-labelledby="privacy-h">
          <div className="wrap">
            <div className="grid">
              <div className="span-6 stack-4">
                <h2 id="privacy-h">Privacy and scope</h2>
                <p>
                  Your tours stay in your browser, and the first release does
                  one page well.
                </p>
                <a className="link" href="https://consolelog.studio/">
                  Contact ConsoleLog Studio
                </a>
              </div>
              <div className="faq span-6 start-7">
                <div className="faq__item">
                  <h3>What is stored</h3>
                  <p>
                    No accounts, analytics, session replay or content uploads.
                    Drafts live in this browser, and clearing its storage can
                    remove them, so export backups of anything you want to keep.
                  </p>
                </div>
                <div className="faq__item">
                  <h3>What the runtime sends</h3>
                  <p>
                    Nothing. The host downloads the runtime file and supplies
                    its own configuration. Author mode exports only stable
                    selectors and the text the author enters.
                  </p>
                </div>
                <div className="faq__item">
                  <h3>What is out of scope</h3>
                  <p>
                    One page per tour, on sites where the owner installs it. It
                    does not inspect other websites, reach into shadow roots or
                    iframes, run tours across pages or sync completion across
                    devices.
                  </p>
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
