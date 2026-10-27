import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { sampleTour } from "../../src/core/sample";
import { newDraft, exportBackup } from "../../src/core/drafts";

test("the phone landing preview does not scroll its parent page", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 640 });
  await page.goto("/");
  await expect(page.frameLocator("iframe").getByRole("dialog")).toBeVisible();
  expect(await page.evaluate(() => scrollY)).toBe(0);
});

test("landing identity, real app preview, no console errors and working primary action", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page).toHaveTitle(/MicroOnboard/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "A better first five",
  );
  const frame = page.frameLocator("iframe");
  await expect(
    frame.getByRole("heading", { name: "Your projects" }),
  ).toBeVisible();
  await expect(frame.getByRole("dialog")).toBeVisible();
  await frame.getByRole("button", { name: "Close tour", exact: true }).click();
  await page.getByRole("link", { name: "Build a tour", exact: true }).click();
  await expect(page).toHaveURL(/\/builder\//);
  await expect(page.getByLabel("Title", { exact: true })).toHaveValue(
    sampleTour.title,
  );
  expect(errors).toEqual([]);
});

test("builder saves locally, rejects ambiguous manual targets and preserves the last valid draft", async ({
  page,
}) => {
  await page.goto("/builder/");
  await page.getByLabel("Title", { exact: true }).fill("A thoughtful welcome");
  await page.getByRole("button", { name: "Save tour", exact: true }).click();
  await expect(
    page.getByText("Tour saved on this device.", { exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("Title", { exact: true })).toHaveValue(
    "A thoughtful welcome",
  );
  await page
    .getByLabel("Target selector", { exact: true })
    .fill(".project-row");
  await page.getByRole("button", { name: "Save tour", exact: true }).click();
  await expect(page.locator(".builder-alert")).toContainText(
    "exactly one visible element",
  );
  await expect(page.locator(".save-status")).toContainText("Not saved");
  page.on("dialog", (dialog) => dialog.accept());
  await page.reload();
  await expect(page.getByLabel("Target selector", { exact: true })).toHaveValue(
    sampleTour.steps[0].selector,
  );
});

test("builder picker does not open the selected host control and preserves step IDs during reordering", async ({
  page,
}) => {
  await page.goto("/builder/");
  await page
    .getByRole("button", { name: "Pick target element", exact: true })
    .click();
  const frame = page.frameLocator("iframe");
  await expect(frame.getByRole("dialog")).toBeVisible();
  await frame
    .getByRole("button", { name: "Invite teammate", exact: true })
    .click();
  await expect(frame.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByLabel("Target selector", { exact: true })).toHaveValue(
    '[data-tour-id="invite"]',
  );
  await page
    .getByRole("button", { name: "Move step down", exact: true })
    .click();
  await page.getByRole("button", { name: "Save tour", exact: true }).click();
  await expect(
    page.getByText("Tour saved on this device.", { exact: true }),
  ).toBeVisible();
  await page.getByRole("tab", { name: "Install", exact: true }).click();
  const waiting = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Export tour JSON", exact: true })
    .click();
  const download = await waiting;
  let text = "";
  for await (const chunk of (await download.createReadStream())!)
    text += chunk.toString();
  const config = JSON.parse(text);
  expect(config.steps[1].id).toBe(sampleTour.steps[0].id);
  expect(config.steps[1].selector).toBe('[data-tour-id="invite"]');
  expect(config.pagePath).toBe("/demo/");
});

test("export freezes a version and rejects changed content until the version is increased", async ({
  page,
}) => {
  await page.goto("/builder/");
  await page.getByRole("tab", { name: "Install", exact: true }).click();
  const first = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Export tour JSON", exact: true })
    .click();
  await first;
  await page.getByRole("tab", { name: "Edit tour", exact: true }).click();
  await page.getByLabel("Title", { exact: true }).fill("Updated welcome");
  await page.getByRole("tab", { name: "Install", exact: true }).click();
  await page
    .getByRole("button", { name: "Export tour JSON", exact: true })
    .click();
  await expect(page.locator(".builder-alert")).toContainText(
    "Increase its version above 1",
  );
  await page.getByRole("tab", { name: "Edit tour", exact: true }).click();
  await page.getByLabel("Version", { exact: true }).fill("2");
  await page.getByRole("tab", { name: "Install", exact: true }).click();
  const second = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Export tour JSON", exact: true })
    .click();
  expect((await second).suggestedFilename()).toBe("microonboard-tour-v2.json");
});

test("valid backup replacement requires confirmation; invalid imports do not touch saved work or upload content", async ({
  page,
}) => {
  await page.goto("/builder/");
  await page.getByRole("button", { name: "Save tour", exact: true }).click();
  await expect(
    page.getByText("Tour saved on this device.", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Play tour", exact: true }),
  ).toBeEnabled();
  const requests: string[] = [];
  page.on("request", (request) => {
    requests.push(request.url());
  });
  const imported = newDraft({
    ...structuredClone(sampleTour),
    title: "Restored tour",
  });
  await page
    .getByLabel("Import tour or workspace JSON", { exact: true })
    .setInputFiles({
      name: "backup.json",
      mimeType: "application/json",
      buffer: Buffer.from(exportBackup([imported])),
    });
  await expect(page.getByRole("alertdialog")).toContainText("1 tour");
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(page.getByLabel("Title", { exact: true })).toHaveValue(
    sampleTour.title,
  );
  await page
    .getByLabel("Import tour or workspace JSON", { exact: true })
    .setInputFiles({
      name: "backup.json",
      mimeType: "application/json",
      buffer: Buffer.from(exportBackup([imported])),
    });
  await page
    .getByRole("button", { name: "Replace workspace", exact: true })
    .click();
  await expect(page.getByLabel("Title", { exact: true })).toHaveValue(
    "Restored tour",
  );
  await page
    .getByLabel("Import tour or workspace JSON", { exact: true })
    .setInputFiles({
      name: "invalid.json",
      mimeType: "application/json",
      buffer: Buffer.from('{"appId":"P01","payload":{}}'),
    });
  await expect(page.locator(".builder-alert")).toContainText(
    "valid MicroOnboard",
  );
  expect(requests).toEqual([]);
  await page.reload();
  await expect(page.getByLabel("Title", { exact: true })).toHaveValue(
    "Restored tour",
  );
});

test("two real tabs cannot overwrite one another with stale saves", async ({
  page,
  context,
}) => {
  await page.goto("/builder/");
  await page.getByRole("button", { name: "Save tour", exact: true }).click();
  await expect(
    page.getByText("Tour saved on this device.", { exact: true }),
  ).toBeVisible();
  const other = await context.newPage();
  await other.goto("/builder/");
  await expect(other.getByLabel("Title", { exact: true })).toHaveValue(
    sampleTour.title,
  );
  await page.getByLabel("Title", { exact: true }).fill("Saved in first tab");
  await page.getByRole("button", { name: "Save tour", exact: true }).click();
  await expect(
    page.getByText("Tour saved on this device.", { exact: true }),
  ).toBeVisible();
  await other.getByLabel("Title", { exact: true }).fill("Stale second tab");
  await other.getByRole("button", { name: "Save tour", exact: true }).click();
  await expect(other.locator(".builder-alert")).toContainText(
    "Another tab changed",
  );
  await page.reload();
  await expect(page.getByLabel("Title", { exact: true })).toHaveValue(
    "Saved in first tab",
  );
});

test("blocked IndexedDB and quota failure keep pending work and offer recovery", async ({
  page,
}) => {
  await page.addInitScript(() => {
    IDBFactory.prototype.open = () => {
      throw new DOMException("Blocked", "SecurityError");
    };
  });
  await page.goto("/builder/");
  await expect(page.locator(".builder-alert")).toContainText(
    "Browser storage is unavailable",
  );
  await page.getByLabel("Title", { exact: true }).fill("Keep this pending");
  const waiting = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download unsaved work", exact: true })
    .click();
  const download = await waiting;
  let text = "";
  for await (const chunk of (await download.createReadStream())!)
    text += chunk.toString();
  expect(text).toContain("Keep this pending");
  await page.getByRole("button", { name: "Save tour", exact: true }).click();
  await expect(page.getByLabel("Title", { exact: true })).toHaveValue(
    "Keep this pending",
  );
  await expect(page.locator(".save-status")).toContainText("Not saved");
});

test("quota failure preserves a committed draft", async ({ page }) => {
  await page.goto("/builder/");
  await page.getByRole("button", { name: "Save tour", exact: true }).click();
  await expect(
    page.getByText("Tour saved on this device.", { exact: true }),
  ).toBeVisible();
  await page.evaluate(() => {
    IDBObjectStore.prototype.put = () => {
      throw new DOMException("Full", "QuotaExceededError");
    };
  });
  await page.getByLabel("Title", { exact: true }).fill("Not committed");
  await page.getByRole("button", { name: "Save tour", exact: true }).click();
  await expect(page.locator(".builder-alert")).toContainText(
    "Browser storage is full",
  );
  page.on("dialog", (dialog) => dialog.accept());
  await page.reload();
  await expect(page.getByLabel("Title", { exact: true })).toHaveValue(
    sampleTour.title,
  );
});

test("unsaved navigation is explicit and sample workspace controls work", async ({
  page,
}) => {
  await page.goto("/builder/");
  await page.getByLabel("Title", { exact: true }).fill("Unsaved changes");
  await page.getByRole("link", { name: "Live demo", exact: true }).focus();
  await page
    .getByRole("link", { name: "Live demo", exact: true })
    .press("Enter");
  await expect(page.getByRole("alertdialog")).toBeVisible();
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(page.getByLabel("Title", { exact: true })).toHaveValue(
    "Unsaved changes",
  );
  await expect(
    page.getByRole("link", { name: "Live demo", exact: true }),
  ).toBeFocused();
  await page.getByRole("button", { name: "Save tour", exact: true }).click();
  await expect(
    page.getByText("Tour saved on this device.", { exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Live demo", exact: true }).click();
  await page.getByRole("button", { name: "Close tour", exact: true }).click();
  await page.getByRole("button", { name: "New project", exact: true }).focus();
  await page
    .getByRole("button", { name: "New project", exact: true })
    .press("Enter");
  await page
    .getByLabel("Project name", { exact: true })
    .fill("Our next chapter");
  await page
    .getByRole("button", { name: "Create sample project", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: /Our next chapter/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "New project", exact: true }),
  ).toBeFocused();
});

test("browser Back protects unsaved text with the native unload dialog", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Build a tour", exact: true }).click();
  await page
    .getByLabel("Title", { exact: true })
    .fill("Keep this before going back");
  const dialogEvent = page.waitForEvent("dialog");
  const back = page.goBack({ timeout: 5000 }).catch(() => null);
  const dialog = await dialogEvent;
  expect(dialog.type()).toBe("beforeunload");
  await dialog.dismiss();
  await back;
  await expect(page.getByLabel("Title", { exact: true })).toHaveValue(
    "Keep this before going back",
  );
});

test("responsive pages and WCAG automated checks", async ({
  page,
  browserName,
}) => {
  test.setTimeout(90000);
  for (const width of [1440, 360]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ["/", "/builder/", "/case-study/"]) {
      await page.goto(route);
      if (route === "/builder/")
        await expect(page.getByLabel("Title", { exact: true })).toBeVisible();
      if (route === "/builder/")
        await page
          .getByRole("button", { name: "Save tour", exact: true })
          .hover();
      await expect
        .poll(() =>
          page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        )
        .toBe(true);
      const result = await new AxeBuilder({ page })
        // shortcut: Firefox on Windows needs same-origin mode; remove when blank-page aggregation is reliable.
        .setLegacyMode(
          process.platform === "win32" && browserName === "firefox",
        )
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      expect(
        result.incomplete.filter((issue) => issue.id === "frame-tested"),
      ).toEqual([]);
      expect(
        result.violations.map((violation) => ({
          id: violation.id,
          nodes: violation.nodes.map((node) => ({
            target: node.target,
            summary: node.failureSummary,
          })),
        })),
      ).toEqual([]);
    }
  }
});
