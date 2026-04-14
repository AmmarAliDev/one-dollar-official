"use client";

import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";

import { deleteAdminCategoryAction } from "../actions";

type DeleteCategoryButtonProps = {
  categoryId: string;
  categoryName: string;
  returnTo: string;
};

export function DeleteCategoryButton({ categoryId, categoryName, returnTo }: DeleteCategoryButtonProps) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement | null>(null);

  return (
    <>
      <form ref={formRef} action={deleteAdminCategoryAction}>
        <input type="hidden" name="categoryId" value={categoryId} />
        <input type="hidden" name="returnTo" value={returnTo} />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive"
          onClick={() => setOpen(true)}
        >
          Delete
        </Button>
      </form>

      <ConfirmationDialog
        open={open}
        onOpenChange={setOpen}
        title={`Delete ${categoryName}?`}
        description="This permanently removes the category. Make sure all linked products have been moved first."
        confirmLabel="Delete category"
        confirmVariant="destructive"
        onConfirm={() => formRef.current?.requestSubmit()}
      />
    </>
  );
}
