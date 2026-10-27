# Pages deployment and rollback

Use a **Git-integrated** Cloudflare Pages project named `microonboard` in the connected owner account. Do not create a Direct Upload project as a shortcut; project integration type is not interchangeable later.

| Setting | Value |
|---|---|
| Repository | `shawalkabirchy/microonboard` |
| Production branch | `main` |
| Root directory | Repository root |
| Build command | `npm run build` |
| Output directory | `out` |
| `NODE_VERSION` | `24.14.0` |
| `NPM_VERSION` | `11.14.1` |
| `NEXT_TELEMETRY_DISABLED` | `1` |
| Preview branches | Enabled |
| Analytics / Functions / bindings | Disabled / none |

The prebuild runs lint, type-checking, unit tests, embed generation, JSON Schema generation, size measurements, and third-party notice generation. The application itself is a static export. Versioned embed assets receive immutable caching; application routes and missing assets use actual exported HTML/404 files. No catch-all rewrite sends missing scripts to the landing page.

On a fresh computer or CI runner, run `npm ci` and `npm run build:embed` before standalone `npm run typecheck` if generated schema/size assets are absent. The repository retains the initial generated public assets for inspection and self-hosting.

Before pushing a release, run the checked production build and browser tests. GitHub Actions validates pushes and pull requests independently; it is not a promise that Pages waits for the Actions result. Validate before merging to `main`.

## Smoke test

Verify `/`, `/builder/`, `/demo/`, `/case-study/`, both plain/strict example hosts, the embed script, configuration schema, backup import/export, and direct navigation. Missing scripts must return a genuine 404. Check the strict host's response header and runtime operation. Confirm no Workers, Functions, database, analytics, or paid resource was added.

## Rollback

Use Pages' rollback operation to select a previously successful production deployment, then revert the faulty source commit through the normal review/check workflow. Do not clear users' browser databases. Database migrations must preserve existing records; initial schema version is 1 and there are no destructive migrations.

For subsequent runtime releases, retain the exact prior runtime assets and create a new version directory. Never overwrite an immutable published script with a breaking change. Tour JSON `version` is a content/completion version and is separate from the runtime's package version. If an old integration must keep working through rollback, keep its versioned assets in the rolled-back deployment too.

There is no server database to restore. User recovery is by validated local workspace backups; a deployment rollback cannot restore browser storage that the user cleared.
