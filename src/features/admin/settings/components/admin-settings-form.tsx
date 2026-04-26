"use client";

import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type { AdminStoreSettingsRecord } from "../service";

type AdminSettingsFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  returnTo: string;
  initialValues: AdminStoreSettingsRecord;
};

function SaveSettingsButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} aria-busy={pending}>
      {pending ? "Saving..." : "Save settings"}
    </Button>
  );
}

function emptyString(value: string | undefined) {
  return value ?? "";
}

export function AdminSettingsForm({ action, returnTo, initialValues }: AdminSettingsFormProps) {
  return (
    <form action={action} className="space-y-8" noValidate>
      <input type="hidden" name="returnTo" value={returnTo} />

      <section className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-base font-semibold">Store identity basics</h3>
          <p className="text-sm text-muted-foreground">Core naming details used across customer touchpoints.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="storeName">Store name</Label>
            <Input id="storeName" name="storeName" maxLength={120} required defaultValue={initialValues.storeName} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="storeTagline">Tagline</Label>
            <Input
              id="storeTagline"
              name="storeTagline"
              maxLength={160}
              defaultValue={emptyString(initialValues.storeTagline)}
              placeholder="Everyday essentials, fairly priced"
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-base font-semibold">Support contact info</h3>
          <p className="text-sm text-muted-foreground">Public support channels for customer care and escalation.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="supportEmail">Support email</Label>
            <Input
              id="supportEmail"
              name="supportEmail"
              type="email"
              required
              maxLength={320}
              defaultValue={initialValues.supportEmail}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="supportPhone">Support phone</Label>
            <Input
              id="supportPhone"
              name="supportPhone"
              maxLength={20}
              defaultValue={emptyString(initialValues.supportPhone)}
              placeholder="+92 300 1234567"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="supportWhatsapp">WhatsApp support</Label>
            <Input
              id="supportWhatsapp"
              name="supportWhatsapp"
              maxLength={20}
              defaultValue={emptyString(initialValues.supportWhatsapp)}
              placeholder="+92 300 1234567"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="supportHours">Support hours</Label>
            <Input
              id="supportHours"
              name="supportHours"
              maxLength={160}
              defaultValue={emptyString(initialValues.supportHours)}
              placeholder="Mon-Sat, 9:00 AM to 6:00 PM"
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-base font-semibold">Shipping basics</h3>
          <p className="text-sm text-muted-foreground">Baseline defaults for local shipping and dispatch communication.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="shippingOriginCity">Origin city</Label>
            <Input
              id="shippingOriginCity"
              name="shippingOriginCity"
              maxLength={80}
              required
              defaultValue={initialValues.shippingOriginCity}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dispatchLeadTimeDays">Dispatch lead time (days)</Label>
            <Input
              id="dispatchLeadTimeDays"
              name="dispatchLeadTimeDays"
              type="number"
              min={0}
              max={365}
              required
              defaultValue={initialValues.dispatchLeadTimeDays}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="shippingFlatRate">Flat shipping fee (PKR)</Label>
            <Input
              id="shippingFlatRate"
              name="shippingFlatRate"
              type="number"
              min={0}
              max={1000000}
              required
              defaultValue={initialValues.shippingFlatRate}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="shippingFreeThreshold">Free-shipping threshold (PKR, optional)</Label>
            <Input
              id="shippingFreeThreshold"
              name="shippingFreeThreshold"
              type="number"
              min={0}
              max={10000000}
              defaultValue={initialValues.shippingFreeThreshold ?? ""}
              placeholder="5000"
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-base font-semibold">Operational defaults</h3>
          <p className="text-sm text-muted-foreground">Simple defaults to reduce repetitive admin setup for day-to-day operations.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="lowStockThreshold">Low-stock threshold</Label>
            <Input
              id="lowStockThreshold"
              name="lowStockThreshold"
              type="number"
              min={0}
              max={10000}
              required
              defaultValue={initialValues.lowStockThreshold}
            />
          </div>

          <label className="flex items-start gap-3 rounded-md border border-input px-3 py-2 text-sm">
            <input
              id="allowBackorders"
              name="allowBackorders"
              type="checkbox"
              defaultChecked={initialValues.allowBackorders}
              className="mt-1 size-4"
            />
            <span>
              <span className="block font-medium">Allow backorders</span>
              <span className="text-muted-foreground">When enabled, ops can process orders for temporarily out-of-stock items.</span>
            </span>
          </label>
        </div>
      </section>

      <div className="flex items-center justify-end border-t pt-4">
        <SaveSettingsButton />
      </div>
    </form>
  );
}
