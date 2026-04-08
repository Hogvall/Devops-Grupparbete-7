// tests/integration/profile.integration.test.js
// Integration tests for API functions in scripts/profile.js
// These tests mock fetch to verify that the right requests are sent to Supabase.
// Run with: npx vitest run tests/integration/profile.integration.test.js

import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  fetchProfile,
  createProfile,
  updateProfile,
  signIn,
  signUp,
} from "../../src/scripts/profile.js";

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Creates a mock fetch that returns a JSON response.
 */
function mockFetch(body, status = 200) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  });
}

const FAKE_TOKEN = "fake-access-token";
const FAKE_USER_ID = "11111111-1111-1111-1111-111111111111";

// ── fetchProfile ──────────────────────────────────────────────────────────────

describe("fetchProfile", () => {
  beforeEach(() => { vi.restoreAllMocks(); });

  it("returns the profile when found", async () => {
    const profile = { id: FAKE_USER_ID, fname: "Anna", lname: "Svensson" };
    vi.stubGlobal("fetch", mockFetch([profile]));

    const result = await fetchProfile(FAKE_USER_ID, FAKE_TOKEN);
    expect(result).toEqual(profile);
  });

  it("returns null when no profile exists", async () => {
    vi.stubGlobal("fetch", mockFetch([]));
    const result = await fetchProfile(FAKE_USER_ID, FAKE_TOKEN);
    expect(result).toBeNull();
  });

  it("throws an error when the request fails", async () => {
    vi.stubGlobal("fetch", mockFetch({}, 500));
    await expect(fetchProfile(FAKE_USER_ID, FAKE_TOKEN)).rejects.toThrow("500");
  });

  it("sends Authorization header with the access token", async () => {
    const fetchSpy = mockFetch([]);
    vi.stubGlobal("fetch", fetchSpy);

    await fetchProfile(FAKE_USER_ID, FAKE_TOKEN);

    const [, options] = fetchSpy.mock.calls[0];
    expect(options.headers["Authorization"]).toBe(`Bearer ${FAKE_TOKEN}`);
  });

  it("queries by the correct user id", async () => {
    const fetchSpy = mockFetch([]);
    vi.stubGlobal("fetch", fetchSpy);

    await fetchProfile(FAKE_USER_ID, FAKE_TOKEN);

    const [url] = fetchSpy.mock.calls[0];
    expect(url).toContain(`id=eq.${FAKE_USER_ID}`);
  });
});

// ── createProfile ─────────────────────────────────────────────────────────────

describe("createProfile", () => {
  beforeEach(() => { vi.restoreAllMocks(); });

  const profileData = { fname: "Anna", lname: "Svensson", birthdate: "1995-06-15", location: "Stockholm", email: "anna@test.se" };

  it("returns the created profile", async () => {
    const created = { id: FAKE_USER_ID, ...profileData };
    vi.stubGlobal("fetch", mockFetch([created], 201));

    const result = await createProfile(FAKE_USER_ID, profileData, FAKE_TOKEN);
    expect(result).toEqual(created);
  });

  it("sends the user id as part of the request body", async () => {
    const fetchSpy = mockFetch([{ id: FAKE_USER_ID, ...profileData }], 201);
    vi.stubGlobal("fetch", fetchSpy);

    await createProfile(FAKE_USER_ID, profileData, FAKE_TOKEN);

    const [, options] = fetchSpy.mock.calls[0];
    const body = JSON.parse(options.body);
    expect(body.id).toBe(FAKE_USER_ID);
  });

  it("uses POST method", async () => {
    const fetchSpy = mockFetch([{ id: FAKE_USER_ID }], 201);
    vi.stubGlobal("fetch", fetchSpy);

    await createProfile(FAKE_USER_ID, profileData, FAKE_TOKEN);

    const [, options] = fetchSpy.mock.calls[0];
    expect(options.method).toBe("POST");
  });

  it("throws an error when creation fails", async () => {
    vi.stubGlobal("fetch", mockFetch({ message: "duplicate key" }, 409));
    await expect(createProfile(FAKE_USER_ID, profileData, FAKE_TOKEN)).rejects.toThrow("duplicate key");
  });
});

