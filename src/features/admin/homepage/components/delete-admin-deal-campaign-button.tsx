"use client";

import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";

import { deleteAdminDealCampaignAction } from "../actions";

type DeleteAdminDealCampaignButtonProps = {
  campaignId: string;
  campaignName: string;
  returnTo: string;
  action?: (formData: FormData) => void | Promise<void>;
};

export function DeleteAdminDealCampaignButton({
  campaignId,
  campaignName,
  returnTo,
  action = deleteAdminDealCampaignAction,
}: DeleteAdminDealCampaignButtonProps) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement | null>(null);

  return (
    <>
      <form ref={formRef} action={action}>
        <input type="hidden" name="id" value={campaignId} />
        <input type="hidden" name="returnTo" value={returnTo} />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="text-destructive border-2 border-destructive! hover:text-destructive"
          onClick={() => setOpen(true)}
        >
          Delete campaign
        </Button>
      </form>

      <ConfirmationDialog
        open={open}
        onOpenChange={setOpen}
        title={`Delete ${campaignName}?`}
        description="This permanently removes the campaign and its generated homepage spotlight overlay."
        confirmLabel="Delete campaign"
        confirmVariant="destructive"
        onConfirm={() => formRef.current?.requestSubmit()}
      />
    </>
  );
}
