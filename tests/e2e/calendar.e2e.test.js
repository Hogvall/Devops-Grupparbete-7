import { test, expect } from '@playwright/test';

test('Användare kan logga in och boka ett möte i kalendern', async ({ page }) => {
  await page.goto('/');

  await page.evaluate(() => {
    localStorage.setItem('user', JSON.stringify({ id: '1', email: 'test@example.com' }));
  });

  await page.goto('/calendar.html');

  await page.waitForSelector('#event-title');

  await page.fill('#event-title', 'DevOps Redovisning');
  await page.fill('#event-time', '2026-04-10T08:00');
  await page.click('#create-event-btn');

  await expect(page.locator('.event-list')).toContainText('DevOps Redovisning');
});