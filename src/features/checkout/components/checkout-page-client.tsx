"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormErrorSummary } from "@/components/ui/form-error-summary";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PriceDisplay } from "@/components/ui/price-display";
import type { CartSummary } from "@/features/cart";
import { CHECKOUT_SUPPORTED_CITY, checkoutPayloadSchema, type CheckoutPaymentMethodDefinition } from "@/features/checkout";
import { notify } from "@/lib/notify";

type CheckoutPageClientProps = {
  cart: CartSummary;
  shipping: number;
  allowSubmit: boolean;
  paymentMethods: CheckoutPaymentMethodDefinition[];
  initialCustomer: {
    fullName: string;
    email: string;
    phone: string;
  };
};

type CheckoutFormState = {
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  province: string;
  country: string;
  postcode: string;
  paymentMethod: CheckoutPaymentMethodDefinition["code"];
  notes: string;
};

export function CheckoutPageClient({
  cart,
  shipping,
  allowSubmit,
  paymentMethods,
  initialCustomer,
}: CheckoutPageClientProps) {
  const defaultPaymentMethod = paymentMethods[0]?.code ?? "COD";

  const [form, setForm] = useState<CheckoutFormState>({
    fullName: initialCustomer.fullName,
    email: initialCustomer.email,
    phone: initialCustomer.phone,
    addressLine1: "",
    addressLine2: "",
    city: CHECKOUT_SUPPORTED_CITY,
    province: "",
    country: "Pakistan",
    postcode: "",
    paymentMethod: defaultPaymentMethod,
    notes: "",
  });
  const [pending, setPending] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [retryPayload, setRetryPayload] = useState<unknown | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const totals = useMemo(
    () => ({
      subtotal: cart.subtotal,
      shipping,
      total: cart.subtotal + shipping,
    }),
    [cart.subtotal, shipping],
  );

  async function submitCheckout(payload: unknown) {
    if (pending || submitted) {
      return;
    }

    // Validate payload before sending. If invalid, report errors and do not set retryPayload
    const parsedPayload = checkoutPayloadSchema.safeParse(payload);
    if (!parsedPayload.success) {
      setErrors(parsedPayload.error.issues.map((issue) => issue.message));
      return;
    }

    setPending(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parsedPayload.data),
      });

      const responsePayload = (await response.json().catch(() => null)) as
        | {
            error?: string;
            checkout?: {
              payment: { message: string };
              totals: { total: number };
            };
          }
        | null;

      if (!response.ok) {
        throw new Error(responsePayload?.error ?? "Checkout could not be submitted. Please try again.");
      }

      const paymentMessage = responsePayload?.checkout?.payment?.message ?? "Checkout accepted.";
      const total = responsePayload?.checkout?.totals?.total ?? totals.total;

      const message = `${paymentMessage} Total payable: PKR ${total.toLocaleString("en-PK")}.`;

      setErrors([]);
      setRetryPayload(null);
      setSuccessMessage(message);
      notify.success("Checkout submitted", paymentMessage);
      setSubmitted(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Checkout could not be submitted. Please retry.";
      setSuccessMessage(null);
      setErrors([message]);
      // Only populate retryPayload for transient/network failures using the validated payload
      setRetryPayload(parsedPayload.data);
      notify.error("Checkout failed", message);
    } finally {
      setPending(false);
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSuccessMessage(null);
    if (submitted) {
      return;
    }

    const payload = {
      cartId: cart.id,
      customer: {
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
      },
      shippingAddress: {
        addressLine1: form.addressLine1,
        ...(form.addressLine2.trim().length > 0 ? { addressLine2: form.addressLine2 } : {}),
        city: form.city,
        ...(form.province.trim().length > 0 ? { province: form.province } : {}),
        country: form.country,
        postcode: form.postcode,
      },
      paymentMethod: form.paymentMethod,
      ...(form.notes.trim().length > 0 ? { notes: form.notes } : {}),
    };

    const parsed = checkoutPayloadSchema.safeParse(payload);

    if (!parsed.success) {
      setErrors(parsed.error.issues.map((issue) => issue.message));
      return;
    }

    setErrors([]);
    void submitCheckout(parsed.data);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        <FormErrorSummary errors={errors} title="Checkout details need attention" />

        {successMessage ? (
          <Card className="border-emerald-500/40 bg-emerald-500/5">
            <CardContent className="p-4 text-sm text-emerald-800 dark:text-emerald-200">{successMessage}</CardContent>
          </Card>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>Customer info</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="checkout-full-name">Full name</Label>
              <Input
                id="checkout-full-name"
                autoComplete="name"
                value={form.fullName}
                onChange={(event) => setForm((prev) => ({ ...prev, fullName: event.target.value }))}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="checkout-email">Email</Label>
              <Input
                id="checkout-email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="checkout-phone">Phone</Label>
              <Input
                id="checkout-phone"
                type="tel"
                autoComplete="tel"
                placeholder="03xx xxxxxxx"
                value={form.phone}
                onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
                required
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Shipping address</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="checkout-address-line-1">Address line 1</Label>
              <Input
                id="checkout-address-line-1"
                autoComplete="address-line1"
                placeholder="House, street, area"
                value={form.addressLine1}
                onChange={(event) => setForm((prev) => ({ ...prev, addressLine1: event.target.value }))}
                required
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="checkout-address-line-2">Address line 2 (optional)</Label>
              <Input
                id="checkout-address-line-2"
                autoComplete="address-line2"
                placeholder="Apartment, landmark"
                value={form.addressLine2}
                onChange={(event) => setForm((prev) => ({ ...prev, addressLine2: event.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="checkout-province">Province / State (optional)</Label>
              <Input
                id="checkout-province"
                value={form.province}
                onChange={(event) => setForm((prev) => ({ ...prev, province: event.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="checkout-city">City</Label>
              <Input
                id="checkout-city"
                value={form.city}
                onChange={(event) => setForm((prev) => ({ ...prev, city: event.target.value }))}
                readOnly
              />
              <p className="text-xs text-muted-foreground">Delivery is currently available only in Karachi.</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="checkout-postcode">Postal code</Label>
              <Input
                id="checkout-postcode"
                value={form.postcode}
                onChange={(event) => setForm((prev) => ({ ...prev, postcode: event.target.value }))}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="checkout-country">Country</Label>
              <Input id="checkout-country" value={form.country} readOnly />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment method</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {paymentMethods.map((method) => (
              <label
                key={method.code}
                className="flex cursor-pointer items-start gap-3 rounded-[var(--radius)] border border-border/70 p-3"
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method.code}
                  checked={form.paymentMethod === method.code}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      paymentMethod: event.target.value as CheckoutPaymentMethodDefinition["code"],
                    }))
                  }
                />
                <span className="space-y-0.5 text-sm">
                  <span className="block font-medium text-foreground">{method.label}</span>
                  <span className="block text-muted-foreground">{method.description}</span>
                </span>
              </label>
            ))}

            <div className="space-y-1.5">
              <Label htmlFor="checkout-notes">Order notes (optional)</Label>
              <Input
                id="checkout-notes"
                value={form.notes}
                onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
                placeholder="Any delivery instructions"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" size="lg" disabled={pending || submitted || !allowSubmit}>
            {pending ? "Submitting..." : "Confirm checkout details"}
          </Button>

          {retryPayload ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => void submitCheckout(retryPayload)}
              disabled={pending || submitted || !allowSubmit}
            >
              Retry last attempt
            </Button>
          ) : null}
        </div>
      </form>

      <Card className="h-fit">
        <CardHeader>
          <CardTitle>Order summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Items</span>
            <span>{cart.itemCount}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <PriceDisplay amount={totals.subtotal} size="sm" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Shipping</span>
            <PriceDisplay amount={totals.shipping} size="sm" />
          </div>
          <div className="flex items-center justify-between border-t border-border/70 pt-3 font-semibold">
            <span>Total</span>
            <PriceDisplay amount={totals.total} size="sm" />
          </div>
          <p className="text-xs text-muted-foreground">Shipping is fixed at PKR 250 for Karachi deliveries.</p>
        </CardContent>
      </Card>
    </div>
  );
}
