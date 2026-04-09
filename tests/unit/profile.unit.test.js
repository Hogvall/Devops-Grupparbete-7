// Run with: npx vitest run tests/unit/profile.unit.test.js

import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  validateProfile,
  getAnonHeaders,
  getAuthHeaders,
  saveSession,
  loadSession,
  clearSession,
} from "../../src/scripts/profile.js";

// ── validateProfile ───────────────────────────────────────────────────────────

describe("validateProfile", () => {
  const validData = {
    fname: "Anna",
    lname: "Svensson",
    birthdate: "1995-06-15",
    location: "Stockholm",
  };

  it("returns valid=true when all required fields are filled", () => {
    const result = validateProfile(validData);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual({});
  });

  it("returns error when fname is empty", () => {
    const result = validateProfile({ ...validData, fname: "" });
    expect(result.valid).toBe(false);
    expect(result.errors.fname).toBe("First name is required.");
  });

  it("returns error when fname is only whitespace", () => {
    const result = validateProfile({ ...validData, fname: "   " });
    expect(result.valid).toBe(false);
    expect(result.errors.fname).toBe("First name is required.");
  });

  it("returns error when lname is empty", () => {
    const result = validateProfile({ ...validData, lname: "" });
    expect(result.valid).toBe(false);
    expect(result.errors.lname).toBe("Last name is required.");
  });

  it("returns error when birthdate is missing", () => {
    const result = validateProfile({ ...validData, birthdate: "" });
    expect(result.valid).toBe(false);
    expect(result.errors.birthdate).toBe("Date of birth is required.");
  });

  it("returns error when location is empty", () => {
    const result = validateProfile({ ...validData, location: "" });
    expect(result.valid).toBe(false);
    expect(result.errors.location).toBe("Location is required.");
  });

  it("returns multiple errors when several fields are missing", () => {
    const result = validateProfile({ fname: "", lname: "", birthdate: "", location: "" });
    expect(result.valid).toBe(false);
    expect(Object.keys(result.errors)).toHaveLength(4);
  });
});

// ── getAnonHeaders ────────────────────────────────────────────────────────────

describe("getAnonHeaders", () => {
  it("includes Content-Type and apikey", () => {
    const headers = getAnonHeaders();
    expect(headers["Content-Type"]).toBe("application/json");
    expect(headers["apikey"]).toBeDefined();
  });

  it("merges extra headers", () => {
    const headers = getAnonHeaders({ Accept: "application/json" });
    expect(headers["Accept"]).toBe("application/json");
  });
});

// ── getAuthHeaders ────────────────────────────────────────────────────────────

describe("getAuthHeaders", () => {
  it("includes Authorization with Bearer token", () => {
    const headers = getAuthHeaders("my-token-123");
    expect(headers["Authorization"]).toBe("Bearer my-token-123");
  });

  it("includes apikey and Content-Type", () => {
    const headers = getAuthHeaders("token");
    expect(headers["Content-Type"]).toBe("application/json");
    expect(headers["apikey"]).toBeDefined();
  });

  it("merges extra headers", () => {
    const headers = getAuthHeaders("token", { Prefer: "return=representation" });
    expect(headers["Prefer"]).toBe("return=representation");
  });
});

// ── Session helpers ───────────────────────────────────────────────────────────

describe("saveSession / loadSession / clearSession", () => {
  // Mock localStorage
  beforeEach(() => {
    const store = {};
    vi.stubGlobal("localStorage", {
      getItem: (key) => store[key] ?? null,
      setItem: (key, val) => { store[key] = val; },
      removeItem: (key) => { delete store[key]; },
    });
  });

  it("saves and loads a session", () => {
    const session = { access_token: "abc123", user: { id: "uuid-1", email: "test@test.se" } };
    saveSession(session);
    const loaded = loadSession();
    expect(loaded).toEqual(session);
  });

  it("returns null when no session is stored", () => {
    const loaded = loadSession();
    expect(loaded).toBeNull();
  });

  it("clears the session", () => {
    saveSession({ access_token: "abc" });
    clearSession();
    expect(loadSession()).toBeNull();
  });

  it("returns null when stored value is invalid JSON", () => {
    localStorage.setItem("sb_session", "not-valid-json{{{");
    expect(loadSession()).toBeNull();
  });
});