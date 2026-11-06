import { describe, expect, it } from "vitest";
import { isSlotPast, manilaNow } from "./court-time";

describe("isSlotPast", () => {
  const now = { date: "2026-11-07", time: "19:00" };
  it("blocks a 6 PM slot at 7 PM the same day", () => {
    expect(isSlotPast("2026-11-07", "18:00", now)).toBe(true);
  });
  it("allows a later slot the same day", () => {
    expect(isSlotPast("2026-11-07", "20:00", now)).toBe(false);
  });
  it("allows any slot tomorrow", () => {
    expect(isSlotPast("2026-11-08", "06:00", now)).toBe(false);
  });
  it("uses Manila time (UTC+8)", () => {
    expect(manilaNow(Date.UTC(2026, 10, 6, 17, 0))).toEqual({ date: "2026-11-07", time: "01:00" });
  });
});
