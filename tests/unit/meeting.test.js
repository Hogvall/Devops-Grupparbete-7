import { describe, test, expect } from "vitest";
import { isUserSignedUp, formatMeetingDate } from "../../src/scripts/meeting-logic.js";

describe("isUserSignedUp", () => {
  test("returns true when user is in participants list", () => {
    const participants = [{ user_id: "user-123" }, { user_id: "user-999" }];
    expect(isUserSignedUp(participants, "user-123")).toBe(true);
  });

  test("returns false when user is not in list", () => {
    const participants = [{ user_id: "user-999" }];
    expect(isUserSignedUp(participants, "user-123")).toBe(false);
  });
});

describe("formatMeetingDate", () => {
  test("returns a formatted date string", () => {
    const result = formatMeetingDate("2025-01-01T12:00:00Z");
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(5);
  });
});