import { describe, test, expect, beforeEach, vi } from "vitest";
import { uploadImage, createMeeting, addOrganizer } from "../../src/scripts/create-meeting-logic.js";
import { renderCategoryOptions, showStatusMessage } from "../../src/scripts/create-meeting-view.js";

globalThis.fetch = vi.fn();

beforeEach(() => {
    vi.clearAllMocks();
});

describe("uploadImage", () => {
    test("returns a public URL on success", async () => {
        fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });

        const file = new File(["data"], "photo.jpg", { type: "image/jpeg" });
        const url = await uploadImage(file);

        expect(fetch).toHaveBeenCalledOnce();
        const [, options] = fetch.mock.calls[0];
        expect(options.method).toBe("POST");
        expect(options.body).toBe(file);
        expect(url).toContain("photo.jpg");
        expect(url).toContain("/public/");
    });

    test("throws on failure", async () => {
        fetch.mockResolvedValue({ ok: false, status: 500 });
        const file = new File(["data"], "photo.jpg", { type: "image/jpeg" });
        await expect(uploadImage(file)).rejects.toThrow("500");
    });
});

describe("createMeeting", () => {
    test("posts meeting data and returns result", async () => {
        const meetingData = { title: "Test", description: "Desc", category_id: 1, location: "Park", time: "2026-05-01T10:00", image: null, max_participants: 10 };
        fetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve([{ id: 42, ...meetingData }])
        });

        const result = await createMeeting(meetingData);

        const [, options] = fetch.mock.calls[0];
        expect(options.method).toBe("POST");
        expect(JSON.parse(options.body)).toEqual(meetingData);
        expect(result[0].id).toBe(42);
    });

    test("throws on failure", async () => {
        fetch.mockResolvedValue({ ok: false, status: 400 });
        await expect(createMeeting({})).rejects.toThrow("400");
    });
});

describe("addOrganizer", () => {
    test("posts user and meeting id", async () => {
        fetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve([{ user_id: "user-1", meeting_id: 42 }])
        });

        await addOrganizer("user-1", 42);

        const [, options] = fetch.mock.calls[0];
        expect(options.method).toBe("POST");
        expect(JSON.parse(options.body)).toEqual({ user_id: "user-1", meeting_id: 42 });
    });

    test("throws on failure", async () => {
        fetch.mockResolvedValue({ ok: false, status: 403 });
        await expect(addOrganizer("user-1", 42)).rejects.toThrow("403");
    });
});

describe("renderCategoryOptions", () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <select id="category">
                <option value="">Select category</option>
            </select>
            <p id="status_message"></p>
        `;
    });

    test("adds options to the select", () => {
        renderCategoryOptions();
        const options = document.querySelectorAll("#category option");
        expect(options.length).toBeGreaterThan(1);
    });

    test("options have a valid id and name", () => {
        renderCategoryOptions();
        const options = Array.from(document.querySelectorAll("#category option")).filter(o => o.value !== "");
        options.forEach(opt => {
            expect(Number(opt.value)).toBeGreaterThan(0);
            expect(opt.textContent.length).toBeGreaterThan(0);
        });
    });
});

describe("showStatusMessage", () => {
    beforeEach(() => {
        document.body.innerHTML = `<p id="status_message"></p>`;
    });

    test("shows the message", () => {
        showStatusMessage("The meeting has been created.");
        expect(document.getElementById("status_message").textContent).toBe("The meeting has been created.");
    });

    test("green on success", () => {
        showStatusMessage("Done");
        expect(document.getElementById("status_message").style.color).toBe("green");
    });

    test("red on error", () => {
        showStatusMessage("Error", true);
        expect(document.getElementById("status_message").style.color).toBe("red");
    });
});
