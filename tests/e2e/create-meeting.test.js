import { test, expect } from "@playwright/test";

test("page loads", async ({ page }) => {
    await page.goto("/create-meeting.html");
    await expect(page.locator("h2")).toHaveText("Create Meeting");
    await expect(page.locator("#create_meeting_form")).toBeVisible();
});

test("category dropdown has options", async ({ page }) => {
    await page.goto("/create-meeting.html");
    const options = page.locator("#category option");
    await expect(options).toHaveCount(await options.count());
    const count = await options.count();
    expect(count).toBeGreaterThan(1);
});

test("all form fields are there", async ({ page }) => {
    await page.goto("/create-meeting.html");
    await expect(page.locator("[name='title']")).toBeVisible();
    await expect(page.locator("[name='description']")).toBeVisible();
    await expect(page.locator("#category")).toBeVisible();
    await expect(page.locator("[name='location']")).toBeVisible();
    await expect(page.locator("[name='time']")).toBeVisible();
    await expect(page.locator("[name='image']")).toBeVisible();
    await expect(page.locator("[name='max_participants']")).toBeVisible();
    await expect(page.locator("button[type='submit']")).toBeVisible();
});
