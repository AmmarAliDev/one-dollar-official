"use client";

import { useEffect, useState } from "react";

/** Scroll distance (px) from the top where the header is always visible. */
const SHOW_AT_TOP_THRESHOLD = 24;

/** Minimum scroll delta (px) before the direction is treated as "scrolling". */
const DIRECTION_THRESHOLD = 8;

/**
 * Tracks scroll direction and reports whether a sticky element (e.g. the
 * header) should hide. The element is hidden while scrolling down (past a
 * small top threshold) and shown again while scrolling up or near the top.
 */
export function useHideOnScroll() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let rafId: number | null = null;

    const update = () => {
      rafId = null;
      const currentScrollY = window.scrollY;

      // Near the top: always reveal the header.
      if (currentScrollY <= SHOW_AT_TOP_THRESHOLD) {
        setHidden(false);
        lastScrollY = currentScrollY;
        return;
      }

      const delta = currentScrollY - lastScrollY;
      lastScrollY = currentScrollY;

      if (delta < -DIRECTION_THRESHOLD) {
        setHidden(false);
      } else if (delta > DIRECTION_THRESHOLD) {
        setHidden(true);
      }
    };

    const onScroll = () => {
      if (rafId === null) {
        rafId = requestAnimationFrame(update);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
    };
  }, []);

  return hidden;
}
