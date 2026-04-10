import { describe, it, expect, vi, beforeEach } from "vitest";

describe("fetchMeetings", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("should return meetings from Supabase", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        { id: 1, title: "React Meetup", location: "Stockholm" },
      ],
    });

    const { fetchMeetings } = await import("../../src/scripts/search.js");
    const result = await fetchMeetings();

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("React Meetup");
  });

  it("should return locations from Supabase", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        { location: "Stockholm" },
        { location: "Padel Arena" },
        { location: "Stockholm" },
      ],
    });

    const { fetchLocations } = await import("../../src/scripts/search.js");
    const result = await fetchLocations();

    expect(result).toContain("Stockholm");
    expect(result).toHaveLength(2);
  });
});