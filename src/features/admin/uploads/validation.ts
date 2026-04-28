import { z } from "zod";

import { AppError } from "@/lib/errors/app-error";

import {
  ADMIN_IMAGE_UPLOAD_MAX_BYTES,
  adminImageUploadMimeTypes,
  adminImageUploadPurposes,
  formatImageUploadSize,
} from "./constants";

export const adminImageUploadRequestSchema = z.object({
  purpose: z.enum(adminImageUploadPurposes),
});

type ImageUploadValidationResult =
  | { success: true }
  | { success: false; message: string };

export function validateAdminImageFile(file: unknown): ImageUploadValidationResult {
  if (!(file instanceof File)) {
    return {
      success: false,
      message: "Choose an image file before uploading.",
    };
  }

  if (file.size <= 0) {
    return {
      success: false,
      message: "The selected image is empty. Choose a different file.",
    };
  }

  if (!adminImageUploadMimeTypes.includes(file.type as (typeof adminImageUploadMimeTypes)[number])) {
    return {
      success: false,
      message: "Upload a JPG, PNG, WEBP, AVIF, or GIF image.",
    };
  }

  if (file.size > ADMIN_IMAGE_UPLOAD_MAX_BYTES) {
    return {
      success: false,
      message: `Images must be ${formatImageUploadSize(ADMIN_IMAGE_UPLOAD_MAX_BYTES)} or smaller.`,
    };
  }

  return { success: true };
}

export function assertValidAdminImageFile(file: unknown): asserts file is File {
  const validation = validateAdminImageFile(file);

  if (!validation.success) {
    throw new AppError("Image upload validation failed.", "IMAGE_UPLOAD_VALIDATION_ERROR", {
      statusCode: 400,
      userMessage: validation.message,
    });
  }
}

function sanitizeFileSegment(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

function inferFileExtension(file: File) {
  const normalizedName = file.name.trim().toLowerCase();
  const extensionFromName = normalizedName.includes(".") ? normalizedName.split(".").pop() : undefined;

  if (extensionFromName && /^[a-z0-9]{2,5}$/.test(extensionFromName)) {
    return extensionFromName;
  }

  switch (file.type) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/avif":
      return "avif";
    case "image/gif":
      return "gif";
    default:
      return "bin";
  }
}

export function buildAdminImageUploadPath(input: {
  file: File;
  purpose: z.infer<typeof adminImageUploadRequestSchema>["purpose"];
}) {
  const date = new Date();
  const year = `${date.getUTCFullYear()}`;
  const month = `${date.getUTCMonth() + 1}`.padStart(2, "0");
  const extension = inferFileExtension(input.file);
  const baseNameSource = input.file.name.replace(/\.[^.]+$/, "").trim() || input.purpose;
  const baseName = sanitizeFileSegment(baseNameSource) || input.purpose;
  const uniqueSuffix = crypto.randomUUID().slice(0, 8);

  return `admin/${input.purpose}/${year}/${month}/${baseName}-${uniqueSuffix}.${extension}`;
}