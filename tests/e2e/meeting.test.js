import { test, expect } from "@playwright/test";

test("User can sign up or unsign using API", async ({ page }) => {

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