// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

describe("mobile form control ergonomics", () => {
  it("keeps mobile-safe text sizing while preserving desktop sizing classes", () => {
    render(
      <div>
        <Input aria-label="Email" type="email" />
        <Textarea aria-label="Notes" />
      </div>,
    );

    const input = screen.getByLabelText("Email");
    const textarea = screen.getByLabelText("Notes");

    expect(input).toHaveClass("text-base");
    expect(input).toHaveClass("md:text-sm");
    expect(textarea).toHaveClass("text-base");
    expect(textarea).toHaveClass("md:text-sm");
  });
});
