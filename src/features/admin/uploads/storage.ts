import { put } from "@vercel/blob";

import { AppError } from "@/lib/errors/app-error";

import type { AdminImageUploadPurpose } from "./constants";
import { buildAdminImageUploadPath } from "./validation";

export type AdminImageUploadResult = {
  url: string;
  pathname: string;
  size: number;
  contentType: string;
};

export type AdminImageStorageUploadInput = {
  file: File;
  purpose: AdminImageUploadPurpose;
};

export interface AdminImageStorageProvider {
  upload(input: AdminImageStorageUploadInput): Promise<AdminImageUploadResult>;
}

class VercelBlobAdminImageStorageProvider implements AdminImageStorageProvider {
  async upload(input: AdminImageStorageUploadInput): Promise<AdminImageUploadResult> {
    const token = process.env.BLOB_READ_WRITE_TOKEN;

    if (!token) {
      throw new AppError("Image uploads are not configured.", "IMAGE_UPLOAD_NOT_CONFIGURED", {
        statusCode: 503,
        userMessage: "Image uploads are not configured yet. Ask a developer to add the blob storage token.",
      });
    }

    const pathname = buildAdminImageUploadPath({
      file: input.file,
      purpose: input.purpose,
    });

    const blob = await put(pathname, input.file, {
      access: "public",
      addRandomSuffix: false,
      cacheControlMaxAge: 31_536_000,
      contentType: input.file.type,
      token,
    });

    return {
      url: blob.url,
      pathname: blob.pathname,
      size: input.file.size,
      contentType: blob.contentType || input.file.type,
    };
  }
}

export function createAdminImageStorageProvider(): AdminImageStorageProvider {
  return new VercelBlobAdminImageStorageProvider();
}