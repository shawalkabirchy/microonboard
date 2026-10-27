"use client";

import {
  Plus,
  ArrowUp,
  ArrowDown,
  Trash2,
  Crosshair,
  ListOrdered,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Separator } from "@/components/ui/separator";
import type { TourConfig, TourStep } from "@/core/config";
import { cn } from "@/lib/utils";

type Props = {
  config: TourConfig;
  selectedStep: number;
  onSelect: (index: number) => void;
  onChange: (config: TourConfig, selectorChanged?: boolean) => void;
  onPick: () => void;
  error?: { path?: string; message: string };
};

export function EditorForm({
  config,
  selectedStep,
  onSelect,
  onChange,
  onPick,
  error,
}: Props) {
  const step = config.steps[selectedStep];
  function updateStep(changes: Partial<TourStep>) {
    onChange(
      {
        ...config,
        steps: config.steps.map((value, index) =>
          index === selectedStep ? { ...value, ...changes } : value,
        ),
      },
      "selector" in changes,
    );
  }
  function move(direction: number) {
    const next = [...config.steps];
    const destination = selectedStep + direction;
    [next[selectedStep], next[destination]] = [
      next[destination],
      next[selectedStep],
    ];
    onChange({ ...config, steps: next });
    onSelect(destination);
  }
  function fieldError(path: string) {
    return error?.path === path ? error.message : undefined;
  }
  return (
    <div className="editor-form">
      <h2 className="section-label">Tour details</h2>
      <FieldGroup>
        <Field data-invalid={Boolean(fieldError("title"))}>
          <FieldLabel htmlFor="tour-title">Title</FieldLabel>
          <Input
            id="tour-title"
            maxLength={80}
            value={config.title}
            onChange={(event) =>
              onChange({ ...config, title: event.target.value })
            }
            aria-invalid={Boolean(fieldError("title"))}
            aria-describedby={
              fieldError("title") ? "tour-title-error" : undefined
            }
          />
          <FieldError id="tour-title-error">{fieldError("title")}</FieldError>
        </Field>
        <div className="metadata-row">
          <Field data-invalid={Boolean(fieldError("pagePath"))}>
            <FieldLabel htmlFor="tour-path">Page path</FieldLabel>
            <Input
              id="tour-path"
              value={config.pagePath}
              onChange={(event) =>
                onChange({ ...config, pagePath: event.target.value })
              }
              aria-invalid={Boolean(fieldError("pagePath"))}
              aria-describedby={
                fieldError("pagePath") ? "tour-path-error" : undefined
              }
            />
            <FieldError id="tour-path-error">
              {fieldError("pagePath")}
            </FieldError>
          </Field>
          <Field data-invalid={Boolean(fieldError("version"))}>
            <FieldLabel htmlFor="tour-version">Version</FieldLabel>
            <Input
              id="tour-version"
              type="number"
              min={1}
              step={1}
              value={Number.isNaN(config.version) ? "" : config.version}
              onChange={(event) =>
                onChange({ ...config, version: event.target.valueAsNumber })
              }
              aria-invalid={Boolean(fieldError("version"))}
              aria-describedby={
                fieldError("version") ? "tour-version-error" : undefined
              }
            />
            <FieldError id="tour-version-error">
              {fieldError("version")}
            </FieldError>
          </Field>
        </div>
        <Field>
          <FieldLabel htmlFor="tour-color">Primary color</FieldLabel>
          <div className="color-row">
            <Input
              id="tour-color"
              className="color-picker"
              type="color"
              value={config.theme.primaryColor}
              onChange={(event) =>
                onChange({
                  ...config,
                  theme: { primaryColor: event.target.value },
                })
              }
            />
            <span>{config.theme.primaryColor.toUpperCase()}</span>
          </div>
        </Field>
      </FieldGroup>
      <div className="section-heading">
        <h2 className="section-label">
          Tour steps <span>{config.steps.length}/10</span>
        </h2>
        <Button
          size="icon-sm"
          variant="ghost"
          aria-label="Add step"
          disabled={config.steps.length >= 10}
          onClick={() => {
            onChange(
              {
                ...config,
                steps: [
                  ...config.steps,
                  {
                    id: crypto.randomUUID(),
                    selector: "",
                    title: "Your next step",
                    body: "Add a little context to this moment.",
                    placement: "auto",
                  },
                ],
              },
              true,
            );
            onSelect(config.steps.length);
          }}
        >
          <Plus />
        </Button>
      </div>
      <ol className="step-list">
        {config.steps.map((value, index) => (
          <li key={value.id}>
            <button
              type="button"
              className={cn(
                "step-row",
                selectedStep === index && "is-selected",
              )}
              onClick={() => onSelect(index)}
              aria-current={selectedStep === index ? "step" : undefined}
            >
              <ListOrdered aria-hidden="true" />
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{value.title || "Untitled step"}</strong>
            </button>
          </li>
        ))}
      </ol>
      <Separator />
      {step ? (
        <>
          <div className="section-heading">
            <h2 className="section-label">Selected step</h2>
            <div className="step-actions">
              <Button
                size="icon-sm"
                variant="ghost"
                aria-label="Move step up"
                disabled={selectedStep === 0}
                onClick={() => move(-1)}
              >
                <ArrowUp />
              </Button>
              <Button
                size="icon-sm"
                variant="ghost"
                aria-label="Move step down"
                disabled={selectedStep === config.steps.length - 1}
                onClick={() => move(1)}
              >
                <ArrowDown />
              </Button>
              <Button
                size="icon-sm"
                variant="destructive"
                aria-label="Delete step"
                disabled={config.steps.length === 1}
                onClick={() => {
                  onChange({
                    ...config,
                    steps: config.steps.filter(
                      (_, index) => index !== selectedStep,
                    ),
                  });
                  onSelect(Math.max(0, selectedStep - 1));
                }}
              >
                <Trash2 />
              </Button>
            </div>
          </div>
          <FieldGroup>
            <Field
              data-invalid={Boolean(
                fieldError(`steps.${selectedStep}.selector`),
              )}
            >
              <FieldLabel htmlFor="step-selector">Target selector</FieldLabel>
              <div className="selector-row">
                <Input
                  id="step-selector"
                  maxLength={300}
                  value={step.selector}
                  onChange={(event) =>
                    updateStep({ selector: event.target.value })
                  }
                  aria-invalid={Boolean(
                    fieldError(`steps.${selectedStep}.selector`),
                  )}
                  aria-describedby="selector-help selector-error"
                />
                <Button
                  size="icon"
                  variant="outline"
                  aria-label="Pick target element"
                  onClick={onPick}
                >
                  <Crosshair />
                </Button>
              </div>
              <p className="field-hint" id="selector-help">
                Pick a target, or test a manual selector in the preview.
              </p>
              <FieldError id="selector-error">
                {fieldError(`steps.${selectedStep}.selector`)}
              </FieldError>
            </Field>
            <Field
              data-invalid={Boolean(fieldError(`steps.${selectedStep}.title`))}
            >
              <FieldLabel htmlFor="step-title">Step title</FieldLabel>
              <Input
                id="step-title"
                maxLength={80}
                value={step.title}
                onChange={(event) => updateStep({ title: event.target.value })}
                aria-invalid={Boolean(
                  fieldError(`steps.${selectedStep}.title`),
                )}
                aria-describedby={
                  fieldError(`steps.${selectedStep}.title`)
                    ? "step-title-error"
                    : undefined
                }
              />
              <FieldError id="step-title-error">
                {fieldError(`steps.${selectedStep}.title`)}
              </FieldError>
            </Field>
            <Field
              data-invalid={Boolean(fieldError(`steps.${selectedStep}.body`))}
            >
              <FieldLabel htmlFor="step-body">Step content</FieldLabel>
              <Textarea
                id="step-body"
                maxLength={500}
                rows={3}
                value={step.body}
                onChange={(event) => updateStep({ body: event.target.value })}
                aria-invalid={Boolean(fieldError(`steps.${selectedStep}.body`))}
                aria-describedby={
                  fieldError(`steps.${selectedStep}.body`)
                    ? "step-body-error"
                    : undefined
                }
              />
              <FieldError id="step-body-error">
                {fieldError(`steps.${selectedStep}.body`)}
              </FieldError>
            </Field>
            <Field>
              <FieldLabel htmlFor="step-placement">Placement</FieldLabel>
              <NativeSelect
                id="step-placement"
                value={step.placement}
                onChange={(event) =>
                  updateStep({
                    placement: event.target.value as TourStep["placement"],
                  })
                }
              >
                {["auto", "top", "right", "bottom", "left"].map((value) => (
                  <NativeSelectOption value={value} key={value}>
                    {value[0].toUpperCase() + value.slice(1)}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>
          </FieldGroup>
        </>
      ) : null}
    </div>
  );
}
