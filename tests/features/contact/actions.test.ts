import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { db } from "@/lib/prisma";
import { notificationService } from "@/features/notifications";
import { submitContactForm } from "@/features/contact/actions";

// Mock dependencies
vi.mock("@/lib/prisma", () => ({
  db: {
    contactSubmission: {
      create: vi.fn(),
    },
  },
}));

vi.mock("@/features/notifications", () => ({
  notificationService: {
    dispatch: vi.fn(),
  },
}));

describe("submitContactForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("successfully submits valid contact form", async () => {
    const mockSubmission = {
      id: "test-id",
      fullName: "John Doe",
      email: "john@example.com",
      subject: "Product inquiry",
      message: "I have a question about your products.",
      createdAt: new Date(),
    };

    vi.mocked(db.contactSubmission.create).mockResolvedValue(mockSubmission);
    vi.mocked(notificationService.dispatch).mockResolvedValue({
      delivered: 2,
      failures: [],
    });

    const result = await submitContactForm({
      fullName: "John Doe",
      email: "john@example.com",
      subject: "Product inquiry",
      message: "I have a question about your products.",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.message).toContain("Thank you");
    }

    expect(db.contactSubmission.create).toHaveBeenCalledWith({
      data: {
        fullName: "John Doe",
        email: "john@example.com",
        subject: "Product inquiry",
        message: "I have a question about your products.",
      },
    });

    expect(notificationService.dispatch).toHaveBeenCalledWith({
      type: "contact.form-submitted",
      payload: {
        fullName: "John Doe",
        email: "john@example.com",
        subject: "Product inquiry",
        messagePreview: "I have a question about your products.",
      },
    });
  });

  it("truncates message preview to 150 characters", async () => {
    const longMessage = "a".repeat(200);

    const mockSubmission = {
      id: "test-id",
      fullName: "John Doe",
      email: "john@example.com",
      subject: "Product inquiry",
      message: longMessage,
      createdAt: new Date(),
    };

    vi.mocked(db.contactSubmission.create).mockResolvedValue(mockSubmission);
    vi.mocked(notificationService.dispatch).mockResolvedValue({
      delivered: 2,
      failures: [],
    });

    await submitContactForm({
      fullName: "John Doe",
      email: "john@example.com",
      subject: "Product inquiry",
      message: longMessage,
    });

    expect(notificationService.dispatch).toHaveBeenCalledWith({
      type: "contact.form-submitted",
      payload: {
        fullName: "John Doe",
        email: "john@example.com",
        subject: "Product inquiry",
        messagePreview: "a".repeat(150), // Truncated to 150
      },
    });
  });

  it("returns error for invalid input", async () => {
    const result = await submitContactForm({
      fullName: "J", // Too short
      email: "john@example.com",
      subject: "Product inquiry",
      message: "I have a question about your products.",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeTruthy();
    }

    expect(db.contactSubmission.create).not.toHaveBeenCalled();
  });

  it("succeeds even if notification dispatch fails", async () => {
    const mockSubmission = {
      id: "test-id",
      fullName: "John Doe",
      email: "john@example.com",
      subject: "Product inquiry",
      message: "I have a question about your products.",
      createdAt: new Date(),
    };

    vi.mocked(db.contactSubmission.create).mockResolvedValue(mockSubmission);
    vi.mocked(notificationService.dispatch).mockRejectedValue(new Error("Notification failed"));

    const result = await submitContactForm({
      fullName: "John Doe",
      email: "john@example.com",
      subject: "Product inquiry",
      message: "I have a question about your products.",
    });

    // Submission should still succeed
    expect(result.success).toBe(true);
    expect(db.contactSubmission.create).toHaveBeenCalled();
  });

  it("handles database errors gracefully", async () => {
    vi.mocked(db.contactSubmission.create).mockRejectedValue(new Error("Database error"));

    const result = await submitContactForm({
      fullName: "John Doe",
      email: "john@example.com",
      subject: "Product inquiry",
      message: "I have a question about your products.",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("Failed to submit");
    }
  });
});
