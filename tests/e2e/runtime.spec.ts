import { test, expect, type Page } from "@playwright/test";
import { sampleTour } from "../../src/core/sample";
import type { TourConfig } from "../../src/core/config";
import type { TourInstance } from "../../src/runtime/tour";
declare global {
  interface Window {
    MicroOnboard: typeof import("../../src/runtime/index");
    hostTour: TourInstance;
    hostConfig: TourConfig;
    hostEvents: {
      name: string;
      tourId: string;
      version: number;
      completedStepCount: number;
    }[];
    formSubmissions: number;
    configureHost: (changes: Partial<TourConfig>) => void;
  }
}
const dialog = (page: Page) => page.getByRole("dialog");

test("P09-A1 picker falls back to a stable unique ID when a tour attribute is ambiguous", async ({
  page,
}) => {
  await page.evaluate(() => {
    for (let index = 0; index < 2; index++) {
      const target = document.createElement("button");
      target.dataset.tourId = "duplicated";
      target.textContent = `Target ${index}`;
      if (index === 0) target.id = "unique-fallback";
      document.querySelector("section")!.prepend(target);
    }
  });
  await page
    .getByRole("button", { name: "Enable author mode (example)" })
    .click();
  await dialog(page)
    .getByRole("button", { name: "Pick target", exact: true })
    .click();
  await page.getByRole("button", { name: "Target 0", exact: true }).click();
  await expect(
    dialog(page).getByText("#unique-fallback", { exact: true }),
  ).toBeVisible();
});
async function configure(page: Page, changes: Partial<TourConfig>) {
  await page.evaluate((value) => window.configureHost(value), changes);
}
async function complete(page: Page) {
  for (let index = 0; index < 3; index++)
    await dialog(page)
      .getByRole("button", { name: "Next", exact: true })
      .click();
  await dialog(page)
    .getByRole("button", { name: "Finish", exact: true })
    .click();
}
test.beforeEach(async ({ page }) => {
  await page.goto("/examples/plain/");
  await expect(
    page.getByRole("button", { name: "Start tour", exact: true }),
  ).toBeVisible();
});

test("P09-A2/A4 finish, replay, versioned completion and reset", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Start tour", exact: true }).click();
  await expect(dialog(page).getByText("Step 1 of 4")).toBeVisible();
  await expect(dialog(page).getByRole("heading")).toHaveAccessibleDescription(
    "Step 1 of 4",
  );
  await complete(page);
  await expect(dialog(page)).toHaveCount(0);
  expect(await page.evaluate(() => window.hostEvents.at(-1))).toMatchObject({
    name: "completed",
    completedStepCount: 4,
  });
  expect(
    await page.evaluate(() =>
      localStorage.getItem(`microonboard:${window.hostConfig.tourId}:1`),
    ),
  ).toBeTruthy();
  await page.getByRole("button", { name: "Start tour", exact: true }).click();
  await expect(dialog(page)).toHaveCount(0);
  await page.getByRole("button", { name: "Replay tour", exact: true }).click();
  await expect(dialog(page)).toBeVisible();
  await page.keyboard.press("Escape");
  await configure(page, { version: 2 });
  await page.getByRole("button", { name: "Start tour", exact: true }).click();
  await expect(dialog(page)).toBeVisible();
  await page.keyboard.press("Escape");
  await page
    .getByRole("button", { name: "Reset completion", exact: true })
    .click();
  expect(
    await page.evaluate(() =>
      localStorage.getItem(`microonboard:${window.hostConfig.tourId}:1`),
    ),
  ).toBeTruthy();
});

