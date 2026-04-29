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

function mockMatchMedia(matches: boolean) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation(() => ({
      matches,
      media: "(min-width: 1024px)",
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
    <SidebarProvider defaultOpenDesktop>
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
    mockMatchMedia(true)
    const user = userEvent.setup()

    render(<TestSidebarHarness />)

    expect(screen.getByLabelText("Test sidebar")).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Toggle sidebar" }))

    expect(screen.queryByLabelText("Test sidebar")).not.toBeInTheDocument()
  })

  it("supports mobile open and close behavior", async () => {
    mockMatchMedia(false)
    const user = userEvent.setup()

    render(<TestSidebarHarness />)

    expect(screen.queryByLabelText("Test sidebar")).not.toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Toggle sidebar" }))
    expect(screen.getByLabelText("Test sidebar")).toBeInTheDocument()

    await user.click(screen.getAllByRole("button", { name: "Close sidebar" })[0])
    expect(screen.queryByLabelText("Test sidebar")).not.toBeInTheDocument()
  })
})
