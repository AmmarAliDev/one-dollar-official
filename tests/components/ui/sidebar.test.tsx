// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import {
  Sidebar,
  SidebarContent,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

function mockViewport(width: number) {
  Object.defineProperty(window, "innerWidth", {
    writable: true,
    configurable: true,
    value: width,
  })

  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: query.includes("max-width") ? width < 768 : width >= 1024,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
}

function TestSidebarHarness() {
  return (
    <SidebarProvider defaultOpen>
      <Sidebar aria-label="Test sidebar">
        <SidebarContent>Sidebar links</SidebarContent>
      </Sidebar>
      <SidebarInset>
        <SidebarTrigger />
        <main>Page content</main>
      </SidebarInset>
    </SidebarProvider>
  )
}

afterEach(() => {
  cleanup()
})

describe("Sidebar primitives", () => {
  it("supports desktop hide/show from the trigger", async () => {
    mockViewport(1280)
    const user = userEvent.setup()

    render(<TestSidebarHarness />)

    const sidebarRoot = document.querySelector('[data-slot="sidebar"][data-side="left"]')

    expect(sidebarRoot).toHaveAttribute("data-state", "expanded")

    await user.click(screen.getByRole("button", { name: "Toggle Sidebar" }))

    expect(sidebarRoot).toHaveAttribute("data-state", "collapsed")
  })

  it("supports mobile open and close behavior", async () => {
    mockViewport(375)
    const user = userEvent.setup()

    render(<TestSidebarHarness />)

    expect(screen.queryByRole("dialog", { name: "Sidebar" })).not.toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Toggle Sidebar" }))
    expect(screen.getByRole("dialog", { name: "Sidebar" })).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Close" }))
    expect(screen.queryByRole("dialog", { name: "Sidebar" })).not.toBeInTheDocument()
  })
})
