import { describe, expect, it } from "vitest";
import { relativeDate, startOfParisDay } from "./format";

describe("relativeDate", () => {
  const now = new Date("2026-11-04T12:00:00Z");
  it("formats recent dates in French", () => {
    expect(relativeDate("2026-11-04T11:59:40Z", now)).toBe("à l'instant");
    expect(relativeDate("2026-11-04T11:30:00Z", now)).toBe("il y a 30 min");
    expect(relativeDate("2026-11-04T09:00:00Z", now)).toBe("il y a 3 h");
    expect(relativeDate("2026-11-03T10:00:00Z", now)).toBe("hier");
    expect(relativeDate("2026-11-01T12:00:00Z", now)).toBe("il y a 3 j");
  });
});

describe("startOfParisDay", () => {
  it("handles winter time (UTC+1)", () => {
    expect(startOfParisDay(new Date("2026-11-04T12:00:00Z"))).toBe("2026-11-03T23:00:00.000Z");
  });
  it("handles summer time (UTC+2)", () => {
    expect(startOfParisDay(new Date("2026-07-14T12:00:00Z"))).toBe("2026-07-13T22:00:00.000Z");
  });
  it("uses the Paris date, not the UTC date, just after midnight", () => {
    expect(startOfParisDay(new Date("2026-11-04T23:30:00Z"))).toBe("2026-11-04T23:00:00.000Z");
  });
});
