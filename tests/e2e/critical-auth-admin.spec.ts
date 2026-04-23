import { expect, test } from "@playwright/test";

import { completeGuestCheckout, signIn, signInAsAdmin } from "./helpers/app";
import { testIds } from "./helpers/selectors";
import { createE2ECustomer } from "./helpers/test-data";

test.describe("Critical auth and admin flows", () => {
  test("customer can sign up, sign out, and log back in", async ({ page }) => {
    const customer = createE2ECustomer();

    await page.goto("/auth/sign-up");
    await expect(page.getByTestId(testIds.auth.signUpForm)).toBeVisible();

    await page.locator("#sign-up-name").fill(customer.name);
    await page.locator("#sign-up-email").fill(customer.email);
    await page.locator("#sign-up-password").fill(customer.password);
    await page.locator("#sign-up-confirm").fill(customer.password);

    await Promise.all([
      page.waitForURL((url) => !url.pathname.startsWith("/auth/sign-up")),
      page.getByTestId(testIds.auth.signUpSubmit).click(),
    ]);

    await page.goto("/account/profile");
    await expect(page.getByRole("heading", { name: /profile details/i })).toBeVisible();
    await expect(page.getByText(customer.email)).toBeVisible();

    await Promise.all([
      page.waitForURL((url) => url.pathname === "/"),
      page.getByRole("button", { name: /sign out/i }).click(),
    ]);

    await signIn(page, {
      email: customer.email,
      password: customer.password,
      redirectTo: "/account/profile",
    });

    await expect(page.getByRole("heading", { name: /profile details/i })).toBeVisible();
    await expect(page.getByText(customer.email)).toBeVisible();
  });

  test("admin can sign in and update an order status", async ({ page }) => {
    test.slow();

    const { orderNumber } = await completeGuestCheckout(page);

    await signInAsAdmin(page);
    await page.getByLabel(/^search$/i).fill(orderNumber);
    await page.getByRole("button", { name: /apply/i }).click();

    const orderRow = page.getByTestId(testIds.admin.orderRow(orderNumber));
    await expect(orderRow).toContainText(orderNumber);
    await orderRow.getByRole("link", { name: /review/i }).click();

    await expect(page).toHaveURL(new RegExp(`/admin/orders/${orderNumber}`));
    await expect(page.getByTestId(testIds.admin.orderStatusForm)).toBeVisible();

    const statusSelect = page.getByTestId(testIds.admin.orderStatusSelect);
    await expect(statusSelect).toBeVisible();
    const nextStatus = await statusSelect.inputValue();
    const escapedNextStatus = nextStatus.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");

    await page.getByTestId(testIds.admin.orderStatusSubmit).click();

    await expect(page.getByText(/order status updated successfully/i)).toBeVisible();
    await expect(page.getByText(new RegExp(escapedNextStatus, "i")).first()).toBeVisible();
  });
});
