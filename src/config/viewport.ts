import type { Viewport } from "next";

// Keep browser zoom accessible while locking in predictable initial viewport behavior.
export const appViewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  interactiveWidget: "resizes-visual",
};
