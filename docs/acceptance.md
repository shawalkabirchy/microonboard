# Acceptance evidence

Verification date: **27 October 2026**. Tests exercise the checked static export in `out/`, the independent browser script, and real IndexedDB. They do not use a mock application server or upload user content.

## Environment and commands

Reference machine: Windows x64 10.0.26200, Intel Core i7-1355U, 12 logical processors, 16 GiB RAM. Node 24.14.0, npm 11.14.1. The lockfile fixes dependency versions.

```powershell
$env:NEXT_TELEMETRY_DISABLED='1'
npm run build
npm run preview
$env:TEST_BASE_URL='http://127.0.0.1:4173'
npx playwright test
# Final regression after touch positioning and focus-fixture corrections:
npx playwright test -g 'P09-|blocked IndexedDB|unsaved navigation'
```

`npm run build` runs ESLint, TypeScript, five unit/contract tests, the independent embed build, JSON Schema and licence generation, then the Next.js static export. The embed build asserts that React, Next.js and idb are absent from its dependency graph.

| Browser | Actual tested version | Coverage |
|---|---|---|
| Bundled Chromium | 156.0.8078.4 | Exported application, runtime, keyboard, emulated phone, automated accessibility |
| Bundled Firefox | 157.0 | Same coverage |
| Bundled WebKit | 27.2 | Same coverage; this is not a branded Safari installation |
| Installed Microsoft Edge | 156.0.4314.42 | Same coverage, actual Edge channel |
| Branded Google Chrome | Not run | Chromium engine coverage above |
| Actual Safari / iOS Safari | Not run | Unavailable on the Windows reference machine |

All **92 unique browser cases** now have passing latest results: **23 per browser**. The final regression passed **52/52**, including every runtime case, storage failures, keyboard restoration and touch controls. The initial complete matrix passed 86/88 browser cases. The IndexedDB failure fixture was corrected to use `IDBFactory.prototype`. Focus-restoration tests now use keyboard activation to establish the prior focus consistently across engines. The first targeted run exposed actual WebKit touch overflow on a side-positioned tooltip. Enabling Floating UI cross-axis shifting fixed that behavior; the final regression covers every runtime case plus touch bounds and announced step progress. [Machine-readable runs and latest check results](verification/browser-results.json) preserve the initial run and subsequent verification rather than hiding its failures.

On Windows Firefox, axe's blank-page aggregation stalled. Its documented same-origin legacy mode is used there, with an assertion that no frame is left untested. Other engines use normal aggregation. Automated WCAG A/AA checks cover the landing, builder and case study at 360 and 1440 px, including the active runtime inside the landing iframe. These checks supplement the keyboard tests; they are not accessibility certification.

## Required acceptance checks

