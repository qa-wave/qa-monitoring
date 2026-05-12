import { test, expect, type Page } from "@playwright/test";

async function loginAdmin(page: Page) {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill("admin@example.com");
  await page.getByLabel("Heslo").fill("demo");
  await page.getByRole("button", { name: /Přihlásit/i }).click();
  await page.waitForURL("/");
}

async function loginViewer(page: Page) {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill("viewer@example.com");
  await page.getByLabel("Heslo").fill("demo");
  await page.getByRole("button", { name: /Přihlásit/i }).click();
  await page.waitForURL("/");
}

test.describe("Admin pages", () => {
  test.beforeEach(async ({ page }) => {
    await loginAdmin(page);
  });

  test("admin can access integrations page", async ({ page }) => {
    await page.goto("/admin/integrations");
    await expect(
      page.getByRole("heading", { name: "Integrace", exact: true }),
    ).toBeVisible();
  });

  test("admin can access branding page", async ({ page }) => {
    await page.goto("/admin/branding");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("admin can access users page", async ({ page }) => {
    await page.goto("/admin/users");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    // Users page should show user table or cards
    await expect(
      page.getByText("admin@example.com"),
    ).toBeVisible();
  });

  test("admin can access alerts page", async ({ page }) => {
    await page.goto("/admin/alerts");
    await expect(
      page.getByRole("heading", { name: /alert/i }),
    ).toBeVisible();
  });

  test("admin can access roles page", async ({ page }) => {
    await page.goto("/admin/roles");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("admin can access audit log", async ({ page }) => {
    await page.goto("/admin/audit");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("admin can access apps management", async ({ page }) => {
    await page.goto("/admin/apps");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("admin can access environments management", async ({ page }) => {
    await page.goto("/admin/environments");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("admin navigates to settings via sidebar", async ({ page }) => {
    await page.getByRole("link", { name: "Nastavení" }).click();
    await expect(page).toHaveURL(/\/admin\//);
  });
});

test.describe("Admin access control", () => {
  test("viewer cannot access admin users page", async ({ page }) => {
    await loginViewer(page);
    await page.goto("/admin/users");
    // requireAdmin redirects non-admin to /
    await page.waitForURL("/");
    await expect(page).toHaveURL("/");
  });

  test("viewer cannot access admin branding page", async ({ page }) => {
    await loginViewer(page);
    await page.goto("/admin/branding");
    await page.waitForURL("/");
    await expect(page).toHaveURL("/");
  });

  test("viewer cannot access admin integrations page", async ({ page }) => {
    await loginViewer(page);
    await page.goto("/admin/integrations");
    await page.waitForURL("/");
    await expect(page).toHaveURL("/");
  });

  test("viewer does not see settings link in sidebar", async ({ page }) => {
    await loginViewer(page);
    await expect(
      page.getByRole("link", { name: "Nastavení" }),
    ).toHaveCount(0);
  });
});
