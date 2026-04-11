import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-background min-h-screen">
      <main
        id="main-content"
        className="mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center px-4 py-(--space-section) sm:px-6"
      >
        {children}
      </main>
    </div>
  );
}
