import { test, expect } from "@playwright/test";

test("should display search results", async ({ page }) => {
  await page.goto("http://localhost:5173");

  await page.selectOption("#category", "");
  await page.selectOption("#location", "");
  await page.click(".search-btn");

  await expect(page.locator("#results")).not.toBeEmpty();
});