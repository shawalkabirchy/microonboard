"use client";

import { useEffect, useState } from "react";
import { Copy, Download, Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { TourDraft } from "@/core/drafts";

export function InstallPanel({
  draft,
  onExport,
  busy,
}: {
  draft: TourDraft;
  onExport: () => void;
  busy: boolean;
}) {
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState("");
  useEffect(() => {
    Promise.resolve().then(() => setOrigin(location.origin));
  }, []);
  const url = `${origin}/embed/1.0.0/microonboard.min.js`;
  const config = JSON.stringify(
    draft.lastExportedConfig ?? draft.config,
    null,
    2,
  ).replace(/</g, "\\u003c");
  const snippet = `<script src="${url}" defer></script>\n<script src="/onboarding.js" defer></script>\n\n// onboarding.js — pass the downloaded configuration:\nconst config = ${config};\nconst tour = MicroOnboard.create(config);\ntour.start().catch(console.error);\n\n// On route change or unmount:\n// tour.destroy();`;
  return (
    <div className="install-panel">
      <h2>A warm welcome, wherever you build.</h2>
      <p>
        Export a version, add the runtime to a page you control, and pass in
        your configuration.
      </p>
      <div className="install-step">
        <span>01</span>
        <div>
          <h3>Freeze your tour version</h3>
          <p>
            Changes after export need a higher version. Your JSON stays on your
            device.
          </p>
          <Button disabled={busy} onClick={onExport}>
            <Download data-icon="inline-start" />
            Export tour JSON
          </Button>
          <small>
            Last exported:{" "}
            {draft.lastExportedVersion
              ? `version ${draft.lastExportedVersion}`
              : "not yet"}
          </small>
        </div>
      </div>
      <div className="install-step">
        <span>02</span>
        <div>
          <h3>Add the standalone runtime</h3>
          <p>No React or Next.js is required on your host page.</p>
          <a className="asset-url" href={url} target="_blank" rel="noreferrer">
            {url || "Loading asset URL…"}
            <ExternalLink aria-hidden="true" />
          </a>
          <a
            className="text-link"
            href="/embed/1.0.0/tour.schema.json"
            download
          >
            Download configuration schema
          </a>
        </div>
      </div>
      <div className="install-step">
        <span>03</span>
        <div>
          <h3>Start with your configuration</h3>
          <p>
            Put the two script tags in your host HTML. Put the JavaScript below
            the <code>{"// onboarding.js"}</code> marker into{" "}
            <code>/onboarding.js</code>.
          </p>
          <p>
            Use the downloaded JSON as <code>config</code>. The path must match{" "}
            <code>{draft.config.pagePath}</code> exactly.
          </p>
          <Button
            variant="outline"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(snippet);
                setCopied(true);
                setCopyError("");
              } catch {
                setCopyError(
                  "Copy is unavailable. Select the code below and copy it manually.",
                );
              }
            }}
          >
            {copied ? (
              <Check data-icon="inline-start" />
            ) : (
              <Copy data-icon="inline-start" />
            )}
            {copied
              ? "Copied installation example"
              : "Copy installation example"}
          </Button>
          <pre tabIndex={0} aria-label="Installation example">
            <code>{snippet}</code>
          </pre>
          {copyError ? <p role="status">{copyError}</p> : null}
        </div>
      </div>
      <Alert>
        <AlertDescription>
          For your own host, explicitly enable{" "}
          <code>MicroOnboard.enableAuthorMode()</code> in your development or
          admin flow. Pick targets there, download the JSON, then import it here
          to edit. Never enable author mode from a public query-string toggle.
        </AlertDescription>
      </Alert>
      <p>
        Completion is per browser profile and tour version. A host with a strict
        style policy can pass its permitted nonce as the second argument to{" "}
        <code>create</code>. Stop or destroy the instance when navigating away.
      </p>
      <a
        className="text-link"
        href="/examples/plain/"
        target="_blank"
        rel="noreferrer"
      >
        Open the plain HTML integration example
        <ExternalLink aria-hidden="true" />
      </a>
    </div>
  );
}
