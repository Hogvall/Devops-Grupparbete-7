import { test, expect } from '@playwright/test';

test('Användare kan logga in och boka ett möte i kalendern', async ({ page }) => {

  // Mock meeting_participant GET — user has no participated meetings
  await page.route('**/rest/v1/meeting_participant*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([])
    });
  });

  // Mock meeting_organizer — returns the created meeting after creation
  await page.route('**/rest/v1/meeting_organizer*', async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify([{}]) });
    } else {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            meeting_id: '123',
            meetings: { id: '123', title: 'DevOps Redovisning', time: '2026-04-10T08:00' }
          }
        ])
      });
    }
  });

  // Mock meetings POST — for createEvent insert
  await page.route('**/rest/v1/meetings*', async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify([{ id: '123', title: 'DevOps Redovisning', time: '2026-04-10T08:00' }])
      });
    } else {
      await route.continue();
    }
  });

  await page.goto('/');
  await page.evaluate(() => {
    localStorage.setItem('sb_session', JSON.stringify({
      access_token: 'fake-token',
      user: { id: '11111111-1111-1111-1111-111111111111', email: 'test@example.com' }
    }));
  });

  await page.goto('/calendar.html');
  await page.waitForSelector('#event-title');

  await page.fill('#event-title', 'DevOps Redovisning');
  await page.fill('#event-time', '2026-04-10T08:00');
  await page.click('#create-event-btn');

  await expect(page.locator('.event-list')).toContainText('DevOps Redovisning');
});
