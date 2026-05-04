"use client";

import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";

import { deleteAdminHomepageSectionAction } from "../actions";

type DeleteAdminHomepageSectionButtonProps = {
  sectionId: string;
  sectionTitle: string;
  returnTo: string;
  action?: (formData: FormData) => void | Promise<void>;
};

export function DeleteAdminHomepageSectionButton({
  sectionId,
  sectionTitle,
  returnTo,
  action = deleteAdminHomepageSectionAction,
}: DeleteAdminHomepageSectionButtonProps) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement | null>(null);

  return (
    <>
      <form ref={formRef} action={action}>
        <input type="hidden" name="id" value={sectionId} />
        <input type="hidden" name="returnTo" value={returnTo} />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="text-destructive border-2 border-destructive! hover:text-destructive"
          onClick={() => setOpen(true)}
        >
          Delete section
        </Button>
      </form>

      <ConfirmationDialog
        open={open}
        onOpenChange={setOpen}
        title={`Delete ${sectionTitle}?`}
        description="This permanently removes the section from homepage content."
        confirmLabel="Delete section"
        confirmVariant="destructive"
        onConfirm={() => formRef.current?.requestSubmit()}
      />
    </>
  );
}
