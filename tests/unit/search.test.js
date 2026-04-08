import { describe, it, expect, vi } from "vitest";

describe("fetchMeetings", () => {
  it("should return meetings from Supabase", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: async () => [
        { id: 1, title: "React Meetup", location: "Stockholm" },
      ],
    });

    const { fetchMeetings } = await import("../../src/scripts/search.js");
    const result = await fetchMeetings();

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("React Meetup");
  });
});