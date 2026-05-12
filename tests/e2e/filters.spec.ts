import { test, expect, type Page } from "@playwright/test";

async function loginAdmin(page: Page) {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill("admin@example.com");
  await page.getByLabel("Heslo").fill("demo");
  await page.getByRole("button", { name: /Přihlásit/i }).click();
  await page.waitForURL("/");
}

test.describe("Page filters and interactions", () => {
  test.beforeEach(async ({ page }) => {
    await loginAdmin(page);
  });

  test("incidents page has tab filters", async ({ page }) => {
    await page.goto("/incidents");
    // Incidents page has All / Active / Resolved tabs
    await expect(page.getByRole("button", { name: /Vše/i })).toBeVisible();
  });

  test("incidents page has search input", async ({ page }) => {
    await page.goto("/incidents");
    const searchInput = page.getByPlaceholder(/hledat|search/i);
    await expect(searchInput).toBeVisible();
  });

  test("incidents search filters results", async ({ page }) => {
    await page.goto("/incidents");
    const searchInput = page.getByPlaceholder(/hledat|search/i);
    // Type a search term that likely won't match anything
    await searchInput.fill("xyznonexistent");
    // Wait for filtering to apply
    await page.waitForTimeout(300);
    // Cards should be reduced (possibly zero)
    const cards = page.locator("[data-ui='card']");
    const count = await cards.count();
    // Could be 0 or show "no results" message
    expect(count).toBeLessThanOrEqual(1);
  });

  test("applications page has search", async ({ page }) => {
    await page.goto("/applications");
    const searchInput = page.getByPlaceholder(/hledat|search/i);
    await expect(searchInput).toBeVisible();
  });

  test("applications search filters list", async ({ page }) => {
    await page.goto("/applications");
    const searchInput = page.getByPlaceholder(/hledat|search/i);
    // Get initial count of app cards
    const initialCards = await page.locator("[data-ui='card']").count();
    expect(initialCards).toBeGreaterThan(0);
    // Search for nonsense
    await searchInput.fill("xyznonexistent");
    await page.waitForTimeout(300);
    const filteredCards = await page.locator("[data-ui='card']").count();
    expect(filteredCards).toBeLessThan(initialCards);
  });

  test("tests page has app filter select", async ({ page }) => {
    await page.goto("/tests");
    // Tests page has application and suite filters (select elements)
    const selects = page.locator("select");
    const count = await selects.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test("tests page has suite filter", async ({ page }) => {
    await page.goto("/tests");
    // Should have suite filter options like Unit, E2E, etc.
    const bodyText = await page.textContent("body");
    expect(bodyText).toMatch(/Unit|E2E|Smoke/);
  });

  test("applications page has language filter", async ({ page }) => {
    await page.goto("/applications");
    // Language filter select
    const selects = page.locator("select");
    const count = await selects.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });
});
