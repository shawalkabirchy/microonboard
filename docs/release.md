# Initial release handoff

MicroOnboard is a self-initiated ConsoleLog Studio portfolio project, released on **27 October 2026**.

- Application: [microonboard.pages.dev](https://microonboard.pages.dev/)
- Builder: [create a tour](https://microonboard.pages.dev/builder/)
- Demo: [Acme Studio](https://microonboard.pages.dev/demo/)
- Source: [shawalkabirchy/microonboard](https://github.com/shawalkabirchy/microonboard)
- Tested application commit: `ee56f4a78b03b7e4d3ee049117fadab636bc7560`
- Initial production deployment: `d1486be4-2986-44bf-b9ea-c7a85115f268`, completed at 13:25:34 UTC
- Immutable deployment: [d1486be4.microonboard.pages.dev](https://d1486be4.microonboard.pages.dev/)
- Validation: [GitHub Actions run](https://github.com/shawalkabirchy/microonboard/actions/runs/40511595399), **69 browser cases and five unit tests passed**

## Hosting verification

The actual Pages project has GitHub source integration, production branch `main`, automatic production deployments, and previews for all other branches. Repository root, `npm run build`, and `out` are configured. Build logs confirmed **Node 24.14.0 and npm 11.14.1**, the five passing unit tests, and runtime size identical to the local build.

Cloudflare reports `uses_functions: false`. Web analytics tag/token are null and no database or other service binding is configured. The first deployment was started through the Git-branch deployment API and cloned the source commit; it was not a Direct Upload.

The live HTTP checks passed for the landing, builder, demo, preview, case study, both integration hosts, runtime, schema, example JSON, size report, and licence notices. A missing script returned **404**. Nonce CSP and `nosniff` are delivered by Cloudflare; versioned assets include immutable caching. [Recorded responses](verification/production-http.json).

The deployed runtime SHA-256 is `e2138e2c4b176c32587f6d4cd130a909ac988c755a5af2de0fc15d63f1e956f0`, identical to the checked local runtime.

Live browser acceptance passed **23/23 Chromium cases** on the actual production origin. [Per-check results](verification/production-browser-results.json) include direct routes, local saves/reload, backups/imports, recovery, downloads, the visual picker, sample app controls, keyboard, touch emulation, CSP and the plain host. The actual command was `$env:TEST_BASE_URL='https://microonboard.pages.dev'; npx playwright test --project=chromium` in PowerShell.

Documentation and screenshot refinements may follow the tested application commit and trigger another automatic deployment. They do not change the versioned runtime. The repository's latest Actions run and Pages deployment identify the currently published commit.

## Owner handoff

[Acceptance evidence](acceptance.md), [installation examples](integration.md), [deployment/rollback](deployment.md), and [portfolio copy and LinkedIn drafts](portfolio.md) are included. Desktop and phone captures are in `screenshots/`. No social post has been sent.

Future changes should pass the checked build and browser suite before merging. Keep published runtime versions, retain users' browser data, and use the documented Pages rollback process. Important drafts require exported workspace backups.

Actual Safari, physical touchscreen, screen-reader sessions and customer outcome studies remain **Not run**; the acceptance document distinguishes them from automated engine coverage.
