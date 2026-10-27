# Host integration

The editor is a Next.js application; the embed is a separate browser script. A host needs only the versioned runtime and its own configuration. It can self-host both. Retain the supplied third-party notices when redistributing the runtime.

```html
<script src="https://microonboard.pages.dev/embed/1.0.0/microonboard.min.js" defer></script>
<script src="/onboarding.js" defer></script>
```

```js
// onboarding.js: paste the configuration from your downloaded JSON.
const tour = MicroOnboard.create(config, permittedStyleNonce);
tour.start().catch((error) => console.error(error.code, error.fieldPath));

// Host navigation/unmount:
tour.destroy();
```

Omit the second argument when the host does not require a style nonce. Configuration is a plain JSON object; the runtime never fetches a visitor-provided URL. Keep application initialization in a host script allowed by your own CSP. [Plain host](https://microonboard.pages.dev/examples/plain/) and [strict-policy fixture](https://microonboard.pages.dev/examples/strict/) provide runnable examples.

## Public API

`MicroOnboard.create(config, styleNonce?)` validates synchronously, throwing `TourError` with `code: CONFIG_INVALID` and a `fieldPath` when appropriate. It returns:

| Member | Behavior |
|---|---|
| `state` | Read-only `idle`, `running`, `completed`, `dismissed`, or `destroyed`. |
| `start(replay = false)` | Promise resolving after the first target resolves or its two-second wait ends. `PAGE_MISMATCH` rejects without starting. Starting while running does nothing; completion suppresses automatic replay. |
| `stop()` | A running tour returns to idle, restores focus, and releases per-run resources without completion/dismissal events. The next start begins at step one. |
| `resetCompletion()` | Removes only this tour/version's host-origin completion key and in-memory fallback. Does not navigate or stop a running tour. |
| `destroy()` | Removes UI, timers, observers, and listeners. A destroyed instance cannot restart. Create another instance. |

The completion key is `microonboard:<tourId>:<version>`. Finish writes a UTC timestamp only after every step has been successfully traversed. Close/Escape and a tour ending with skipped steps emit dismissal without writing completion. Backtracking and successfully advancing through a previously skipped step clears that skip.

DOM events are dispatched on `document`: `microonboard:completed`, `microonboard:dismissed`, and `microonboard:storageUnavailable`. Each event detail is `{tourId, version, completedStepCount}`. No form values, host page text, or user IDs are included. The runtime's non-modal dialog does not trap host keyboard focus.

## React host

Load the script before mounting this component, or bundle the runtime sources into your own integration:

```tsx
useEffect(() => {
  const instance = window.MicroOnboard.create(config, styleNonce);
  instance.start().catch(handleTourError);
  return () => instance.destroy();
}, [config, styleNonce]);
```

Keep configuration identity stable between React renders. Recreate only when the configuration or page actually changes. The included demo uses the same source runtime and performs this cleanup on unmount. The runtime does not patch your router or orchestrate page changes.

## Author mode on your own page

The site owner explicitly enables author mode from a development/admin flow:

```js
const author = MicroOnboard.enableAuthorMode({
  styleNonce,
  onExport(config) { /* optional host callback, no automatic upload */ }
});
// The author panel provides Pick target, Add step, Download tour JSON.
// Programmatic export validates and returns the same JSON object:
const config = author.exportConfig();
author.destroy();
```

Do not enable it from an untrusted query string. Click a stable target, or Tab to it and press Enter. Escape cancels picking. The picker cancels the chosen control's default action and captures only a unique `data-tour-id` or stable ID, never input values or host text. It does not generate `nth-child` selectors. When a target lacks a suitable attribute, add one in the host source.

Import that JSON into the builder to edit text and ordering. The built-in preview is an example document, not a connection to your host. Targets inside shadow roots and iframe contents are outside v1.

## Security policy

Runtime content uses `textContent`, not HTML evaluation. Runtime styles live inside a Shadow DOM root. Geometry is written through stylesheet rules, not inline style attributes. Pass a host-permitted style nonce when needed; no `unsafe-eval`, inline event-handler attributes, or runtime network access is required.

The strict fixture tests `default-src 'none'`, `script-src 'self'`, nonce-authorized styles, `style-src-attr 'none'`, and `connect-src 'none'`. Its repeatable fixed test nonce is intentionally documented; real hosts supply their own policy/nonce. Embedding a script from this deployment also requires permitting that script source under the host's policy. Self-hosting avoids adding a new script origin.
