// End-to-end tests for profile.html using Playwright

import { test, expect } from "@playwright/test";

const BASE_URL = "http://localhost:4173";
const PROFILE_URL = `${BASE_URL}/profile.html`;

// ── Helpers ───────────────────────────────────────────────────────────────────

// Sections use display:none by default and get an "active" class when shown.
// So we check for the "active" class instead of toBeVisible().

async function waitForAuth(page) {
  await expect(page.locator("#authSection")).toHaveClass(/active/, {
    timeout: 5000,
  });
}

async function waitForProfile(page) {
  await expect(page.locator("#profileSection")).toHaveClass(/active/, {
    timeout: 8000,
  });
}

// ── Auth section ──────────────────────────────────────────────────────────────

test.describe("Auth section", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PROFILE_URL);
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await waitForAuth(page);
  });

  test("shows auth section when not logged in", async ({ page }) => {
    await expect(page.locator("#authSection")).toHaveClass(/active/);
    await expect(page.locator("#profileSection")).not.toHaveClass(/active/);
  });

  test("shows login form by default", async ({ page }) => {
    await expect(page.locator("#loginForm")).toBeVisible();
    await expect(page.locator("#signupForm")).not.toBeVisible();
  });

  test("switches to signup form when Skapa konto tab is clicked", async ({
    page,
  }) => {
    await page.locator("#tabSignup").click();
    await expect(page.locator("#signupForm")).toBeVisible();
    await expect(page.locator("#loginForm")).not.toBeVisible();
  });

  test("switches back to login form when Logga in tab is clicked", async ({
    page,
  }) => {
    await page.locator("#tabSignup").click();
    await expect(page.locator("#signupForm")).toBeVisible();
    await page.locator("#tabLogin").click();
    await expect(page.locator("#loginForm")).toBeVisible();
    await expect(page.locator("#signupForm")).not.toBeVisible();
  });

  test("shows field error when login email is empty", async ({ page }) => {
    await page.locator("#loginBtn").click();
    await expect(page.locator("#loginEmailError")).toHaveClass(/visible/);
  });

  test("shows field error when login password is empty", async ({ page }) => {
    await page.locator("#loginEmail").fill("test@test.se");
    await page.locator("#loginBtn").click();
    await expect(page.locator("#loginPasswordError")).toHaveClass(/visible/);
  });

  test("shows field error when signup password is too short", async ({
    page,
  }) => {
    await page.locator("#tabSignup").click();
    await page.locator("#signupEmail").fill("new@test.se");
    await page.locator("#signupPassword").fill("abc");
    await page.locator("#signupBtn").click();
    await expect(page.locator("#signupPasswordError")).toHaveClass(/visible/);
  });

  test("shows error toast on invalid login credentials", async ({ page }) => {
    // Mock Supabase auth to return an error
    await page.route("**/auth/v1/token**", (route) => {
      route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({
          error_description: "Invalid login credentials",
        }),
      });
    });

    await page.locator("#loginEmail").fill("wrong@test.se");
    await page.locator("#loginPassword").fill("wrongpassword");
    await page.locator("#loginBtn").click();

    await expect(page.locator("#toast")).toHaveClass(/error/, {
      timeout: 6000,
    });
  });
});

// ── Profile section ───────────────────────────────────────────────────────────

test.describe("Profile section", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PROFILE_URL);

    // Mock Supabase profile fetch to return empty (no existing profile)
    await page.route("**/rest/v1/profiles**", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      });
    });

    // Inject a fake session so the page skips auth and loads profile section
    await page.evaluate(() => {
      localStorage.setItem(
        "sb_session",
        JSON.stringify({
          access_token: "fake-token-for-testing",
          user: {
            id: "00000000-0000-0000-0000-000000000001",
            email: "dante@test.se",
          },
        }),
      );
    });

    await page.reload();
    await waitForProfile(page);
  });

  test("shows profile section after session is found", async ({ page }) => {
    await expect(page.locator("#profileSection")).toHaveClass(/active/);
    await expect(page.locator("#authSection")).not.toHaveClass(/active/);
  });

  test("shows the logout button when logged in", async ({ page }) => {
    await expect(page.locator("#logoutBtn")).toBeVisible();
  });

  test("pre-fills email field from session", async ({ page }) => {
    await expect(page.locator("#email")).toHaveValue("dante@test.se");
  });

  test("shows validation errors when submitting empty profile form", async ({
    page,
  }) => {
    await page.locator("#saveBtn").click();
    await expect(page.locator("#fnameError")).toHaveClass(/visible/);
    await expect(page.locator("#lnameError")).toHaveClass(/visible/);
    await expect(page.locator("#birthdateError")).toHaveClass(/visible/);
    await expect(page.locator("#locationError")).toHaveClass(/visible/);
  });

test("avatar placeholder updates as user types their name", async ({ page }) => {
  await page.evaluate(() => {
    // Make sure image is hidden so the placeholder update condition is met
    const img = document.getElementById("avatarImg");
    img.style.display = "none";
    img.src = "";
    // Now fire the input event on fname
    document.getElementById("fname").value = "Dante";
    document.getElementById("fname").dispatchEvent(new Event("input", { bubbles: true }));
  });
  await page.waitForTimeout(300);
  await expect(page.locator("#avatarPlaceholder")).toHaveText("D");
});

  test("avatar image shows when a valid URL is entered", async ({ page }) => {
    await page.evaluate(() => {
      const input = document.getElementById("imageInput");
      input.value = "https://picsum.photos/100";
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
    await page.waitForTimeout(300);
    await expect(page.locator("#avatarImg")).toBeVisible();
  });

  test("shows success toast after saving a new profile", async ({ page }) => {
    // Mock the POST to profiles
    await page.route("**/rest/v1/profiles", (route) => {
      if (route.request().method() === "POST") {
        route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify([
            {
              id: "00000000-0000-0000-0000-000000000001",
              fname: "Dante",
              lname: "Test",
              birthdate: "2000-01-01",
              location: "Stockholm",
              email: "dante@test.se",
              image: "",
            },
          ]),
        });
      } else {
        route.continue();
      }
    });

    await page.locator("#fname").fill("Dante");
    await page.locator("#lname").fill("Test");
    await page.locator("#birthdate").fill("2000-01-01");
    await page.locator("#location").fill("Stockholm");
    await page.locator("#saveBtn").click();

    await expect(page.locator("#toast")).toHaveClass(/success/, {
      timeout: 6000,
    });
  });

  test("logout button clears session and shows auth screen", async ({
    page,
  }) => {
    await page.route("**/auth/v1/logout", (route) => {
      route.fulfill({ status: 204, body: "" });
    });

    await page.locator("#logoutBtn").click();

    await expect(page.locator("#authSection")).toHaveClass(/active/, {
      timeout: 5000,
    });
    await expect(page.locator("#profileSection")).not.toHaveClass(/active/);
  });
});
