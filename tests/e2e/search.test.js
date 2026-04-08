import { test, expect } from "@playwright/test";

test("should display search results", async ({ page }) => {
  await page.goto("/");

  await page.selectOption("#category", "");
  await page.selectOption("#location", "");
  await page.click(".search-btn");

  await expect(page.locator("#results")).not.toBeEmpty();
});