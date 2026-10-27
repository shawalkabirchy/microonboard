import * as z from "zod/mini";

export class TourError extends Error {
  code: string;
  fieldPath?: string;
  constructor(code: string, message: string, fieldPath?: string) {
    super(message);
    this.name = "TourError";
    this.code = code;
    this.fieldPath = fieldPath;
  }
}

export const stepSchema = z.strictObject({
  id: z.uuid(),
  selector: z.string().check(z.trim(), z.minLength(1), z.maxLength(300)),
  title: z.string().check(z.trim(), z.minLength(1), z.maxLength(80)),
  body: z.string().check(z.trim(), z.minLength(1), z.maxLength(500)),
  placement: z._default(
    z.enum(["auto", "top", "right", "bottom", "left"]),
    "auto",
  ),
});

export const tourSchema = z.strictObject({
  schemaVersion: z.literal(1),
  tourId: z.uuid(),
  title: z.string().check(z.trim(), z.minLength(1), z.maxLength(80)),
  version: z.int().check(z.gt(0)),
  pagePath: z
    .string()
    .check(
      z.minLength(1),
      z.maxLength(2048),
      z.regex(
        /^\/(?!\/)[^?#\\\s]*$/,
        "Use an absolute pathname, without an origin, query, or fragment.",
      ),
    ),
  steps: z.array(stepSchema).check(z.minLength(1), z.maxLength(10)),
  theme: z.strictObject({
    primaryColor: z
      .string()
      .check(z.regex(/^#[\da-fA-F]{6}$/, "Use a six-digit hex color.")),
  }),
});

export type TourConfig = z.infer<typeof tourSchema>;
export type TourStep = z.infer<typeof stepSchema>;

export function parseConfig(input: unknown, doc?: Document): TourConfig {
  try {
    const json = JSON.stringify(input);
    if (!json || new TextEncoder().encode(json).byteLength > 64 * 1024) {
      throw new TourError(
        "CONFIG_INVALID",
        "A tour must be valid JSON no larger than 64 KiB.",
      );
    }
    const parsed = z.safeParse(tourSchema, input);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      throw new TourError(
        "CONFIG_INVALID",
        issue.message,
        issue.path.join("."),
      );
    }
    const config = parsed.data;
    const ids = new Set<string>();
    config.steps.forEach((step, index) => {
      if (ids.has(step.id))
        throw new TourError(
          "CONFIG_INVALID",
          "Step IDs must be unique.",
          `steps.${index}.id`,
        );
      ids.add(step.id);
      if (doc) {
        try {
          doc.createDocumentFragment().querySelector(step.selector);
        } catch {
          throw new TourError(
            "CONFIG_INVALID",
            "This CSS selector is invalid.",
            `steps.${index}.selector`,
          );
        }
      }
    });
    return config;
  } catch (error) {
    if (error instanceof TourError) throw error;
    throw new TourError(
      "CONFIG_INVALID",
      "The configuration must be JSON serializable.",
    );
  }
}

export function readableError(error: unknown): string {
  if (error instanceof TourError)
    return `${error.fieldPath ? `${error.fieldPath}: ` : ""}${error.message}`;
  return error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
}

export function textColor(background: string): string {
  const values = [1, 3, 5].map((position) => {
    const value = parseInt(background.slice(position, position + 2), 16) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  const luminance =
    values[0] * 0.2126 + values[1] * 0.7152 + values[2] * 0.0722;
  return (luminance + 0.05) / 0.05 >= 4.5 ? "#000000" : "#ffffff";
}
