// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { AdminSidebarNav } from "@/features/admin/components/admin-sidebar-nav"
import { getVisibleAdminNavigation } from "@/features/admin/navigation"
import { RoleKey } from "@/lib/auth/roles"

let mockedPathname = "/admin"

vi.mock("next/navigation", () => ({
  usePathname: () => mockedPathname,
}))

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: import("react").ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))
afterEach(() => {
  cleanup()
  mockedPathname = "/admin"
})

describe("AdminSidebarNav", () => {
  it("renders role-visible items and marks the active route", () => {
    mockedPathname = "/admin/orders"
    const items = getVisibleAdminNavigation(RoleKey.ORDER_MANAGER)

    render(<AdminSidebarNav items={items} />)

    const activeLink = screen.getByRole("link", { name: /orders/i })

    expect(activeLink).toHaveAttribute("aria-current", "page")
    expect(screen.queryByRole("link", { name: /settings/i })).not.toBeInTheDocument()
  })

  it("shows a user-friendly empty state when no nav items are provided", () => {
    render(<AdminSidebarNav items={[]} />)

    expect(screen.getByRole("status")).toHaveTextContent("No navigation items are available for this role yet.")
  })
})
