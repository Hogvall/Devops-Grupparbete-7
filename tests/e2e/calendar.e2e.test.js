import { test, expect } from '@playwright/test';

test('Användare kan logga in och boka ett möte i kalendern', async ({ page }) => {
  await page.goto('/login.html');


  await page.waitForLoadState('networkidle');

  await page.fill('#email', 'test@example.com'); 
  await page.fill('#password', '123');
  await page.click('button[type="submit"]');


  await page.waitForSelector('#event-title', { timeout: 15000 });

  await page.fill('#event-title', 'DevOps Redovisning');
  await page.fill('#event-time', '2026-04-10T08:00');
  await page.click('#create-event-btn');

  await expect(page.locator('.event-list')).toContainText('DevOps Redovisning');
});