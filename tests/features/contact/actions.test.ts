import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { submitContactForm } from "@/features/contact/actions";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const prismaMock = vi.hoisted(() => ({
  contactSubmission: {
    create: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({
  getPrismaClient: () => prismaMock,
}));

const notificationServiceMock = vi.hoisted(() => ({
  dispatch: vi.fn(),
}));

vi.mock("@/features/notifications", () => ({
  getNotificationService: () => notificationServiceMock,
  notificationEventTypes: { contactFormSubmitted: "contact.form-submitted" },
}));

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

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

    prismaMock.contactSubmission.create.mockResolvedValue(mockSubmission);
    notificationServiceMock.dispatch.mockResolvedValue({
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

    expect(prismaMock.contactSubmission.create).toHaveBeenCalledWith({
      data: {
        fullName: "John Doe",
        email: "john@example.com",
        subject: "Product inquiry",
        message: "I have a question about your products.",
      },
    });

    expect(notificationServiceMock.dispatch).toHaveBeenCalledWith({
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

    prismaMock.contactSubmission.create.mockResolvedValue(mockSubmission);
    notificationServiceMock.dispatch.mockResolvedValue({
      delivered: 2,
      failures: [],
    });

    await submitContactForm({
      fullName: "John Doe",
      email: "john@example.com",
      subject: "Product inquiry",
      message: longMessage,
    });

    expect(notificationServiceMock.dispatch).toHaveBeenCalledWith({
      type: "contact.form-submitted",
      payload: {
        fullName: "John Doe",
        email: "john@example.com",
        subject: "Product inquiry",
        messagePreview: "a".repeat(150),
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

    expect(prismaMock.contactSubmission.create).not.toHaveBeenCalled();
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

    prismaMock.contactSubmission.create.mockResolvedValue(mockSubmission);
    notificationServiceMock.dispatch.mockRejectedValue(new Error("Notification failed"));

    const result = await submitContactForm({
      fullName: "John Doe",
      email: "john@example.com",
      subject: "Product inquiry",
      message: "I have a question about your products.",
    });

    // Submission should still succeed
    expect(result.success).toBe(true);
    expect(prismaMock.contactSubmission.create).toHaveBeenCalled();
  });

  it("handles database errors gracefully", async () => {
    prismaMock.contactSubmission.create.mockRejectedValue(new Error("Database error"));

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
