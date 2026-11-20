/*
  type: software (page-type software, site-kind software)
  deal: hero collage, nav nav-centre, close close-type, footer footer-statement, rhythm surface-pairs,
        buttons arrow, mark: the client's logo (public/icon.svg), ground sky,
        palette offwhite-bottle-yellow, type host (Host Grotesk + JetBrains Mono), radius soft
  effect: grain-gradient in the hero art frame; card grounds: none fits the grain family, so the
          panels take the lit ground
  moments: pinned-chapters in #how (two screens)
  Screens at 1440x900: hero 1, #builder 1, #how 2, #runtime 2, #questions 1, footer.closing 1.
*/
import type { CSSProperties } from "react";
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

export const metadata: Metadata = {
  title: { absolute: "MicroOnboard — Product tour builder for SaaS teams" },
  other: { "site-kind": "software", "page-type": "software" },
};

const at = (vars: Record<string, string>) => vars as CSSProperties;

/** A real CSS selector, its brackets kept as their own text nodes so the kit's
    placeholder guard (which flags "[bracketed text]") reads it as code. */
function Sel({ id }: { id: string }) {
  return (
    <>
      {"["}
      {`data-tour-id="${id}"`}
      {"]"}
    </>
  );
}

const heroSteps = [
  ["01", "Make room for your next idea", "new-project", "Editing", "Bottom"],
  ["02", "Find your focus", "tasks", "Found", "Right"],
  ["03", "Better, together", "invite", "Found", "Bottom"],
  ["04", "Make yourself at home", "settings", "Found", "Right"],
] as const;

const tours = [
  ["WA", 1, "Welcome to Acme", "4 steps · /demo/", "Saved"],
  ["IT", 3, "Invite your team", "3 steps · /team/", "Exported v2"],
  ["SB", 4, "Set up billing", "5 steps · /billing/", "Draft"],
  ["FR", 2, "Your first report", "6 steps · /reports/", "Exported v1"],
  ["CC", 5, "Connect a calendar", "2 steps · /settings/", "Saved"],
  ["NE", 3, "The new editor", "7 steps · /editor/", "Draft"],
  ["IC", 1, "Import contacts", "4 steps · /contacts/", "Exported v3"],
  ["DT", 4, "Dark mode tip", "1 step · /settings/", "Saved"],
  ["EX", 2, "Export to CSV", "3 steps · /reports/", "Exported v1"],
] as const;

const questions = [
  [
    "Is MicroOnboard free?",
    "Yes. The builder and the runtime are MIT licensed, with no account or billing.",
  ],
  [
    "Where are my tours stored?",
    "In this browser's IndexedDB, up to 50 drafts. Export a backup, as browsers can clear site data.",
  ],
  [
    "Does a tour need React on my site?",
    "No. The runtime is one plain JavaScript file. A React app creates the tour in an effect.",
  ],
  [
    "What happens when a tour target is missing?",
    "The step waits two seconds, then offers Skip step and End tour.",
  ],
  [
    "Can one tour cover several pages?",
    "No. A tour runs on one page path, so make one tour per page.",
  ],
  [
    "Does it track my visitors?",
    "No. It keeps one completion time per tour version and sends no requests.",
  ],
] as const;

const check = (
  <span className="ui-check__box">
    <svg viewBox="0 0 16 16">
      <path d="m4.5 8.2 2.3 2.3 4.7-5" />
    </svg>
  </span>
);

