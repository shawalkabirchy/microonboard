"use client";

import {
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
  type Ref,
} from "react";
import { Play, Square, Crosshair, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TourError, type TourConfig } from "@/core/config";
import { sampleTour } from "@/core/sample";

export type PreviewHandle = {
  pick: () => void;
  validate: (config: TourConfig) => Promise<void>;
};

export function Preview({
  config = sampleTour,
  hero = false,
  onPick,
  onError,
  ref,
}: {
  config?: TourConfig;
  hero?: boolean;
  onPick?: (selector: string) => void;
  onError?: (message: string) => void;
  ref?: Ref<PreviewHandle>;
}) {
  const frame = useRef<HTMLIFrameElement>(null);
  const currentConfig = useRef(config);
  const callbacks = useRef({ onPick, onError });
  useEffect(() => {
    currentConfig.current = config;
    callbacks.current = { onPick, onError };
  }, [config, onPick, onError]);
  const [ready, setReady] = useState(false);
  const pending = useRef(
    new Map<
      string,
      {
        resolve: () => void;
        reject: (error: Error) => void;
        timer: ReturnType<typeof setTimeout>;
      }
    >(),
  );
  function send(action: string, extra: Record<string, unknown> = {}) {
    frame.current?.contentWindow?.postMessage(
      { channel: "microonboard-preview", action, ...extra },
      location.origin,
    );
  }
  useImperativeHandle(ref, () => ({
    pick() {
      send("pick");
    },
    validate(candidate) {
      return new Promise((resolve, reject) => {
        const requestId = crypto.randomUUID();
        const timer = setTimeout(() => {
          pending.current.delete(requestId);
          reject(
            new Error("The preview is unavailable. Reload it and try again."),
          );
        }, 4000);
        pending.current.set(requestId, { resolve, reject, timer });
        send("validate", { config: candidate, requestId });
      });
    },
  }));
  useEffect(() => {
    const requests = pending.current;
    function receive(event: MessageEvent) {
      if (
        event.origin !== location.origin ||
        event.source !== frame.current?.contentWindow ||
        event.data?.channel !== "microonboard-preview"
      )
        return;
      const message = event.data;
      if (message.type === "ready") {
        setReady(true);
        if (hero)
          frame.current?.contentWindow?.postMessage(
            {
              channel: "microonboard-preview",
              action: "play",
              config: currentConfig.current,
            },
            location.origin,
          );
      }
      if (message.type === "picked" && typeof message.selector === "string")
        callbacks.current.onPick?.(message.selector);
      if (message.type === "error" && typeof message.message === "string")
        callbacks.current.onError?.(message.message);
      if (
        message.type === "validated" &&
        typeof message.requestId === "string"
      ) {
        const request = requests.get(message.requestId);
        if (request) {
          clearTimeout(request.timer);
          requests.delete(message.requestId);
          if (message.error)
            request.reject(
              new TourError(
                "VALIDATION_ERROR",
                message.error,
                message.fieldPath,
              ),
            );
          else request.resolve();
        }
      }
    }
    window.addEventListener("message", receive);
    // The child can finish hydration before this listener is installed.
    frame.current?.contentWindow?.postMessage(
      { channel: "microonboard-preview", action: "hello" },
      location.origin,
    );
    return () => {
      window.removeEventListener("message", receive);
      for (const request of requests.values()) {
        clearTimeout(request.timer);
        request.reject(new Error("Preview closed."));
      }
      requests.clear();
    };
  }, [hero]);
  return (
    <section
      className={hero ? "hero-preview" : "preview-pane"}
      aria-label="Live example preview"
    >
      {hero ? (
        <div className="browser-chrome">
          <span />
          <span />
          <span />
          <small>Acme Studio · a little guidance in action</small>
        </div>
      ) : (
        <div className="preview-toolbar">
          <strong>Live preview</strong>
          <div>
            <Button
              variant="outline"
              size="sm"
              disabled={!ready}
              onClick={() => send("pick")}
            >
              <Crosshair data-icon="inline-start" />
              Pick element
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Stop preview tour"
              disabled={!ready}
              onClick={() => send("stop")}
            >
              <Square />
            </Button>
            <Button
              size="sm"
              disabled={!ready}
              onClick={() => send("play", { config: currentConfig.current })}
            >
              <Play data-icon="inline-start" />
              Play tour
            </Button>
          </div>
        </div>
      )}
      <div className="preview-canvas">
        <iframe
          ref={frame}
          src="/preview/"
          title="Acme Studio tour preview"
          onLoad={() => send("hello")}
        />
      </div>
      {!hero ? (
        <p className="preview-note">
          <Info aria-hidden="true" />
          Preview uses the example workspace. Install author mode on your own
          page to select real targets.
        </p>
      ) : null}
    </section>
  );
}
