import { describe, expect, it } from "vitest";

import {
  buildRevenueRecentPeriodRanges,
  getRecentPeriodDateRange,
} from "@/features/admin/revenue";

describe("admin revenue date ranges", () => {
  it("builds a recent period range anchored to UTC day start", () => {
    const now = new Date("2026-04-24T10:30:00.000Z");

    const range = getRecentPeriodDateRange(7, now);

    expect(range.startAt.toISOString()).toBe("2026-04-18T00:00:00.000Z");
    expect(range.endAt.toISOString()).toBe("2026-04-24T10:30:00.000Z");
  });

  it("exposes practical default reporting windows", () => {
    const now = new Date("2026-04-24T10:30:00.000Z");

    const periods = buildRevenueRecentPeriodRanges(now);

    expect(periods).toHaveLength(2);
    expect(periods[0]).toMatchObject({
      key: "last7Days",
      label: "Last 7 days",
    });
    expect(periods[1]).toMatchObject({
      key: "last30Days",
      label: "Last 30 days",
    });
  });

  it("rejects invalid recent period input", () => {
    expect(() => getRecentPeriodDateRange(0)).toThrowError(
      "Recent period days must be a positive number.",
    );
  });
});
