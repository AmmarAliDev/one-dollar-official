// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { SectionHeader } from "@/components/ui/section-header";

afterEach(() => {
  cleanup();
});

describe("SectionHeader", () => {
  it("renders an h1 when titleAs is set to h1", () => {
    render(
      <SectionHeader
        title="Blog"
        titleAs="h1"
        titleId="blog-heading"
        description="Latest updates"
      />,
    );

    const heading = screen.getByRole("heading", { level: 1, name: "Blog" });
    expect(heading).toHaveAttribute("id", "blog-heading");
  });

  it("keeps h2 as the default heading level", () => {
    render(<SectionHeader title="Catalog" />);

    expect(screen.getByRole("heading", { level: 2, name: "Catalog" })).toBeInTheDocument();
  });
});
