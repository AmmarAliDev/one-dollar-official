export type AppTheme = "light" | "dark" | "system";

export interface NavItem {
  title: string;
  href: string;
  description?: string;
}

export interface FeatureFlags {
  readonly adminPreview: boolean;
  readonly authPreview: boolean;
  readonly checkout: boolean;
  readonly payments: boolean;
}
