# MicroOnboard

**A better first five minutes.** A local-first product-tour builder and independent, accessible embed runtime. A self-initiated portfolio project by [ConsoleLog Studio](https://consolelog.studio/).

- **Live app:** https://microonboard.pages.dev
- **Repository:** https://github.com/shawalkabirchy/microonboard
- **Verification:** [acceptance matrix](docs/acceptance.md)
- **Integration:** [host installation and lifecycle](docs/integration.md)
- **Portfolio:** [walkthrough script and LinkedIn drafts](docs/portfolio.md), [screenshots](docs/screenshots/)

## Run locally

Use Node **24.14.0** and npm **11.14.1**. Exact application versions are recorded in `package.json` and `package-lock.json` (Next.js 16.4.3, React 19.3.1, Tailwind 4.3.3 at initial implementation).

```sh
npm ci
npm run build:embed
npm run dev
```

Open http://127.0.0.1:3000. The editor starts with an **unsaved** example only in a brand-new workspace. Click **Save tour** to persist it. **Load sample tour** is explicit for an existing workspace and does not replace other drafts. Delete a draft only through its confirmation dialog; export a workspace backup before resetting your data.

```sh
npm run check          # lint, TypeScript, and contract/persistence tests
npm run build          # checks + standalone embed + static Next.js export
npm run preview        # serve out/ at http://127.0.0.1:4173
npx playwright install chromium firefox webkit
npm run test:e2e       # exported app, plain host, CSP host; Edge if installed
```

The build uses Next.js's supported `--webpack` option because the Turbopack PostCSS worker failed to connect on the reference Windows environment. It does not need a runtime server or a Cloudflare account locally. Playwright uses the static server, not `next dev`. A production remote smoke test can set `TEST_BASE_URL` before running selected browser tests.

## What ships

- A landing page, three-column tour builder, interactive Acme project workspace, and case study.
- Up to **50 drafts**, each with **1–10 steps**. Titles, plain-text content, stable selectors, ordering, placement, page path, and primary color are editable.
- IndexedDB saves with atomic revision checks. Failed writes, stale tabs, and invalid imports preserve the last committed workspace.
- Portable tour JSON, immutable export-version snapshots, and validated workspace backups. Full workspace import replaces rather than merges, after confirmation.
- A vanilla TypeScript runtime under `/embed/1.0.0/microonboard.min.js`. It includes Zod Mini and Floating UI; no React, Next.js, editor, or idb code is included.
- Host-enabled visual picking, keyboard support, runtime cleanup, nonce-compatible styles, and explicit missing-target behavior.

## Local data and privacy

There is no account, backend, analytics, tracking, or content-upload endpoint. Drafts stay in this browser profile. Storage can be cleared or evicted: **export backups** for important work. The runtime stores only a completion timestamp for a tour/version on its host origin; blocked storage falls back to page-session memory and emits an event.

In the builder, manually changed selectors are checked against the included preview. For another host page, enable the installed author mode there, pick its targets, export JSON, and import it into the builder. Content can be edited locally; the example preview cannot inspect or verify a different website.

Recovery downloads preserve pending text but are labelled **recovery only** and need manual recovery; validated workspace backups are directly importable. Save/export never displays success before the IndexedDB transaction commits.

## Deployment

Cloudflare Pages **Git integration**, production branch `main`, repository root, build command `npm run build`, output directory `out`, Node `24.14.0`, npm `11.14.1`. No Pages Functions, database, paid resources, or application secrets are needed. Preview branches are enabled and analytics remain disabled. [Deployment and rollback](docs/deployment.md).

GitHub Actions independently runs the checked build and browser suite. On later changes, wait for validation before merging to `main`; Pages Git integration deploys a pushed `main` independently of Actions.

## Limits and troubleshooting

- Single-page tours on owner-controlled sites; exact pathname matching, including trailing slash. No iframe/shadow-root targets, cross-page orchestration, segmentation, webhooks, cloud sync, or billing.
- Completion belongs to a browser profile, not the host's signed-in user. Explicitly reset it when your integration needs that behavior.
- `CONFIG_INVALID`: inspect the field path; use schema v1, unique step IDs, valid CSS selectors, and JSON at most 64 KiB. Static JSON Schema cannot express every runtime check.
- Missing/hidden/ambiguous targets wait up to two seconds, then offer Skip/End. Any unresolved skipped step prevents completion.
- `STALE_LOCAL_STATE`: download pending work, then reload the saved workspace. Closing a tab does not resolve the conflict by overwriting it.
- Storage unavailable/full: keep the page open and download a backup or recovery copy. The app does not silently claim volatile data is saved.
- A strict style policy must permit the nonce supplied by your host. The fixed nonce in the strict example is a test fixture, not a production nonce generator.
- Preserve old published embed assets. Make a new runtime version path for later releases; tour content versions are independent of runtime versions.

The embed build measures minified, gzip, and Brotli byte counts in `/embed/1.0.0/size.json`. No activation, conversion, or customer outcome claims are made. See the acceptance matrix for measured browser coverage and outstanding limitations.

## Licence

MIT © 2026 Shawal Kabir Chy / ConsoleLog Studio. Third-party code retains its own notices; see `public/third-party-notices.txt`. The shadcn components are adapted from the official MIT-licensed registry. No paid asset pack, remote font, or hosted processing service is required.
