import { expect, test } from "@playwright/test";

import { completeGuestCheckout } from "./helpers/app";
import { e2eCatalog } from "./helpers/test-data";

test.describe("Critical storefront flows", () => {
  test("guest can browse a category, open a product, add it to cart, and checkout with COD", async ({
    page,
  }) => {
    test.slow();

    const { orderNumber } = await completeGuestCheckout(page);

    await expect(page).toHaveURL(new RegExp(`/checkout/confirmation/${orderNumber}`));
    await expect(
      page.getByRole("heading", { name: new RegExp(`Order ${orderNumber}`) }),
    ).toBeVisible();
    await expect(page.getByText(e2eCatalog.productName)).toBeVisible();
  });
});
