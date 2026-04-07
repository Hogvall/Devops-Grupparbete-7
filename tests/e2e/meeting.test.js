import { test, expect } from '@playwright/test';

test('h3-elementet laddas', async ({ page }) => {
  await page.goto('/meeting.html?id=2'); // eller den sida du testar
  const h3 = await page.locator('h3');
  await expect(h3).toBeVisible();
});