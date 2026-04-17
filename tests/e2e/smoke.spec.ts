import { test, expect } from "@playwright/test";

test("veřejná /status načte a ukáže headline", async ({ page }) => {
  await page.goto("/status");
  await expect(page.getByRole("heading", { level: 2, name: /Služby/i })).toBeVisible();
  // Headline je v jednom z bannerů (ok / warn / down)
  const ok = page.getByText("Všechny služby běží normálně");
  const warn = page.getByText("Některé služby hlásí varování");
  const down = page.getByText("Probíhá incident");
  const count = (await ok.count()) + (await warn.count()) + (await down.count());
  expect(count).toBeGreaterThan(0);
});

test("Přehled přesměruje na /login bez session", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByRole("heading", { name: "Přihlásit se" })).toBeVisible();
});

test("Přihlášení jako viewer zobrazí Přehled", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill("viewer@example.com");
  await page.getByLabel("Heslo").fill("demo");
  await page.getByRole("button", { name: /Přihlásit/i }).click();
  await expect(page).toHaveURL("/");
  await expect(page.getByRole("heading", { name: "Přehled" })).toBeVisible();
  // Viewer nevidí Nastavení v sidebaru
  await expect(page.getByRole("link", { name: "Nastavení" })).toHaveCount(0);
});

test("Admin vidí Nastavení a může otevřít /admin/integrations", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill("admin@example.com");
  await page.getByLabel("Heslo").fill("demo");
  await page.getByRole("button", { name: /Přihlásit/i }).click();
  await expect(page).toHaveURL("/");
  await page.getByRole("link", { name: "Nastavení" }).click();
  await expect(page).toHaveURL(/\/admin\/integrations/);
  await expect(page.getByRole("heading", { name: "Integrace", exact: true })).toBeVisible();
});
