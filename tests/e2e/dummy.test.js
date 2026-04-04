import { test, expect } from "@playwright/test";

test("Test description", async ({ page }) => {
  await page.goto("/");
  expect(1).toEqual(1);
});