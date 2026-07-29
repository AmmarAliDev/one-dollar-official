"use client";

import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";

import { deleteAdminProductAction } from "../actions";

type DeleteProductButtonProps = {
  productId: string;
  productTitle: string;
  returnTo: string;
};

export function DeleteProductButton({ productId, productTitle, returnTo }: DeleteProductButtonProps) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement | null>(null);

  return (
    <>
      <form ref={formRef} action={deleteAdminProductAction}>
        <input type="hidden" name="productId" value={productId} />
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
        title={`Delete ${productTitle}?`}
        description="This permanently removes the product, its variants, and dependent cart or wishlist rows."
        confirmLabel="Delete product"
        confirmVariant="destructive"
        onConfirm={() => formRef.current?.requestSubmit()}
      />
    </>
  );
}
