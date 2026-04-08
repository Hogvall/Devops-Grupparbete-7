import { test, expect } from "@playwright/test";

test("User can sign up and unsign using API", async ({ page }) => {

  const meetingId = 1;

  await page.goto(`/meeting.html?id=${meetingId}`);

  // Wait for participantDiv
  await page.waitForSelector("#participantDiv");

  // Wait for text-content
  const countLocator = page.locator("#participantDiv");
  await expect(countLocator).toContainText("Anmälda:");

  // Find button
  const signUpButton = page.locator('#participantDiv button');
  await expect(signUpButton).toHaveText("Anmäl här");

  const initialText = await countLocator.innerText();
  const initialCount = Number(initialText.match(/\d+/)[0]);

  // Click button
  await signUpButton.click();

  // Wait for DOM to update
  await expect(countLocator).toContainText(`Anmälda:`);
  await expect(countLocator).toContainText("Anmälda: " + (initialCount + 1) + " /");

  // Click again
  const updatedButton = page.locator('#participantDiv button');
  await expect(updatedButton).toHaveText("Avanmäl här");
  await updatedButton.click();

  // Wait for count to change to initial value
  await expect(page.locator('#participantDiv')).toContainText(`Anmälda: ${initialCount}`);
});