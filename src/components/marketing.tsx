import { KitScripts } from "@/components/kit-scripts";

export const SOURCE = "https://github.com/shawalkabirchy/microonboard";
export const INTEGRATION = `${SOURCE}/blob/main/docs/integration.md`;
export const MAIN_ACTION = "Try the builder";

// The kit's stylesheets in starter.html order, then the site's own page CSS
// (tokens dealt by start.mjs and the few rules that sit inside visuals).
const STYLES = [
  "/assets/system.css",
  "/assets/ui/cards.css",
  "/assets/motion/motion.css",
  "/assets/backgrounds/backgrounds.css",
  "/assets/layout/layout.css",
  "/assets/ui/base.css",
  "/assets/ui/window/fragment.css",
  "/assets/ui/checklist/fragment.css",
  "/assets/ui/notify/fragment.css",
  "/assets/ui/code/fragment.css",
  "/site/marketing.css",
];

export function KitHead() {
  return (
    <>
      {STYLES.map((href) => (
        <link key={href} rel="stylesheet" href={href} precedence="kit" />
      ))}
      <KitScripts />
    </>
  );
}

export function Arrow() {
  return (
    <svg className="m-arrow" viewBox="0 0 12 12" aria-hidden="true">
      <path className="m-arrow__stem" d="M1 6h8" />
      <path className="m-arrow__head" d="M4.5 2.5 8 6l-3.5 3.5" />
    </svg>
  );
}

function Logo({ href }: { href: string }) {
  return (
    <a className="nav__logo" href={href}>
      {/* eslint-disable-next-line @next/next/no-img-element -- A static SVG mark; next/image adds nothing here. */}
      <img src="/icon.svg" alt="" width={24} height={24} />
      MicroOnboard
    </a>
  );
}

const NAV = [
  { id: "builder", label: "Builder" },
  { id: "how", label: "Steps" },
  { id: "runtime", label: "Runtime" },
  { id: "questions", label: "Questions" },
];

/** nav-centre: the logo on the left line, four words on the page axis, the main action on the right line. */
export function MarketingNav({ home = false }: { home?: boolean }) {
  const base = home ? "" : "/";
  return (
    <header className="nav nav--centre">
      <div className="wrap nav__bar">
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <Logo href={home ? "#top" : "/"} />
        <nav className="nav__links" aria-label="Main">
          {NAV.map((item) => (
            <div className="nav__item" key={item.id}>
              <a className="nav__link" href={`${base}#${item.id}`}>
                {item.label}
              </a>
            </div>
          ))}
        </nav>
        <div className="nav__actions">
          <a className="btn btn--primary" href="/builder/">
            {MAIN_ACTION}
            <Arrow />
          </a>
        </div>
        <button
          className="nav__toggle"
          type="button"
          aria-expanded="false"
          aria-label="Menu"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <path
              d="M2 5h14M2 13h14"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    </header>
  );
}

/** footer.closing: the close-type (the h2, one line, the big button) and the footer-statement links. */
export function MarketingFooter({ home = false }: { home?: boolean }) {
  const base = home ? "" : "/";
  return (
    <footer
      className="footer closing footer--statement g2m"
      id="contact"
      aria-labelledby="close-h"
    >
      <div className="wrap">
        <div className="closing__cta close--type">
          <div className="section-head">
            <h2 id="close-h">Write your first product tour today</h2>
            <p>Free, with no account. Drafts stay in your browser.</p>
          </div>
          <a className="btn btn--primary btn--xl btn--wide" href="/builder/">
            {MAIN_ACTION}
            <Arrow />
          </a>
        </div>
        <div className="closing__links">
          <div className="grid">
            <div className="span-4 stack-4">
              <Logo href={home ? "#top" : "/"} />
              <p className="footer__lede">A better first five minutes.</p>
            </div>
            <div className="span-2 footer__col">
              <h4>Product</h4>
              <ul>
                <li>
                  <a href={`${base}#builder`}>Builder</a>
                </li>
                <li>
                  <a href="/demo/">Live demo</a>
                </li>
              </ul>
            </div>
            <div className="span-2 footer__col">
              <h4>Learn</h4>
              <ul>
                <li>
                  <a href={`${base}#how`}>Steps</a>
                </li>
                <li>
                  <a href="/case-study/">Case study</a>
                </li>
              </ul>
            </div>
            <div className="span-2 footer__col">
              <h4>Runtime</h4>
              <ul>
                <li>
                  <a href={INTEGRATION}>Integration guide</a>
                </li>
                <li>
                  <a href="/embed/1.0.0/tour.schema.json">Tour JSON schema</a>
                </li>
                <li>
                  <a href="/embed/1.0.0/microonboard.min.js">Runtime file</a>
                </li>
              </ul>
            </div>
            <div className="span-2 footer__col">
              <h4>Project</h4>
              <ul>
                <li>
                  <a href={SOURCE}>Source code</a>
                </li>
                <li>
                  <a href="/case-study/#privacy">Privacy</a>
                </li>
                <li>
                  <a href="/third-party-notices.txt">Notices</a>
                </li>
              </ul>
            </div>
          </div>
          <div className="footer__legal">
            <span>
              &copy; 2026 MicroOnboard &nbsp;{" "}
              <a href="/case-study/#privacy">Privacy</a>
            </span>
            <div className="socials" />
            <span>
              A self-initiated project by{" "}
              <a href="https://consolelog.studio/">ConsoleLog Studio</a>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
