import { test, expect } from "@playwright/test";

// Resilience-focused E2E: verifies the app is reachable and the auth gate
// behaves, independent of seeded data or service state.
test.describe("health & resilience", () => {
  test("public /status responds 200 and renders a document", async ({
    page,
  }) => {
    const res = await page.goto("/status");
    expect(res?.status()).toBeLessThan(400);
    await expect(page.locator("html")).toHaveAttribute("lang", /.+/);
    expect((await page.locator("body").innerText()).length).toBeGreaterThan(10);
  });

  test("protected root redirects unauthenticated users to /login", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/login/);
  });

  test("renders without uncaught page errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(String(e)));
    await page.goto("/status");
    expect(errors, errors.join("\n")).toHaveLength(0);
  });
});
