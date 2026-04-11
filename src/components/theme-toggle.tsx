"use client";

import { useTheme } from "next-themes";
import type { LucideIcon } from "lucide-react";
import { Monitor, Moon, SunMedium } from "lucide-react";

import { Button } from "@/components/ui/button";
import { themeOptions } from "@/config/theme";
import { useMounted } from "@/hooks/use-mounted";
import type { AppTheme } from "@/types/app";

const themeIcons: Record<AppTheme, LucideIcon> = {
  system: Monitor,
  light: SunMedium,
  dark: Moon,
};

export function ThemeToggle() {
  const mounted = useMounted();
  const { resolvedTheme, setTheme, theme } = useTheme();
  const activeTheme = mounted ? ((theme ?? "system") as AppTheme) : "system";

  return (
    <div
      role="group"
      aria-label="Color theme"
      className="inline-flex items-center gap-1 rounded-full border border-border/80 bg-card/90 p-1 shadow-sm"
    >
      {themeOptions.map((option) => {
        const Icon = themeIcons[option.value];
        const isActive = activeTheme === option.value;

        return (
          <Button
            key={option.value}
            type="button"
            size="sm"
            variant={isActive ? "secondary" : "ghost"}
            aria-label={option.description}
            aria-pressed={isActive}
            className="h-8 rounded-full px-2.5 sm:px-3"
            onClick={() => setTheme(option.value)}
          >
            <Icon className="size-3.5" />
            <span className="hidden sm:inline">{option.label}</span>
            {option.value === "system" && mounted ? (
              <span className="sr-only">Currently following {resolvedTheme ?? "system"} mode</span>
            ) : null}
          </Button>
        );
      })}
    </div>
  );
}
