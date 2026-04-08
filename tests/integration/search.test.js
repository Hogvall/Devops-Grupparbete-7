import { describe, it, expect, vi } from "vitest";

describe("search integration", () => {
  it("should fetch and display meetings", async () => {
    document.body.innerHTML = `
      <select id="category"><option value="">Category</option></select>
      <select id="location"><option value="">Location</option></select>
      <div id="results"></div>
    `;

    global.fetch = vi.fn().mockResolvedValue({
      json: async () => [
        { id: 1, title: "React Meetup", location: "Stockholm", time: "2026-05-20", image: "" },
      ],
    });

    const { handleSearch } = await import("../../src/scripts/search.js");
    await handleSearch();

    const results = document.getElementById("results");
    expect(results.innerHTML).toContain("React Meetup");
  });
});