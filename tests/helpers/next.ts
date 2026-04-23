/**
 * Helpers for mocking common Next.js internals in unit tests.
 *
 * These return pre-configured `vi.fn()` objects. Call them inside
 * `vi.hoisted()` and wire them up via `vi.mock()` in your test file:
 *
 * ```ts
 * import { mockNextHeaders, mockNextNavigation } from "@tests/helpers/next";
 *
 * const { headers, cookies } = vi.hoisted(() => mockNextHeaders());
 * vi.mock("next/headers", () => ({ headers, cookies }));
 *
 * const nav = vi.hoisted(() => mockNextNavigation());
 * vi.mock("next/navigation", () => nav);
 * ```
 */
import { vi } from "vitest";

// ---------------------------------------------------------------------------
// next/headers
// ---------------------------------------------------------------------------

export function mockNextHeaders() {
  const headersInstance = {
    get: vi.fn().mockReturnValue(null),
    has: vi.fn().mockReturnValue(false),
    entries: vi.fn().mockReturnValue([]),
    forEach: vi.fn(),
  };

  const cookiesInstance = {
    get: vi.fn().mockReturnValue(undefined),
    getAll: vi.fn().mockReturnValue([]),
    has: vi.fn().mockReturnValue(false),
    set: vi.fn(),
    delete: vi.fn(),
  };

  return {
    headers: vi.fn().mockReturnValue(headersInstance),
    cookies: vi.fn().mockReturnValue(cookiesInstance),
    headersInstance,
    cookiesInstance,
  };
}

// ---------------------------------------------------------------------------
// next/navigation
// ---------------------------------------------------------------------------

export function mockNextNavigation() {
  return {
    useRouter: vi.fn().mockReturnValue({
      push: vi.fn(),
      replace: vi.fn(),
      refresh: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      prefetch: vi.fn(),
    }),
    usePathname: vi.fn().mockReturnValue("/"),
    useSearchParams: vi.fn().mockReturnValue(new URLSearchParams()),
    useParams: vi.fn().mockReturnValue({}),
    redirect: vi.fn(),
    notFound: vi.fn(),
  };
}

// ---------------------------------------------------------------------------
// DOM environment stubs (call in beforeAll for jsdom tests)
// ---------------------------------------------------------------------------

/**
 * Sets up stubs required by Radix UI components in jsdom.
 * Call inside `beforeAll()` in any `// @vitest-environment jsdom` test file.
 *
 * @example
 * beforeAll(() => setupDomStubs());
 */
export function setupDomStubs() {
  if (typeof window === "undefined") return;

  if (!window.ResizeObserver) {
    window.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }

  if (!window.PointerEvent) {
    window.PointerEvent = class PointerEvent extends MouseEvent {} as unknown as typeof PointerEvent;
  }

  if (!window.HTMLElement.prototype.hasPointerCapture) {
    window.HTMLElement.prototype.hasPointerCapture = () => false;
  }

  if (!window.HTMLElement.prototype.scrollIntoView) {
    window.HTMLElement.prototype.scrollIntoView = () => {};
  }
}
