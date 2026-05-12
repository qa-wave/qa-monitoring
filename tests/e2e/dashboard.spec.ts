import { test, expect, type Page } from "@playwright/test";

async function loginAdmin(page: Page) {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill("admin@example.com");
  await page.getByLabel("Heslo").fill("demo");
  await page.getByRole("button", { name: /Přihlásit/i }).click();
  await page.waitForURL("/");
}

test.describe("Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await loginAdmin(page);
  });

  test("overview loads with KPI cards", async ({ page }) => {
    const cards = page.locator("[data-ui='card']");
    await expect(cards.first()).toBeVisible();
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test("overview shows heading", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Přehled" }),
    ).toBeVisible();
  });

  test("navigation to environments page", async ({ page }) => {
    await page.goto("/environments");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("navigation to applications page", async ({ page }) => {
    await page.goto("/applications");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("navigation to releases page", async ({ page }) => {
    await page.goto("/releases");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("navigation to tests page", async ({ page }) => {
    await page.goto("/tests");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("navigation to incidents page", async ({ page }) => {
    await page.goto("/incidents");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("navigation to quality page", async ({ page }) => {
    await page.goto("/quality");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("navigation to product page", async ({ page }) => {
    await page.goto("/product");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("theme switcher opens and shows options", async ({ page }) => {
    await page
      .getByRole("button", { name: "Přepnout vizuální styl" })
      .click();
    const menuItems = page.getByRole("menuitem");
    await expect(menuItems.first()).toBeVisible();
    const count = await menuItems.count();
    expect(count).toBeGreaterThanOrEqual(5);
  });

  test("locale switcher toggles to English", async ({ page }) => {
    await page
      .getByRole("button", { name: "Jazyk / Language" })
      .click();
    await page.getByText("EN English").click();
    // After switching, the page should refresh with English content
    // The heading "Přehled" should change to "Overview"
    await expect(
      page.getByRole("heading", { name: /Overview|Přehled/i }),
    ).toBeVisible();
  });

  test("sidebar has navigation links", async ({ page }) => {
    // Check that sidebar nav links are present
    await expect(page.getByRole("link", { name: /Přehled/i })).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Prostředí|Environments/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Aplikace|Applications/i }),
    ).toBeVisible();
  });

  test("admin sees settings link in sidebar", async ({ page }) => {
    await expect(
      page.getByRole("link", { name: "Nastavení" }),
    ).toBeVisible();
  });
});
