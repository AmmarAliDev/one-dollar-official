"use client";

import { useTheme } from "next-themes";
import { Toaster } from "sonner";

import { buttonVariants } from "@/components/ui/button";

export function AppToaster() {
  const { resolvedTheme } = useTheme();

  return (
    <Toaster
      closeButton
      expand
      position="top-right"
      richColors
      theme={resolvedTheme === "dark" ? "dark" : "light"}
      toastOptions={{
        actionButtonStyle: {
          background: resolvedTheme === "dark" ? "#977aa1" : "#2b1735",
          color: "#fff",
          border: "1px solid hsl(var(--ring))",
          borderRadius: "calc(var(--radius) - 2px)",
          height: "2rem",
          paddingInline: "0.75rem",
        },
        cancelButtonStyle: {
          background: resolvedTheme === "dark" ? "#2b1735" : "#977aa1",
          color: "#fff",
          border: "1px solid hsl(var(--ring))",
          borderRadius: "calc(var(--radius) - 2px)",
          height: "2rem",
          paddingInline: "0.75rem",
        },
        classNames: {
          toast: "border-border/80 rounded-[var(--radius)] border",
          title: "font-semibold",
          description: "text-sm",
          actionButton: buttonVariants({ size: "sm" }),
          cancelButton: buttonVariants({ variant: "outline", size: "sm" }),
        },
      }}
    />
  );
}
