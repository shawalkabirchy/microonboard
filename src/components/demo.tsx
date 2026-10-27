"use client";

import { useEffect, useRef, useState } from "react";

import { Play, ArrowUpRight, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Workspace } from "@/components/workspace";
import { sampleTour } from "@/core/sample";
import { readableError } from "@/core/config";
import { create, type TourInstance } from "@/runtime/tour";

export function Demo() {
  const tour = useRef<TourInstance>(null);
  const [message, setMessage] = useState("A small welcome for a fresh start.");
  const [storageWarning, setStorageWarning] = useState("");
  useEffect(() => {
    const instance = create(sampleTour);
    tour.current = instance;
    const completed = () =>
      setMessage("You're all set. Explore the workspace, or replay the tour.");
    const dismissed = () =>
      setMessage("Take your time. You can replay the tour whenever you like.");
    const unavailable = () =>
      setStorageWarning(
        "Completion can only be remembered for this page session because browser storage is unavailable.",
      );
    document.addEventListener("microonboard:completed", completed);
    document.addEventListener("microonboard:dismissed", dismissed);
    document.addEventListener("microonboard:storageUnavailable", unavailable);
    instance
      .start()
      .then(() => {
        if (instance.state === "completed")
          setMessage("Welcome back. Replay the tour for another look around.");
      })
      .catch((error) => setMessage(readableError(error)));
    return () => {
      instance.destroy();
      document.removeEventListener("microonboard:completed", completed);
      document.removeEventListener("microonboard:dismissed", dismissed);
      document.removeEventListener(
        "microonboard:storageUnavailable",
        unavailable,
      );
    };
  }, []);
  return (
    <main id="main" className="demo-page">
      <div className="demo-intro">
        <div>
          <h1>A little guidance in action.</h1>
          <p>Meet Acme Studio, our interactive example workspace.</p>
        </div>
        <div className="demo-actions">
          <Button
            variant="outline"
            onClick={() => {
              void tour.current
                ?.start(true)
                .catch((error) => setMessage(readableError(error)));
            }}
          >
            <Play data-icon="inline-start" />
            Replay tour
          </Button>
          <Button asChild>
            <a href="/builder/">
              Make it yours
              <ArrowUpRight data-icon="inline-end" />
            </a>
          </Button>
        </div>
      </div>
      <div className="demo-banner">
        <Info aria-hidden="true" />
        <span>
          Sample data only. Try the controls — nothing is sent or shared.
        </span>
        <span role="status">{message}</span>
      </div>
      {storageWarning ? (
        <p className="storage-warning" role="status">
          {storageWarning}
        </p>
      ) : null}
      <Workspace />
    </main>
  );
}
