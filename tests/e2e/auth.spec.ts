import { test, expect, type Page } from "@playwright/test";

async function login(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Heslo").fill(password);
  await page.getByRole("button", { name: /Přihlásit/i }).click();
}

test.describe("Authentication", () => {
  test("login page loads with heading", async ({ page }) => {
    await page.goto("/login");
    await expect(
      page.getByRole("heading", { name: "Přihlásit se" }),
    ).toBeVisible();
  });

  test("login with valid admin credentials", async ({ page }) => {
    await login(page, "admin@example.com", "demo");
    await page.waitForURL("/");
    await expect(page).toHaveURL("/");
    await expect(
      page.getByRole("heading", { name: "Přehled" }),
    ).toBeVisible();
  });

  test("login with valid viewer credentials", async ({ page }) => {
    await login(page, "viewer@example.com", "demo");
    await page.waitForURL("/");
    await expect(page).toHaveURL("/");
    await expect(
      page.getByRole("heading", { name: "Přehled" }),
    ).toBeVisible();
  });

  test("login with invalid credentials shows error", async ({ page }) => {
    await login(page, "wrong@example.com", "wrong");
    await expect(
      page.getByText(/neexistuje|nesprávné|selhalo|chyba/i),
    ).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test("login with wrong password shows error", async ({ page }) => {
    await login(page, "admin@example.com", "badpass");
    await expect(
      page.getByText(/neexistuje|nesprávné|selhalo|chyba/i),
    ).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test("unauthenticated user is redirected to login", async ({ page }) => {
    await page.goto("/");
    await page.waitForURL(/\/login/);
    await expect(page).toHaveURL(/\/login/);
  });

  test("logout works", async ({ page }) => {
    // Login first
    await login(page, "admin@example.com", "demo");
    await page.waitForURL("/");

    // Open user menu (avatar button) and click logout
    await page
      .locator("button")
      .filter({ has: page.locator("[data-slot='avatar']") })
      .click();
    await page.getByText("Odhlásit se").click();
    await page.waitForURL(/\/login/);
    await expect(page).toHaveURL(/\/login/);
  });

  test("after logout, visiting dashboard redirects to login", async ({
    page,
  }) => {
    // Login
    await login(page, "viewer@example.com", "demo");
    await page.waitForURL("/");

    // Logout
    await page
      .locator("button")
      .filter({ has: page.locator("[data-slot='avatar']") })
      .click();
    await page.getByText("Odhlásit se").click();
    await page.waitForURL(/\/login/);

    // Try accessing dashboard again
    await page.goto("/");
    await page.waitForURL(/\/login/);
  });
});
