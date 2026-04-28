import { describe, expect, it, vi } from "vitest";

import { uploadAdminImage } from "@/features/admin/uploads";

describe("admin image upload client helper", () => {
  it("posts form data and returns the uploaded asset metadata", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          url: "https://store.public.blob.vercel-storage.com/admin/banner/banner-123.png",
          pathname: "admin/banner/banner-123.png",
          size: 1024,
          contentType: "image/png",
        }),
        {
          status: 201,
          headers: {
            "Content-Type": "application/json",
          },
        },
      ),
    );
    const file = new File(["banner"], "banner.png", { type: "image/png" });

    const result = await uploadAdminImage({
      file,
      purpose: "banner",
      fetchImpl: fetchMock,
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, request] = fetchMock.mock.calls[0] ?? [];
    expect(url).toBe("/api/admin/uploads/images");
    expect(request?.method).toBe("POST");
    expect(request?.credentials).toBe("same-origin");
    expect(request?.body).toBeInstanceOf(FormData);
    expect((request?.body as FormData).get("purpose")).toBe("banner");
    expect((request?.body as FormData).get("file")).toBe(file);

    expect(result).toMatchObject({
      url: "https://store.public.blob.vercel-storage.com/admin/banner/banner-123.png",
      pathname: "admin/banner/banner-123.png",
      size: 1024,
      contentType: "image/png",
    });
  });

  it("surfaces the route error message for failed uploads", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ error: "Upload storage is unavailable right now." }), {
        status: 503,
        headers: {
          "Content-Type": "application/json",
        },
      }),
    );

    await expect(
      uploadAdminImage({
        file: new File(["banner"], "banner.png", { type: "image/png" }),
        purpose: "banner",
        fetchImpl: fetchMock,
      }),
    ).rejects.toThrow(/storage is unavailable/i);
  });
});