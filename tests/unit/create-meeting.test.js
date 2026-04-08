import { describe, test, expect } from "vitest";
import { CATEGORIES } from "../../src/scripts/create-meeting-logic.js";

describe("CATEGORIES", () => {
    test("is not empty", () => {
        expect(Array.isArray(CATEGORIES)).toBe(true);
        expect(CATEGORIES.length).toBeGreaterThan(0);
    });

    test("each category has an id and a name", () => {
        CATEGORIES.forEach(cat => {
            expect(typeof cat.id).toBe("number");
            expect(typeof cat.name).toBe("string");
            expect(cat.name.length).toBeGreaterThan(0);
        });
    });

    test("no duplicate ids", () => {
        const ids = CATEGORIES.map(c => c.id);
        const uniqueIds = new Set(ids);
        expect(uniqueIds.size).toBe(ids.length);
    });

    test("no duplicate names", () => {
        const names = CATEGORIES.map(c => c.name);
        const uniqueNames = new Set(names);
        expect(uniqueNames.size).toBe(names.length);
    });
});
