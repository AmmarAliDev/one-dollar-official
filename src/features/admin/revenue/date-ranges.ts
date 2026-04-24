export type RevenueRecentPeriodKey = "last7Days" | "last30Days";

export type RevenueDateRange = {
  startAt: Date;
  endAt: Date;
};

export type RevenueRecentPeriodRange = {
  key: RevenueRecentPeriodKey;
  label: string;
  range: RevenueDateRange;
};

function startOfUtcDay(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export function getRecentPeriodDateRange(days: number, now = new Date()): RevenueDateRange {
  if (!Number.isFinite(days) || days < 1) {
    throw new RangeError("Recent period days must be a positive number.");
  }

  const normalizedDays = Math.floor(days);
  const startAnchor = new Date(now);
  startAnchor.setUTCDate(startAnchor.getUTCDate() - (normalizedDays - 1));

  return {
    startAt: startOfUtcDay(startAnchor),
    endAt: now,
  };
}

export function buildRevenueRecentPeriodRanges(now = new Date()): RevenueRecentPeriodRange[] {
  return [
    {
      key: "last7Days",
      label: "Last 7 days",
      range: getRecentPeriodDateRange(7, now),
    },
    {
      key: "last30Days",
      label: "Last 30 days",
      range: getRecentPeriodDateRange(30, now),
    },
  ];
}
