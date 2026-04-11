"use client";

import { BellRing } from "lucide-react";

import { notify } from "@/lib/notify";

import { Button } from "../ui/button";

export function PreviewToastButton() {
  return (
    <Button
      variant="secondary"
      onClick={() =>
        notify.success(
          "Preview notification ready",
          "Shared frontend feedback is now available for future storefront and admin actions.",
        )
      }
    >
      <BellRing className="size-4" />
      Preview feedback
    </Button>
  );
}
