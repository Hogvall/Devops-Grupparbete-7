import { describe, test, expect, beforeEach, vi } from "vitest";
import { renderMeetingDom } from "../../scripts/meeting-view.js";
import { getMeeting, getParticipantData, addParticipantToApi, deleteParticipantFromApi } from "../../scripts/meeting-logic.js";

// Mock global fetch
globalThis.fetch = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
});

describe("API integration tests", () => {

  // getMeeting
  
  test("getMeeting returns parsed JSON when response is ok", async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([{ id: 1, title: "Yoga" }])
    });

    const result = await getMeeting(1);

    expect(fetch).toHaveBeenCalledOnce();
    expect(result).toEqual([{ id: 1, title: "Yoga" }]);
  });

  test("getMeeting throws error when response is not ok", async () => {
    fetch.mockResolvedValue({
      ok: false,
      status: 500
    });

    await expect(getMeeting(1)).rejects.toThrow("500");
  });


  // getParticipantData

  test("getParticipantData returns participants", async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([{ user_id: "abc" }])
    });

    const result = await getParticipantData(10);

    expect(fetch).toHaveBeenCalledOnce();
    expect(result).toEqual([{ user_id: "abc" }]);
  });

  test("getParticipantData throws on error", async () => {
    fetch.mockResolvedValue({
      ok: false,
      status: 404
    });

    await expect(getParticipantData(10)).rejects.toThrow("404");
  });

  // addParticipantToApi

  test("addParticipantToApi sends POST with correct body", async () => {
    let receivedOptions;

    fetch.mockImplementation((url, options) => {
      receivedOptions = options;
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });
    });

    const result = await addParticipantToApi("user-1", 99);

    expect(receivedOptions.method).toBe("POST");
    expect(JSON.parse(receivedOptions.body)).toEqual({
      user_id: "user-1",
      meeting_id: 99
    });
    expect(result).toEqual({ success: true });
  });

  // deleteParticipantFromApi

  test("deleteParticipantFromApi sends DELETE request", async () => {
    let receivedOptions;

    fetch.mockImplementation((url, options) => {
      receivedOptions = options;
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(null)
      });
    });

    const result = await deleteParticipantFromApi("user-1", 99);

    expect(receivedOptions.method).toBe("DELETE");
    expect(result).toBe(null);
  });

  test("deleteParticipantFromApi returns null when JSON fails", async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.reject("no body")
    });

    const result = await deleteParticipantFromApi("user-1", 99);

    expect(result).toBe(null);

  });
});

describe("renderMeetingDom", () => {

  beforeEach(() => {
    document.body.innerHTML = `<div id="app"></div>`;
  });

  test("renders meeting DOM correctly", () => {
    const meeting = [{
      title: "Yoga",
      time: "2025-01-01T12:00:00Z",
      location: "Park",
      image: "img.jpg",
      description: "Relax",
      category: { name: "Health" }
    }];

    renderMeetingDom(meeting);

    expect(document.querySelector("h3").textContent).toBe("Yoga");
    expect(document.querySelector("img").src).toContain("img.jpg");
    expect(document.querySelector("#participantDiv")).toBeTruthy();
    expect(document.body.textContent).toContain("Category: Health");
    expect(document.body.textContent).toContain("Relax");
    expect(document.body.textContent).toContain("January 1, 2025 at 1:00 PM");
  });
});
