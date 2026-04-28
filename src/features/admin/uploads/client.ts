import type { AdminImageUploadPurpose } from "./constants";
import { validateAdminImageFile } from "./validation";

export type UploadAdminImageResponse = {
  url: string;
  pathname: string;
  size: number;
  contentType: string;
};

type UploadAdminImageInput = {
  file: File;
  purpose: AdminImageUploadPurpose;
  fetchImpl?: typeof fetch;
  signal?: AbortSignal;
};

type UploadRouteResponse = {
  url?: unknown;
  pathname?: unknown;
  size?: unknown;
  contentType?: unknown;
  error?: unknown;
};

async function readJsonBody(response: Response): Promise<UploadRouteResponse | null> {
  try {
    return (await response.json()) as UploadRouteResponse;
  } catch {
    return null;
  }
}

export async function uploadAdminImage({ file, purpose, fetchImpl = fetch, signal }: UploadAdminImageInput) {
  const fileValidation = validateAdminImageFile(file);

  if (!fileValidation.success) {
    throw new Error(fileValidation.message);
  }

  const formData = new FormData();
  formData.set("purpose", purpose);
  formData.set("file", file);

  const requestInit: RequestInit = {
    method: "POST",
    body: formData,
    credentials: "same-origin",
    ...(signal ? { signal } : {}),
  };

  const response = await fetchImpl("/api/admin/uploads/images", {
    ...requestInit,
  });

  const payload = await readJsonBody(response);

  if (!response.ok) {
    const errorMessage = typeof payload?.error === "string"
      ? payload.error
      : "We could not upload that image right now. Try again or paste an existing image URL.";

    throw new Error(errorMessage);
  }

  if (
    typeof payload?.url !== "string"
    || typeof payload.pathname !== "string"
    || typeof payload.size !== "number"
    || typeof payload.contentType !== "string"
  ) {
    throw new Error("The upload service returned an unexpected response.");
  }

  return payload as UploadAdminImageResponse;
}