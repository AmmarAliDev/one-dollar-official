import { describe, expect, it, vi } from "vitest";

import {
  ADMIN_IMAGE_UPLOAD_MAX_BYTES,
  buildAdminImageUploadPath,
  validateAdminImageFile,
} from "@/features/admin/uploads";

describe("admin image upload validation", () => {
  it("accepts supported image files within the size limit", () => {
    const result = validateAdminImageFile(new File(["ok"], "hero.png", { type: "image/png" }));

    expect(result).toEqual({ success: true });
  });

  it("rejects unsupported mime types", () => {
    const result = validateAdminImageFile(new File(["<svg />"], "icon.svg", { type: "image/svg+xml" }));

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.message).toMatch(/jpg, png, webp, avif, or gif/i);
    }
  });

  it("rejects images above the server upload size budget", () => {
    const oversized = new File([new Uint8Array(ADMIN_IMAGE_UPLOAD_MAX_BYTES + 1)], "oversized.png", {
      type: "image/png",
    });
    const result = validateAdminImageFile(oversized);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.message).toMatch(/4.0 MB or smaller/i);
    }
  });

  it("builds stable purpose-scoped paths for blob storage", () => {
    const randomUuidSpy = vi.spyOn(globalThis.crypto, "randomUUID").mockReturnValue("12345678-1234-1234-1234-123456789abc");

    const pathname = buildAdminImageUploadPath({
      file: new File(["banner"], " Weekend Banner!!.png ", { type: "image/png" }),
      purpose: "banner",
    });

    expect(pathname).toMatch(/^admin\/banner\/\d{4}\/\d{2}\/weekend-banner-12345678\.png$/);

    randomUuidSpy.mockRestore();
  });
});