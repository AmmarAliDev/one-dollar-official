import { describe, expect, it } from "vitest";

import { checkRateLimit } from "../../../src/lib/rate-limit";

describe("checkRateLimit", () => {
  it("allows the first request", async () => {
    const result = await checkRateLimit({
      identifier: "test-ip-1",
      action: "test:action-1",
      limit: 3,
      windowMs: 60_000,
    });
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(2);
  });

  it("blocks a request after the limit is exceeded", async () => {
    const options = { identifier: "test-ip-2", action: "test:action-2", limit: 2, windowMs: 60_000 };

    await checkRateLimit(options); // 1st
    await checkRateLimit(options); // 2nd — hits limit
    const blocked = await checkRateLimit(options); // 3rd — should be blocked

    expect(blocked.success).toBe(false);
    expect(blocked.remaining).toBe(0);
  });

  it("uses separate windows per action key", async () => {
    const ip = "test-ip-3";

    const r1 = await checkRateLimit({ identifier: ip, action: "action-A", limit: 1, windowMs: 60_000 });
    const r2 = await checkRateLimit({ identifier: ip, action: "action-B", limit: 1, windowMs: 60_000 });

    // Both first requests should succeed because they use different action keys.
    expect(r1.success).toBe(true);
    expect(r2.success).toBe(true);
  });

  it("returns a reset date in the future", async () => {
    const before = Date.now();
    const result = await checkRateLimit({
      identifier: "test-ip-4",
      action: "test:action-4",
      limit: 5,
      windowMs: 30_000,
    });
    expect(result.reset.getTime()).toBeGreaterThan(before);
  });
});
