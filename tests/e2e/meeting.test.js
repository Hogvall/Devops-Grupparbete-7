import { test, expect } from "@playwright/test";

test("User can sign up or unsign using API", async ({ page }) => {

  await page.goto("/");
  await page.evaluate(() => {
    localStorage.setItem('sb_session', JSON.stringify({
      access_token: 'fake-token',
      user: { id: '11111111-1111-1111-1111-111111111111', email: 'test@example.com' }
    }));
  });

  await page.goto("/meeting.html?id=1");

  // Wait for participantDiv
  await page.waitForSelector("#participantDiv");

  // Wait for text-content
  const participantDiv = page.locator("#participantDiv");
  await expect(participantDiv).not.toBeEmpty;

  // Find button
  const signUpButton = page.locator('#participantDiv button');
  await expect(signUpButton).toBeVisible();

  // Click button
  await signUpButton.click();
  
});