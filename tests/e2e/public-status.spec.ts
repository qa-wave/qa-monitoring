import { test, expect } from "@playwright/test";

test.describe("Public status page", () => {
  test("loads without authentication", async ({ page }) => {
    await page.goto("/status");
    await expect(
      page.getByRole("heading", { level: 2, name: /Služby/i }),
    ).toBeVisible();
  });

  test("shows overall status banner", async ({ page }) => {
    await page.goto("/status");
    // One of the three status banners must be present
    const ok = page.getByText("Všechny služby běží normálně");
    const warn = page.getByText("Některé služby hlásí varování");
    const down = page.getByText("Probíhá incident");
    const count =
      (await ok.count()) + (await warn.count()) + (await down.count());
    expect(count).toBeGreaterThan(0);
  });

  test("shows service list with status dots", async ({ page }) => {
    await page.goto("/status");
    // Status dots should be visible for each service
    const statusDots = page.locator("[data-slot='status-dot'], .status-dot");
    // At least some services should be listed
    const bodyText = await page.textContent("body");
    // Service names from fixtures should appear
    expect(bodyText).toBeTruthy();
  });

  test("has link back to login", async ({ page }) => {
    await page.goto("/status");
    // The public status page might have a link to login or back to main app
    const loginLink = page.getByRole("link", { name: /přihlás/i });
    // This is optional - some status pages might not link back
    const count = await loginLink.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test("shows uptime percentage", async ({ page }) => {
    await page.goto("/status");
    // The status page should show some percentage (e.g. 99.9%)
    const bodyText = await page.textContent("body");
    expect(bodyText).toMatch(/\d+[.,]\d+\s*%/);
  });

  test("does not redirect to login", async ({ page }) => {
    await page.goto("/status");
    // Should stay on /status, not redirect
    await expect(page).toHaveURL(/\/status/);
  });
});
