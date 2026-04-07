import { test, expect } from "@playwright/test";

test("Test description", async ({ page }) => {
  await page.goto("http://localhost:5173/meeting.html?id=2");

  await page.waitForSelector("h3");
  await expect(page.locator("h3").first()).not.toBeEmpty;

});
