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

## Git-account connection requires owner verification

At release, the API retains a GitHub repository source and automatic production/preview settings, but the dashboard reports **“This project is disconnected from your Git account. This may cause deployments to fail.”** A follow-up push did not create a Pages deployment. Do not treat the saved settings as proof that push delivery works.

GitHub's Cloudflare installation management page requires the owner's two-factor verification. In GitHub Settings → Applications → Cloudflare Workers and Pages → Configure, verify that `shawalkabirchy/microonboard` is accessible to the installation. Restore the account connection through Cloudflare if required, then verify a fresh push creates a `github:push` deployment. Do not uninstall the account-wide app: other projects use it.

Until that connection is repaired, an explicit **Git-branch build** publishes the current `main` through `POST /accounts/{account_id}/pages/projects/microonboard/deployments` with multipart field `branch=main`. It clones the public Git repository and runs the configured build; no Direct Upload, Functions, new credential or database is needed. This publishes the site, but does not establish automatic push or branch-preview delivery.

## Smoke test

Verify `/`, `/builder/`, `/demo/`, `/case-study/`, both plain/strict example hosts, the embed script, configuration schema, backup import/export, and direct navigation. Missing scripts must return a genuine 404. Check the strict host's response header and runtime operation. Confirm no Workers, Functions, database, analytics, or paid resource was added.

## Rollback

Use Pages' rollback operation to select a previously successful production deployment, then revert the faulty source commit through the normal review/check workflow. Do not clear users' browser databases. Database migrations must preserve existing records; initial schema version is 1 and there are no destructive migrations.

For subsequent runtime releases, retain the exact prior runtime assets and create a new version directory. Never overwrite an immutable published script with a breaking change. Tour JSON `version` is a content/completion version and is separate from the runtime's package version. If an old integration must keep working through rollback, keep its versioned assets in the rolled-back deployment too.

There is no server database to restore. User recovery is by validated local workspace backups; a deployment rollback cannot restore browser storage that the user cleared.