// ── updateProfile ─────────────────────────────────────────────────────────────

describe("updateProfile", () => {
  beforeEach(() => { vi.restoreAllMocks(); });

  const updatedData = { fname: "Anna", lname: "Karlsson", birthdate: "1995-06-15", location: "Göteborg", email: "anna@test.se" };

  it("returns the updated profile", async () => {
    const updated = { id: FAKE_USER_ID, ...updatedData };
    vi.stubGlobal("fetch", mockFetch([updated]));

    const result = await updateProfile(FAKE_USER_ID, updatedData, FAKE_TOKEN);
    expect(result).toEqual(updated);
  });

  it("uses PATCH method", async () => {
    const fetchSpy = mockFetch([{ id: FAKE_USER_ID }]);
    vi.stubGlobal("fetch", fetchSpy);

    await updateProfile(FAKE_USER_ID, updatedData, FAKE_TOKEN);

    const [, options] = fetchSpy.mock.calls[0];
    expect(options.method).toBe("PATCH");
  });

  it("targets the correct user id in the URL", async () => {
    const fetchSpy = mockFetch([{ id: FAKE_USER_ID }]);
    vi.stubGlobal("fetch", fetchSpy);

    await updateProfile(FAKE_USER_ID, updatedData, FAKE_TOKEN);

    const [url] = fetchSpy.mock.calls[0];
    expect(url).toContain(`id=eq.${FAKE_USER_ID}`);
  });

  it("throws an error when update fails", async () => {
    vi.stubGlobal("fetch", mockFetch({ message: "not found" }, 404));
    await expect(updateProfile(FAKE_USER_ID, updatedData, FAKE_TOKEN)).rejects.toThrow("not found");
  });
});

// ── signIn ────────────────────────────────────────────────────────────────────

describe("signIn", () => {
  beforeEach(() => { vi.restoreAllMocks(); });

  it("returns session data on success", async () => {
    const session = { access_token: FAKE_TOKEN, user: { id: FAKE_USER_ID, email: "anna@test.se" } };
    vi.stubGlobal("fetch", mockFetch(session));

    const result = await signIn("anna@test.se", "password123");
    expect(result.access_token).toBe(FAKE_TOKEN);
  });

  it("throws an error on failed login", async () => {
    vi.stubGlobal("fetch", mockFetch({ error_description: "Invalid credentials" }, 400));
    await expect(signIn("wrong@test.se", "wrong")).rejects.toThrow("Invalid credentials");
  });

  it("sends email and password in request body", async () => {
    const fetchSpy = mockFetch({ access_token: FAKE_TOKEN, user: {} });
    vi.stubGlobal("fetch", fetchSpy);

    await signIn("anna@test.se", "password123");

    const [, options] = fetchSpy.mock.calls[0];
    const body = JSON.parse(options.body);
    expect(body.email).toBe("anna@test.se");
    expect(body.password).toBe("password123");
  });
});

// ── signUp ────────────────────────────────────────────────────────────────────

describe("signUp", () => {
  beforeEach(() => { vi.restoreAllMocks(); });

  it("returns data on successful signup", async () => {
    const result = { access_token: FAKE_TOKEN, user: { id: FAKE_USER_ID } };
    vi.stubGlobal("fetch", mockFetch(result));

    const data = await signUp("new@test.se", "password123");
    expect(data.access_token).toBe(FAKE_TOKEN);
  });

  it("throws on signup failure", async () => {
    vi.stubGlobal("fetch", mockFetch({ msg: "Email already registered" }, 422));
    await expect(signUp("taken@test.se", "password123")).rejects.toThrow("Email already registered");
  });
});