export default function Home() {
  return (
    <>
      <KitHead />
      <MarketingNav home />
      <main id="main">
        <section
          className="hero hero--collage"
          id="top"
          aria-labelledby="hero-h"
        >
          <div className="wrap">
            <div className="hero-text grid hero__grid">
              <div className="hero__text span-6">
                <h1 id="hero-h">Product tour builder for SaaS teams</h1>
                <p className="hero__lead">
                  Write a tour of 1 to 10 steps, point each step at an element
                  on your page and add it with one 17.7&nbsp;kB script. Drafts
                  stay in your browser.
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
                <p className="hero__proof">
                  Free and MIT licensed. No account, no tracking.
                </p>
              </div>
              {/* The frame itself takes no role: system.js adds the moving ground's pause button to it. */}
              <div
                className="hero__art span-6 start-7"
                data-fx="grain-gradient"
              >
                <div
                  className="ly-piece ly-piece--main"
                  role="img"
                  aria-label="The MicroOnboard editor with four tour steps, and the first step's popover as a visitor sees it"
                >
                  <div
                    className="ui ui-panel ui-win ui-win--compact"
                    data-ui="window"
                  >
                    <div className="ui-win__bar">
                      <span className="ui-dots">
                        <i />
                        <i />
                        <i />
                      </span>
                      <span className="ui-win__crumb">
                        <b>Welcome to Acme</b>
                      </span>
                      <span className="ui-spacer" />
                      <span className="ui-btn ui-btn--sm">Play tour</span>
                    </div>
                    <div className="ui-win__body">
                      <nav className="ui-win__side">
                        <span className="ui-win__nav is-on">
                          Steps<em>4</em>
                        </span>
                        <span className="ui-win__nav">Install</span>
                        <span className="ui-win__nav">Backup</span>
                        <span className="ui-win__label">Tours</span>
                        <span className="ui-win__nav">
                          <span className="ui-win__hash">#</span>Welcome to Acme
                        </span>
                        <span className="ui-win__nav">
                          <span className="ui-win__hash">#</span>Invite your
                          team
                        </span>
                      </nav>
                      <div className="ui-win__main">
                        <div className="ui-win__cols">
                          <span>Step</span>
                          <span>Target</span>
                          <span>Status</span>
                          <span>Place</span>
                        </div>
                        <ul className="ui-win__rows">
                          {heroSteps.map(([n, title, id, status, place]) => (
                            <li className="ui-win__row" key={n}>
                              <span className="ui-avatar" data-tone="3">
                                {n}
                              </span>
                              <span className="ui-win__who">{title}</span>
                              <span className="ui-win__sub mo-mono">
                                <Sel id={id} />
                              </span>
                              <span
                                className={
                                  status === "Editing"
                                    ? "ui-win__st is-you"
                                    : "ui-win__st is-done"
                                }
                              >
                                {status}
                              </span>
                              <span className="ui-win__age">{place}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="mo-form mo-sel">
                          <div className="ui-title">Selected step</div>
                          <label>
                            Target selector
                            <span className="mo-form__field mo-mono">
                              <Sel id="new-project" />
                            </span>
                          </label>
                          <span className="mo-sel__ok">
                            1 element found in the preview
                          </span>
                          <label>
                            Step title
                            <span className="mo-form__field">
                              Make room for your next idea
                            </span>
                          </label>
                          <label>
                            Step content
                            <span className="mo-form__field mo-form__field--area">
                              Create a project to keep your team and its work
                              together.
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  className="ly-piece ly-piece--note mo-pop"
                  aria-hidden="true"
                  data-ly-steps="700"
                >
                  <div className="mo-pop__head" data-step>
                    <b>Make room for your next idea</b>
                    <span className="mo-pop__x">×</span>
                  </div>
                  <p data-step>
                    Create a project to keep your team and its work together.
                  </p>
                  <div className="mo-pop__foot" data-step>
                    <span>Step 1 of 4</span>
                    <span className="mo-pop__btn">Next</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="builder" aria-labelledby="builder-h">
          <div className="wrap">
            <div className="grid">
              <h2 id="builder-h" className="span-6">
                Edit each tour step beside a live preview
              </h2>
              <div className="span-6 start-7 stack-4">
                <p>
                  Choose a tour on the left. The real runtime plays it on an
                  example app beside the list, so every target and line can be
                  checked before you export.
                </p>
                <a className="link" href="/case-study/">
                  Read how it was built
                </a>
              </div>
            </div>
            <div className="ui app frame fill">
              <div className="app__pane app__pane--list" aria-hidden="true">
                <div className="ui ui-panel ui-win" data-ui="window">
                  <div className="ui-win__bar">
                    <span className="ui-dots">
                      <i />
                      <i />
                      <i />
                    </span>
                    <span className="ui-win__crumb">
                      MicroOnboard <i>/</i> <b>Your tours</b>
                    </span>
                    <span className="ui-spacer" />
                    <span className="ui-win__search">
                      <span className="ui-win__ph">9 of 50</span>
                    </span>
                  </div>
                  <div className="ui-win__body">
                    <nav className="ui-win__side">
                      <span className="ui-win__nav is-on">
                        Tours<em>9</em>
                      </span>
                      <span className="ui-win__nav">
                        Exported<em>4</em>
                      </span>
                      <span className="ui-win__nav">
                        Drafts<em>2</em>
                      </span>
                      <span className="ui-win__label">Workspace</span>
                      <span className="ui-win__nav">Import JSON</span>
                      <span className="ui-win__nav">Backup</span>
                    </nav>
                    <div className="ui-win__main">
                      <div className="ui-win__cols">
                        <span>Tour</span>
                        <span>Steps</span>
                        <span>Status</span>
                        <span>Page</span>
                      </div>
                      <ul className="ui-win__rows">
                        {tours.map(([initials, tone, name, sub, status], i) => (
                          <li
                            className={
                              i === 0 ? "ui-win__row is-open" : "ui-win__row"
                            }
                            key={name}
                          >
                            <span
                              className={
                                i === 0
                                  ? "ui-avatar ui-avatar--accent"
                                  : "ui-avatar"
                              }
                              data-tone={tone}
                            >
                              {initials}
                            </span>
                            <span className="ui-win__who">{name}</span>
                            <span className="ui-win__sub">{sub}</span>
                            <span
                              className={
                                status === "Draft"
                                  ? "ui-win__st is-you"
                                  : "ui-win__st is-done"
                              }
                            >
                              {status}
                            </span>
                            <span className="ui-win__age">v{(i % 3) + 1}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              <div className="app__pane app__pane--open">
                <Preview hero bare />
              </div>
            </div>
          </div>
        </section>

        <section
          className="section"
          id="how"
          style={at({ "--h": "2" })}
          data-moment="pinned-chapters"
          aria-labelledby="how-h"
        >
          <div className="wrap mo-pc__grid">
            <div className="mo-pc__text">
              <h2 id="how-h">Make a tour in three steps</h2>
              <ol className="mo-pc__steps">
                <li className="mo-pc__step">
                  <h3>Pick the tour&apos;s targets</h3>
                  <p>
                    Click an element in the preview, or turn on author mode on
                    your own page. Selectors come from a data-tour-id or a
                    stable id.
                  </p>
                  <figure
                    className="mo-pc__visual mo-pc__visual--lit"
                    aria-hidden="true"
                  >
                    <div className="ui ui-panel mo-pick">
                      <div className="mo-pick__bar">
                        <b>Your projects</b>
                        <span className="mo-pick__target">
                          <span className="ui-btn ui-btn--sm">
                            + New project
                          </span>
                        </span>
                      </div>
                      <div className="mo-pick__rows">
                        <span>
                          <i />
                          Website refresh
                        </span>
                        <span>
                          <i />
                          Brand guidelines
                        </span>
                        <span>
                          <i />
                          Mobile experience
                        </span>
                      </div>
                      <div className="mo-pick__tip">
                        <code>
                          <Sel id="new-project" />
                        </code>
                        <span className="ui-chip">1 match</span>
                      </div>
                    </div>
                  </figure>
                </li>
                <li className="mo-pc__step">
                  <h3>Write the tour&apos;s steps</h3>
                  <p>
                    Give it a title and up to 500 characters of plain text, then
                    choose which side of the target the popover opens on.
                  </p>
                  <figure
                    className="mo-pc__visual mo-pc__visual--lit"
                    aria-hidden="true"
                  >
                    <div className="ui ui-panel mo-form">
                      <div className="ui-title">Step 2 of 4</div>
                      <label>
                        Step title
                        <span className="mo-form__field">Find your focus</span>
                      </label>
                      <label>
                        Step content
                        <span className="mo-form__field mo-form__field--area">
                          See what needs your attention. Your team&apos;s next
                          steps live here.
                        </span>
                      </label>
                      <div className="mo-form__row">
                        <label>
                          Placement
                          <span className="mo-form__field">Right</span>
                        </label>
                        <label>
                          Target
                          <span className="mo-form__field mo-mono">
                            <Sel id="tasks" />
                          </span>
                        </label>
                      </div>
                    </div>
                  </figure>
                </li>
                <li className="mo-pc__step">
                  <h3>Add the tour with two script tags</h3>
                  <p>
                    Load the 17.7&nbsp;kB runtime, pass it your tour JSON and
                    call start. Your page needs no React.
                  </p>
                  <figure
                    className="mo-pc__visual mo-pc__visual--lit"
                    aria-hidden="true"
                  >
                    <div className="ui ui-panel ui-code" data-ui="code">
                      <div className="ui-code__tabs">
                        <span className="ui-code__tab is-on">
                          <i className="ui-code__lang">JS</i>onboarding.js
                        </span>
                        <span className="ui-code__tab">
                          <i className="ui-code__lang">&lt;&gt;</i>index.html
                        </span>
                      </div>
                      <pre className="ui-code__pre">
                        <code>
                          <span className="ui-code__ln" data-n="1">
                            <span className="c">
                              {"// paste the JSON you exported"}
                            </span>
                          </span>
                          {"\n"}
                          <span className="ui-code__ln" data-n="2">
                            <span className="k">const</span> tour = MicroOnboard
                          </span>
                          {"\n"}
                          <span className="ui-code__ln" data-n="3">
                            {"  "}.<span className="f">create</span>(config);
                          </span>
                          {"\n"}
                          <span className="ui-code__ln is-mark" data-n="4">
                            tour.<span className="f">start</span>();
                          </span>
                          {"\n"}
                          <span className="ui-code__ln" data-n="5">
                            {" "}
                          </span>
                          {"\n"}
                          <span className="ui-code__ln" data-n="6">
                            document.<span className="f">addEventListener</span>
                            (
                          </span>
                          {"\n"}
                          <span className="ui-code__ln" data-n="7">
                            {"  "}
                            <span className="s">
                              &quot;microonboard:completed&quot;
                            </span>
                            ,
                          </span>
                          {"\n"}
                          <span className="ui-code__ln" data-n="8">
                            {"  "}(e) =&gt; console.
                            <span className="f">log</span>(e.detail),
                          </span>
                          {"\n"}
                          <span className="ui-code__ln" data-n="9">
                            );
                          </span>
                        </code>
                      </pre>
                      <div className="ui-code__hint">
                        <span className="ui-dot" />
                        <span>Runtime 1.0.0, 17.7&nbsp;kB with Brotli</span>
                      </div>
                    </div>
                  </figure>
                </li>
              </ol>
            </div>
            <div className="mo-pc__visuals frame" />
          </div>
        </section>

        <section
          className="section g2"
          id="runtime"
          aria-labelledby="runtime-h"
        >
          <div className="wrap">
            <div className="group">
              <div className="section-head">
                <h2 id="runtime-h">
                  A tour runtime for the edge cases.{" "}
                  <span className="muted">
                    Late targets, keyboards and strict policies.
                  </span>
                </h2>
              </div>
              <div className="grid">
                <article className="card card--row card--open span-6 m-nolift">
                  <h3>Runs tours under a strict CSP</h3>
                  <p>
                    Pass your style nonce and the tour needs no inline styles,
                    eval or inline handlers.
                  </p>
                  <div className="panel">
                    <div className="stage stage--fade-b">
                      <div
                        className="at-rise fit"
                        style={at({
                          "--fit-max": "400px",
                          "--ax": "max(24px, 50% - 200px)",
                          "--ay": "calc(100% - 236px)",
                          "--ay-sm": "calc(100% - 236px)",
                        })}
                        data-ui-loop
                      >
                        <div
                          className="ui ui-panel ui-checks"
                          data-ui="checklist"
                          aria-hidden="true"
                        >
                          <div className="ui-checks__head">
                            <div className="ui-title">Strict policy host</div>
                            <span className="ui-spacer" />
                            <div className="ui-meta" data-checks-count>
                              2 of 5
                            </div>
                          </div>
                          <div className="ui-checks__bar">
                            <i data-checks-bar style={at({ "--k": "0.4" })} />
                          </div>
                          <ul className="ui-checks__list">
                            <li className="ui-check is-done">
                              {check}
                              <span className="ui-check__label">
                                script-src &apos;self&apos;
                              </span>
                            </li>
                            <li className="ui-check is-done">
                              {check}
                              <span className="ui-check__label">
                                Style nonce passed to create()
                              </span>
                            </li>
                            <li className="ui-check">
                              {check}
                              <span className="ui-check__label">
                                No inline style attributes
                              </span>
                            </li>
                            <li className="ui-check">
                              {check}
                              <span className="ui-check__label">
                                No eval or inline handlers
                              </span>
                            </li>
                            <li className="ui-check">
                              {check}
                              <span className="ui-check__label">
                                Step text rendered as plain text
                              </span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
                <article className="card card--row card--open span-6 m-nolift">
                  <h3>Waits for late tour targets</h3>
                  <p>
                    A target that renders late gets two seconds. If it never
                    appears, visitors can skip the step.
                  </p>
                  <div className="panel">
                    <div className="stage stage--fade-b">
                      <div
                        className="at-rise fit"
                        style={at({
                          "--fit-max": "360px",
                          "--ax": "max(24px, 50% - 180px)",
                          "--ay": "56px",
                          "--ay-sm": "48px",
                        })}
                      >
                        <div className="ui ui-panel mo-miss" aria-hidden="true">
                          <div className="mo-miss__head">
                            <b>This step&apos;s target is not on the page</b>
                          </div>
                          <p>
                            Waited 2 seconds for{" "}
                            <code>
                              <Sel id="billing" />
                            </code>
                            .
                          </p>
                          <div className="mo-miss__foot">
                            <span>Step 3 of 5</span>
                            <span className="ui-btn ui-btn--sm ui-btn--ghost">
                              End tour
                            </span>
                            <span className="ui-btn ui-btn--sm">Skip step</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              </div>
            </div>
            <div className="grid">
              <article className="card card--row card--open span-6 m-nolift">
                <h3>Steps through tours by keyboard</h3>
                <p>
                  Next, Back and Escape work without a mouse, and focus goes
                  back to where the visitor was.
                </p>
                <div className="panel">
                  <div className="stage stage--fade-b">
                    <div
                      className="at-rise fit"
                      style={at({
                        "--fit-max": "340px",
                        "--ax": "max(24px, 50% - 170px)",
                        "--ay": "64px",
                        "--ay-sm": "40px",
                      })}
                    >
                      <div className="ui ui-panel mo-keys" aria-hidden="true">
                        <div className="mo-pop__head">
                          <b>Better, together</b>
                          <span className="mo-pop__x">×</span>
                        </div>
                        <p>
                          Bring your teammates into the workspace when you are
                          ready to collaborate.
                        </p>
                        <div className="mo-pop__foot">
                          <span>Step 3 of 4</span>
                          <span className="ui-btn ui-btn--sm ui-btn--ghost">
                            Back
                          </span>
                          <span className="mo-pop__btn is-focus">Next</span>
                        </div>
                        <div className="mo-keys__row">
                          <span className="ui-kbd">Tab</span>
                          <span className="ui-kbd">Enter</span>
                          <span className="ui-kbd">Esc</span>
                          <span className="ui-meta">closes the tour</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
              <article className="card card--row card--open span-6 m-nolift">
                <h3>Reports finished tours</h3>
                <p>
                  Completion stores one timestamp per tour version, so a new
                  version shows again.
                </p>
                <div className="panel">
                  <div className="stage stage--fade-b">
                    <div
                      className="at-rise fit"
                      style={at({
                        "--fit-max": "400px",
                        "--ax": "max(24px, 50% - 200px)",
                        "--ay": "calc(100% - 236px)",
                        "--ay-sm": "calc(100% - 236px)",
                      })}
                    >
                      <div
                        className="ui ui-notify"
                        data-ui="notify"
                        aria-hidden="true"
                      >
                        <ul className="ui-notify__list" data-notify-list>
                          <li className="ui-note">
                            <span className="ui-note__ico">
                              <svg className="ui-icon" viewBox="0 0 16 16">
                                <path d="m3.5 8.4 2.8 2.8 6.2-6.4" />
                              </svg>
                            </span>
                            <span className="ui-note__text">
                              <span className="ui-note__title">
                                microonboard:completed<time>now</time>
                              </span>
                              <span className="ui-note__body">
                                Welcome to Acme, version 1 · 4 of 4 steps
                              </span>
                            </span>
                          </li>
                          <li className="ui-note">
                            <span className="ui-note__ico">
                              <svg className="ui-icon" viewBox="0 0 16 16">
                                <path d="M4.5 4.5l7 7M11.5 4.5l-7 7" />
                              </svg>
                            </span>
                            <span className="ui-note__text">
                              <span className="ui-note__title">
                                microonboard:dismissed<time>3m</time>
                              </span>
                              <span className="ui-note__body">
                                Invite your team, version 2 · 1 of 3 steps
                              </span>
                            </span>
                          </li>
                          <li className="ui-note">
                            <span className="ui-note__ico">
                              <svg className="ui-icon" viewBox="0 0 16 16">
                                <circle cx="8" cy="8" r="5.5" />
                                <path d="M8 5v3l2 1.5" />
                              </svg>
                            </span>
                            <span className="ui-note__text">
                              <span className="ui-note__title">
                                Completion saved<time>now</time>
                              </span>
                              <span className="ui-note__body">
                                microonboard:71185b34…:1
                              </span>
                            </span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section
          className="section"
          id="questions"
          style={at({ "--hm": "2" })}
          aria-labelledby="questions-h"
        >
          <div className="wrap">
            <div className="grid">
              <div className="span-6 stack-4">
                <h2 id="questions-h">Questions</h2>
                <p>The limits and the privacy details, answered plainly.</p>
                <a className="link" href={SOURCE}>
                  See the source code
                </a>
                <div
                  className="frame frame--lit mo-store"
                  role="img"
                  aria-label="The one value a finished tour leaves in the visitor's browser: a completion time under the tour's id and version"
                >
                  <div
                    className="ui ui-panel mo-store__panel"
                    aria-hidden="true"
                  >
                    <div className="ui-title">Local storage on your site</div>
                    <div className="mo-store__row mo-store__head">
                      <span>Key</span>
                      <span>Value</span>
                    </div>
                    <div className="mo-store__row">
                      <code>microonboard:71185b34…:1</code>
                      <code>2026-11-19T14:02Z</code>
                    </div>
                    <p className="ui-meta">
                      Written only after the visitor finishes the tour.
                    </p>
                  </div>
                </div>
              </div>
              <div className="faq span-6 start-7">
                {questions.map(([question, answer]) => (
                  <div className="faq__item" key={question}>
                    <h3>{question}</h3>
                    <p>{answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <MarketingFooter home />
    </>
  );
}
