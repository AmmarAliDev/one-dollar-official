"use client";

import { useTheme } from "next-themes";
import type { LucideIcon } from "lucide-react";
import { Monitor, Moon, SunMedium, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { themeOptions } from "@/config/theme";
import { useMounted } from "@/hooks/use-mounted";
import type { AppTheme } from "@/types/app";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const themeIcons: Record<AppTheme, LucideIcon> = {
  system: Monitor,
  light: SunMedium,
  dark: Moon,
};

export function ThemeToggle() {
  const mounted = useMounted();
  const { resolvedTheme, setTheme, theme } = useTheme();
  const activeTheme = mounted ? ((theme ?? "system") as AppTheme) : "system";

  const ActiveIcon = themeIcons[activeTheme];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button aria-label="Color theme" variant="outline" size={"icon"}>
          <ActiveIcon className="size-4" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="flex flex-col gap-2 bg-card">
        {themeOptions.map((option) => {
          const Icon = themeIcons[option.value];
          const isActive = activeTheme === option.value;

          return (
            <DropdownMenuItem key={option.value} asChild>
              <Button
                type="button"
                variant={isActive ? "secondary" : "ghost"}
                size="sm"
                className="justify-between"
                onClick={() => setTheme(option.value)}
                aria-pressed={isActive}
                aria-label={option.description}
              >
                <div className="inline-flex items-center gap-2">
                  <Icon className="size-3.5" />
                  <span>{option.label}</span>
                </div>
                {option.value === "system" && mounted ? (
                  <span className="sr-only">Currently following {resolvedTheme ?? "system"} mode</span>
                ) : null}
                {isActive ? <Check className="size-4" aria-hidden="true" /> : null}
              </Button>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