| Check | Test method | Result | Evidence |
|---|---|---|---|
| P09-A1: valid authoring | Stable attribute and ID fallback picker; ambiguous manual selector rejection; ordered import/export and unchanged IDs | Passed | `tests/e2e/app.spec.ts`, `tests/e2e/runtime.spec.ts` |
| P09-A2: usable runtime | Mouse, keyboard, Back/Next/Close/Escape/Finish, focus restoration; touch verification recorded in browser results | Passed | `tests/e2e/runtime.spec.ts`, `tests/e2e/touch.spec.ts` |
| P09-A3: target failures | Delayed insertion, hidden/ambiguous/missing target, skipped middle/last step, recovered skip, pathname mismatch | Passed | `tests/e2e/runtime.spec.ts` |
| P09-A4: completion lifecycle | Finish versus dismissal, explicit replay, reset, incremented version, blocked completion storage | Passed | `tests/e2e/runtime.spec.ts` |
| P09-A5: host isolation | Markup rendered literally; host form values unchanged; no submission or captured values; author mode explicit | Passed | `tests/e2e/runtime.spec.ts` |
| P09-A6: cleanup and layout | Repeated stop/restart/destroy; single root; final destroyed state; scroll/resize and 360 px geometry | Passed | `tests/e2e/runtime.spec.ts` |
| P09-A7: integrations | Plain HTML without React/Next assets, React example, nonce CSP with blocked inline styles/network, unavailable completion storage | Passed | `tests/e2e/runtime.spec.ts`, `public/examples/` |
| G-A1: usable UI | 360/1440 px overflow and axe checks; keyboard controls and focus restoration; reduced-motion context | Passed | All three browser spec files; screenshots below |
| G-A2: truthful state | Save acknowledgement after transaction; invalid selectors; blocked database and quota failure keep unsaved state and recovery download | Passed | `tests/e2e/app.spec.ts` |
| G-A3: reliable records | Actual two-tab revision conflict; reload committed data; invalid import/write preserves prior records; backup replacement confirmation | Passed | `tests/e2e/app.spec.ts`, `tests/unit/contracts.test.ts` |
| G-A4: privacy | Request capture after file selection yields no requests; runtime methods issue no requests; strict host blocks connections | Passed | `tests/e2e/app.spec.ts`, `tests/e2e/runtime.spec.ts` |
| G-A5: bounds | Strict fields, UUIDs, paths, selectors, duplicate IDs, step/text/config/backup/draft limits, immutable exported snapshots | Passed | `tests/unit/contracts.test.ts`, `src/core/config.ts`, `src/core/drafts.ts` |
| G-A6: evidence | Actual commands, versions, hardware, per-check results, measured runtime sizes, explicit unrun checks | Recorded | This document and `verification/browser-results.json` |

## Runtime size

Version **1.0.0** measures **53,980 bytes minified**, **19,773 bytes gzip**, **17,679 bytes Brotli** in the final build. These are file/compression measurements on the reference machine, not network timings or an activation benchmark. The runtime bundles Zod Mini for the shared trust-boundary schema and Floating UI for positioning. React and editor dependencies remain outside it. [Generated measurement](../public/embed/1.0.0/size.json).

## Portfolio and release evidence

Reviewed captures: [desktop landing](screenshots/landing-desktop.png), [desktop builder](screenshots/builder-desktop.png), [phone landing](screenshots/landing-phone.png), and [phone demo](screenshots/demo-phone.png). They use synthetic data and were compared with the generated visual references. [Capture metadata](verification/screenshots.json) records the actual viewports and browser, with no page errors. [Portfolio copy, 45–60 second walkthrough, and three unpublished LinkedIn drafts](portfolio.md) label the project as self-initiated. [Integration examples](integration.md) cover plain HTML, React, author mode, CSP and teardown. [Pages deployment and rollback](deployment.md) explains the Git integration and browser-data limits.

Production verification: the GitHub Actions run passed **69/69 browser cases** on Linux (Chromium, Firefox, WebKit), plus all five unit tests and the checked production build. Cloudflare's Git-integrated build also passed with the pinned Node/npm versions. All **23/23 Chromium cases** passed again against the real HTTPS production origin, including imports, downloads, saved data, CSP, touch and accessibility checks. [Live release handoff](release.md), [actual Pages configuration](verification/pages-config.json), [live browser results](verification/production-browser-results.json), and [production HTTP/header/hash results](verification/production-http.json) record delivery evidence separately from local verification.

## Not run and practical limits

Actual Safari, a physical touchscreen, a screen reader session, and an external customer pilot were **Not run**. Touch is exercised through browser touch emulation. There is no claim of customer conversion gains, certified accessibility, or measured Core Web Vitals.

Browser storage can be cleared or evicted; backups are the recovery mechanism. Single-page tours require stable owner-controlled selectors and exact paths. Completion is per browser profile, not per signed-in host user. The fixed CSP nonce belongs only to the test fixture. There is no account, analytics, Functions backend, cross-page orchestration, or cloud synchronisation.
