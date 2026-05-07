// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import type { ComponentPropsWithoutRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { BlogHighlightsSectionBlock } from "@/features/homepage/components/blog-highlights-section";
import type { BlogHighlightsSection } from "@/features/homepage/types";

vi.mock("next/image", () => ({
  default: function MockNextImage(props: ComponentPropsWithoutRef<"img">) {
    const { fill: _fill, ...imgProps } = props as ComponentPropsWithoutRef<"img"> & {
      fill?: boolean;
    };

    // eslint-disable-next-line jsx-a11y/alt-text
    return <img {...imgProps} />;
  },
}));

function buildSection(overrides: Partial<BlogHighlightsSection> = {}): BlogHighlightsSection {
  return {
    id: "blog-highlights",
    kind: "blog-highlights",
    title: "Blog highlights",
    description: "Latest stories",
    placeholderMessage: "No blog posts are available yet.",
    articles: [
      {
        id: "post-1",
        title: "Budget shopping checklist",
        excerpt: "Simple steps to cut weekly grocery waste.",
        href: "/blog/budget-shopping-checklist",
        image: {
          src: "https://cdn.example.com/blog/budget-shopping-checklist.jpg",
          alt: "Shopping basket with pantry items",
          width: 1200,
          height: 630,
        },
      },
    ],
    ...overrides,
  };
}

afterEach(() => {
  cleanup();
});

describe("BlogHighlightsSectionBlock", () => {
  it("renders each blog card as a full clickable link", () => {
    render(<BlogHighlightsSectionBlock section={buildSection()} />);

    const link = screen.getByRole("link", { name: "Read article: Budget shopping checklist" });
    expect(link).toHaveAttribute("href", "/blog/budget-shopping-checklist");
    expect(link).toContainElement(screen.getByText("Budget shopping checklist"));
    expect(link).toContainElement(screen.getByText("Read article"));
  });

  it("renders the blog image when available", () => {
    render(<BlogHighlightsSectionBlock section={buildSection()} />);

    const image = screen.getByRole("img", { name: "Shopping basket with pantry items" });
    expect(image).toHaveAttribute("src", "https://cdn.example.com/blog/budget-shopping-checklist.jpg");
    expect(image).toHaveAttribute("sizes", "(max-width: 767px) 100vw, 33vw");
  });

  it("renders a clean fallback when article image is missing", () => {
    render(
      <BlogHighlightsSectionBlock
        section={buildSection({
          articles: [
            {
              id: "post-2",
              title: "Weekly pantry rotation",
              excerpt: "Keep staples fresh and reduce spoilage.",
              href: "/blog/weekly-pantry-rotation",
            },
          ],
        })}
      />,
    );

    expect(screen.getByText("Blog image unavailable")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("renders an empty state when no articles exist", () => {
    render(<BlogHighlightsSectionBlock section={buildSection({ articles: [] })} />);

    expect(screen.getByText("No blog highlights yet")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Visit the blog" })).toHaveAttribute("href", "/blog");
  });
});
