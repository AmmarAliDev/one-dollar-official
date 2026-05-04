"use client";

import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";

import { deleteAdminBannerAction } from "../actions";

type DeleteAdminBannerButtonProps = {
  bannerId: string;
  bannerTitle: string;
  returnTo: string;
  action?: (formData: FormData) => void | Promise<void>;
};

export function DeleteAdminBannerButton({
  bannerId,
  bannerTitle,
  returnTo,
  action = deleteAdminBannerAction,
}: DeleteAdminBannerButtonProps) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement | null>(null);

  return (
    <>
      <form ref={formRef} action={action}>
        <input type="hidden" name="id" value={bannerId} />
        <input type="hidden" name="returnTo" value={returnTo} />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="text-destructive border-2 border-destructive! hover:text-destructive"
          onClick={() => setOpen(true)}
        >
          Delete banner
        </Button>
      </form>

      <ConfirmationDialog
        open={open}
        onOpenChange={setOpen}
        title={`Delete ${bannerTitle}?`}
        description="This permanently removes the banner from admin and storefront announcement overlays."
        confirmLabel="Delete banner"
        confirmVariant="destructive"
        onConfirm={() => formRef.current?.requestSubmit()}
      />
    </>
  );
}
