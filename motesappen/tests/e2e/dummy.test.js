import { test, expect } from "@playwright/test";

test("Test description", async ({ page }) => {
  await page.goto("/");
});