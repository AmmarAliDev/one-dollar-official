"use client";

import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";

import { deleteAdminBlogPostAction } from "../actions";

type DeleteBlogPostButtonProps = {
  blogPostId: string;
  blogPostTitle: string;
  returnTo: string;
};

export function DeleteBlogPostButton({ blogPostId, blogPostTitle, returnTo }: DeleteBlogPostButtonProps) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement | null>(null);

  return (
    <>
      <form ref={formRef} action={deleteAdminBlogPostAction}>
        <input type="hidden" name="blogPostId" value={blogPostId} />
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
        title={`Delete ${blogPostTitle}?`}
        description="This permanently removes the blog post from admin and storefront routes."
        confirmLabel="Delete post"
        confirmVariant="destructive"
        onConfirm={() => formRef.current?.requestSubmit()}
      />
    </>
  );
}
