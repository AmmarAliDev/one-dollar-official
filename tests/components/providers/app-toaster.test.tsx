// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const useThemeMock = vi.hoisted(() => vi.fn());
const toasterMock = vi.hoisted(() => vi.fn());

vi.mock("next-themes", () => ({
  useTheme: () => useThemeMock(),
}));

vi.mock("sonner", () => ({
  Toaster: (props: unknown) => {
    toasterMock(props);
    return <div data-testid="mock-sonner-toaster" />;
  },
}));

describe("AppToaster", () => {
  beforeEach(() => {
    useThemeMock.mockReset();
    toasterMock.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it("maps dark mode and applies theme-aware action button classes", async () => {
    useThemeMock.mockReturnValue({ resolvedTheme: "dark" });

    const { AppToaster } = await import("@/components/providers/app-toaster");

    render(<AppToaster />);

    expect(screen.getByTestId("mock-sonner-toaster")).toBeInTheDocument();
    expect(toasterMock).toHaveBeenCalledTimes(1);

    const toasterProps = toasterMock.mock.calls[0]?.[0] as {
      theme?: string;
      toastOptions?: {
        actionButtonStyle?: {
          background?: string;
          color?: string;
        };
        classNames?: {
          actionButton?: string;
          cancelButton?: string;
        };
      };
    };

    expect(toasterProps.theme).toBe("dark");
    expect(toasterProps.toastOptions?.classNames?.actionButton).toContain("bg-primary");
    expect(toasterProps.toastOptions?.classNames?.cancelButton).toContain("border");
  });

  it("maps non-dark mode to light theme", async () => {
    useThemeMock.mockReturnValue({ resolvedTheme: "system" });

    const { AppToaster } = await import("@/components/providers/app-toaster");

    render(<AppToaster />);

    const toasterProps = toasterMock.mock.calls[0]?.[0] as {
      theme?: string;
    };

    expect(toasterProps.theme).toBe("light");
  });
});
