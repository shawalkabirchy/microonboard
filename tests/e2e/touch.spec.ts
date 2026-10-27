import { test, expect } from "@playwright/test";

test("P09-A2 touch controls and reduced-motion context complete a real tour", async ({
  browser,
}) => {
  const context = await browser.newContext({
    baseURL: process.env.TEST_BASE_URL || "http://127.0.0.1:4173",
    viewport: { width: 360, height: 760 },
    hasTouch: true,
    reducedMotion: "reduce",
  });
  try {
    const page = await context.newPage();
    await page.goto("/examples/plain/");
    const dialog = page.getByRole("dialog");
    await page.getByRole("button", { name: "Start tour", exact: true }).tap();
    await expect(dialog.getByRole("heading")).toHaveAccessibleDescription(
      "Step 1 of 4",
    );
    await dialog.getByRole("button", { name: "Next", exact: true }).tap();
    await expect
      .poll(() =>
        dialog.evaluate((element) => {
          const rect = element.getBoundingClientRect();
          return (
            rect.left >= 0 &&
            rect.right <= innerWidth &&
            rect.top >= 0 &&
            rect.bottom <= innerHeight
          );
        }),
      )
      .toBe(true);
    await dialog.getByRole("button", { name: "Back", exact: true }).tap();
    await expect(dialog.getByText("Step 1 of 4")).toBeVisible();
    await dialog.getByRole("button", { name: "Close tour", exact: true }).tap();
    await expect(dialog).toHaveCount(0);
    await page.getByRole("button", { name: "Replay tour", exact: true }).tap();
    for (let index = 0; index < 3; index++)
      await dialog.getByRole("button", { name: "Next", exact: true }).tap();
    await dialog.getByRole("button", { name: "Finish", exact: true }).tap();
    await expect(dialog).toHaveCount(0);
    expect(await page.evaluate(() => window.hostEvents.at(-1))).toMatchObject({
      name: "completed",
      completedStepCount: 4,
    });
  } finally {
    await context.close();
  }
});