test("P09-A2/A6 keyboard focus, back, stop/restart, no duplicate roots and final destroy", async ({
  page,
}) => {
  const start = page.getByRole("button", { name: "Start tour", exact: true });
  await start.focus();
  await page.keyboard.press("Enter");
  await expect(dialog(page).getByRole("heading")).toBeFocused();
  await dialog(page).getByRole("button", { name: "Next", exact: true }).click();
  await dialog(page).getByRole("button", { name: "Back", exact: true }).click();
  await expect(dialog(page).getByText("Step 1 of 4")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(start).toBeFocused();
  const events = await page.evaluate(() => window.hostEvents.length);
  for (let cycle = 0; cycle < 8; cycle++) {
    await page.evaluate(() => window.hostTour.start(true));
    expect(await page.locator("[data-microonboard-root]").count()).toBe(1);
    await page.evaluate(() => window.hostTour.stop());
    expect(await page.locator("[data-microonboard-root]").count()).toBe(0);
  }
  expect(
    await page.evaluate(() => ({
      state: window.hostTour.state,
      events: window.hostEvents.length,
    })),
  ).toEqual({ state: "idle", events });
  await page.evaluate(() => window.hostTour.start(true));
  await expect(dialog(page).getByText("Step 1 of 4")).toBeVisible();
  await page.evaluate(() => window.hostTour.destroy());
  expect(
    await page.evaluate(async () => {
      try {
        await window.hostTour.start();
        return "started";
      } catch (error) {
        return (error as { code: string }).code;
      }
    }),
  ).toBe("RUNTIME_DESTROYED");
});

test("P09-A3 waits for a delayed target, rejects wrong pages and invalid selectors", async ({
  page,
}) => {
  const step = { ...sampleTour.steps[0], selector: "#delayed" };
  await configure(page, { steps: [step] });
  await page.evaluate(() => {
    setTimeout(() => {
      const button = document.createElement("button");
      button.id = "delayed";
      button.textContent = "Arrived";
      document.body.append(button);
    }, 350);
  });
  await page.getByRole("button", { name: "Start tour", exact: true }).click();
  await expect(
    dialog(page).getByRole("button", { name: "Finish" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await configure(page, { pagePath: "/wrong/" });
  await page.getByRole("button", { name: "Start tour", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("PAGE_MISMATCH");
  await expect(dialog(page)).toHaveCount(0);
  const code = await page.evaluate(
    (config) => {
      try {
        window.MicroOnboard.create(config);
        return "valid";
      } catch (error) {
        return (error as { code: string }).code;
      }
    },
    { ...sampleTour, steps: [{ ...sampleTour.steps[0], selector: "[" }] },
  );
  expect(code).toBe("CONFIG_INVALID");
});

test("P09-A3 skips a missing middle step without completion, and can recover by going back", async ({
  page,
}) => {
  const steps = [
    sampleTour.steps[0],
    { ...sampleTour.steps[1], selector: "#missing" },
    sampleTour.steps[2],
  ];
  await configure(page, { steps });
  await page.getByRole("button", { name: "Start tour", exact: true }).click();
  await dialog(page).getByRole("button", { name: "Next", exact: true }).click();
  await expect(
    dialog(page).getByRole("button", { name: "Skip step" }),
  ).toBeVisible();
  await dialog(page).getByRole("button", { name: "Skip step" }).click();
  await expect(
    dialog(page).getByRole("button", { name: "End tour", exact: true }),
  ).toBeVisible();
  await page.evaluate(() => {
    const element = document.createElement("button");
    element.id = "missing";
    element.textContent = "Recovered";
    document.body.append(element);
  });
  await dialog(page).getByRole("button", { name: "Back", exact: true }).click();
  await dialog(page).getByRole("button", { name: "Next", exact: true }).click();
  await dialog(page)
    .getByRole("button", { name: "Finish", exact: true })
    .click();
  expect(await page.evaluate(() => window.hostEvents.at(-1))).toMatchObject({
    name: "completed",
    completedStepCount: 3,
  });
  await page
    .getByRole("button", { name: "Reset completion", exact: true })
    .click();
  await page.evaluate(() => document.getElementById("missing")?.remove());
  await page.getByRole("button", { name: "Replay tour", exact: true }).click();
  await dialog(page).getByRole("button", { name: "Next", exact: true }).click();
  await dialog(page).getByRole("button", { name: "Skip step" }).click();
  await dialog(page)
    .getByRole("button", { name: "End tour", exact: true })
    .click();
  expect(await page.evaluate(() => window.hostEvents.at(-1))).toMatchObject({
    name: "dismissed",
    completedStepCount: 2,
  });
  expect(
    await page.evaluate(() =>
      localStorage.getItem(`microonboard:${window.hostConfig.tourId}:1`),
    ),
  ).toBeNull();
});

test("P09-A3 last, hidden and ambiguous targets never create completion", async ({
  page,
}) => {
  await configure(page, {
    steps: [
      sampleTour.steps[0],
      { ...sampleTour.steps[1], selector: ".ambiguous" },
    ],
  });
  await page.evaluate(() => {
    for (let i = 0; i < 2; i++) {
      const target = document.createElement("button");
      target.className = "ambiguous";
      target.textContent = "Duplicate";
      document.body.append(target);
    }
  });
  await page.getByRole("button", { name: "Start tour", exact: true }).click();
  await dialog(page).getByRole("button", { name: "Next", exact: true }).click();
  await dialog(page).getByRole("button", { name: "Skip step" }).click();
  expect(await page.evaluate(() => window.hostEvents.at(-1))).toMatchObject({
    name: "dismissed",
    completedStepCount: 1,
  });
  await page.evaluate(() => {
    document.getElementById("tasks")!.hidden = true;
  });
  await configure(page, { steps: [sampleTour.steps[1]] });
  await page.getByRole("button", { name: "Replay tour", exact: true }).click();
  await expect(
    dialog(page).getByRole("button", { name: "Skip step" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  expect(
    await page.evaluate(() =>
      localStorage.getItem(`microonboard:${window.hostConfig.tourId}:1`),
    ),
  ).toBeNull();
});

test("P09-A5 literal text, no runtime network, private fields unchanged through picking", async ({
  page,
}) => {
  const requests: string[] = [];
  page.on("request", (request) => requests.push(request.url()));
  await configure(page, {
    steps: [
      {
        ...sampleTour.steps[0],
        title: '<img src="/leak" onerror="alert(1)">',
        body: "<script>private</script>",
      },
    ],
  });
  await page.getByRole("button", { name: "Start tour", exact: true }).click();
  await expect(dialog(page).getByRole("heading")).toHaveText(
    '<img src="/leak" onerror="alert(1)">',
  );
  await dialog(page)
    .getByRole("button", { name: "Finish", exact: true })
    .click();
  expect(requests).toEqual([]);
  await page
    .getByRole("button", { name: "Enable author mode (example)" })
    .click();
  await dialog(page).getByRole("button", { name: "Pick target" }).click();
  await page.getByRole("button", { name: "Submit example form" }).click();
  await expect(page.locator("#host-input")).toHaveValue(
    "Keep this value private",
  );
  expect(await page.evaluate(() => window.formSubmissions)).toBe(0);
  await dialog(page)
    .getByRole("button", { name: "Add step", exact: true })
    .click();
  const downloadPromise = page.waitForEvent("download");
  await dialog(page)
    .getByRole("button", { name: "Download tour JSON" })
    .click();
  const download = await downloadPromise;
  const stream = await download.createReadStream();
  let json = "";
  for await (const chunk of stream!) json += chunk.toString();
  expect(json).not.toContain("Keep this value private");
  expect(JSON.parse(json).steps[0].selector).toBe(
    '[data-tour-id="submit-form"]',
  );
  expect(requests).toEqual([]);
});

test("P09-A7 strict nonce policy works without violations or inline styles", async ({
  page,
}) => {
  await page.goto("/examples/strict/");
  await page.evaluate(() => {
    (window as unknown as { violations: string[] }).violations = [];
    document.addEventListener("securitypolicyviolation", (event) =>
      (window as unknown as { violations: string[] }).violations.push(
        event.violatedDirective,
      ),
    );
  });
  await page.getByRole("button", { name: "Start tour", exact: true }).click();
  await expect(dialog(page)).toBeVisible();
  await complete(page);
  expect(
    await page.evaluate(
      () => (window as unknown as { violations: string[] }).violations,
    ),
  ).toEqual([]);
  expect(await page.locator("[style]").count()).toBe(0);
});

test("P09-A7 completion survives storage failure only for the page session", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => {
      throw new DOMException("Blocked", "SecurityError");
    };
    Storage.prototype.setItem = () => {
      throw new DOMException("Blocked", "SecurityError");
    };
  });
  await page.reload();
  await page.getByRole("button", { name: "Start tour", exact: true }).click();
  await complete(page);
  expect(
    await page.evaluate(() =>
      window.hostEvents.some((event) => event.name === "storageUnavailable"),
    ),
  ).toBe(true);
  await configure(page, {});
  await page.getByRole("button", { name: "Start tour", exact: true }).click();
  await expect(dialog(page)).toHaveCount(0);
  await page.reload();
  await page.getByRole("button", { name: "Start tour", exact: true }).click();
  await expect(dialog(page)).toBeVisible();
});

test("P09-A6 tooltip remains within the phone viewport after resize and scroll", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 760 });
  await page.getByRole("button", { name: "Start tour", exact: true }).click();
  await expect(dialog(page)).toBeVisible();
  for (const width of [360, 410]) {
    await page.setViewportSize({ width, height: 760 });
    await page.mouse.wheel(0, 250);
    await expect
      .poll(async () => {
        const box = await dialog(page).boundingBox();
        return Boolean(
          box &&
          box.x >= 0 &&
          box.y >= 0 &&
          box.x + box.width <= width &&
          box.y + box.height <= 760,
        );
      })
      .toBe(true);
  }
});
