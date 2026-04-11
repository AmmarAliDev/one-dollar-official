import type { AppTheme } from "@/types/app";

type ThemeOption = {
  value: AppTheme;
  label: string;
  description: string;
};

export const themeOptions = [
  {
    value: "system",
    label: "System",
    description: "Follow the device color preference automatically.",
  },
  {
    value: "light",
    label: "Light",
    description: "Use the bright interface for daytime browsing.",
  },
  {
    value: "dark",
    label: "Dark",
    description: "Use the low-light interface for evening browsing.",
  },
] as const satisfies readonly ThemeOption[];
