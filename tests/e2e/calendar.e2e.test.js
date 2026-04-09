import { test, expect } from '@playwright/test';

test('Användare kan logga in och boka ett möte i kalendern', async ({ page }) => {
  
  await page.route('**/rest/v1/meetings*', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: '123', title: 'DevOps Redovisning', start_time: '2026-04-10T08:00' }
        ])
      });
    } else if (route.request().method() === 'POST') {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify([{ id: '123' }])
      });
    } else {
      await route.continue();
    }
  });

  await page.goto('/');
  await page.evaluate(() => {
    localStorage.setItem('user', JSON.stringify({ 
      id: '11111111-1111-1111-1111-111111111111', 
      email: 'test@example.com' 
    }));
  });

  await page.goto('/calendar.html');
  await page.waitForSelector('#event-title');

  await page.fill('#event-title', 'DevOps Redovisning');
  await page.fill('#event-time', '2026-04-10T08:00');
  await page.click('#create-event-btn');

  await expect(page.locator('.event-list')).toContainText('DevOps Redovisning');
});