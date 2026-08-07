// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ProductVariantPicker } from "@/features/catalog/components/product-variant-picker";

describe("product variant picker", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders image-based option controls and selects an option when its image is clicked", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(
      <ProductVariantPicker
        variantGroups={[
          {
            id: "color",
            name: "Color",
            options: [
              {
                id: "blue",
                label: "Blue",
                sku: "BLUE",
                inventoryQuantity: 5,
                imageUrl: "https://example.com/blue.jpg",
              },
              {
                id: "red",
                label: "Red",
                sku: "RED",
                inventoryQuantity: 5,
              },
            ],
          },
        ]}
        selectedOptionIds={{}}
        onSelect={onSelect}
      />,
    );

    const imageButton = screen.getByRole("button", { name: /select blue/i });
    await user.click(imageButton);

    expect(onSelect).toHaveBeenCalledWith("color", "blue");
  });
});
