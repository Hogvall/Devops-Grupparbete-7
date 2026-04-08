import { test, expect } from "@playwright/test";

test("User can sign up and unsign using API", async ({ page }) => {

  const meetingId = 1;

  await page.goto(`/meeting.html?id=${meetingId}`);

  // Wait for participantDiv
  await page.waitForSelector("#participantDiv");

  // Wait for text-content
  const countLocator = page.locator("#participantDiv");
  await expect(countLocator).not.toBeEmpty;

  // Find button
  const signUpButton = page.locator('#participantDiv button');
  await expect(signUpButton).toBeVisible(); 

  const initialText = await countLocator.innerText();

  // Click button
  await signUpButton.click();

  // Wait for DOM to update
  await expect(countLocator).not.toContainText(initialText);

  // Click again
  const updatedButton = page.locator('#participantDiv button');
  await expect(updatedButton).toBeVisible();
  const newText = await countLocator.innerText();
  await updatedButton.click();

  // Wait for text to change again
  await expect(countLocator).not.toContainText(newText);
});