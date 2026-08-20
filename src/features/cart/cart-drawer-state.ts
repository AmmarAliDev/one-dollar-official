"use client";

import { useSyncExternalStore } from "react";

/**
 * Global cart drawer open/close state.
 *
 * The cart drawer is mounted once in the storefront layout but can be opened
 * from anywhere (header triggers, mobile cart button, product card
 * "Add to cart" buttons, etc.). A tiny module-level external store lets any
 * component call `openCartDrawer()` / `closeCartDrawer()` without prop drilling
 * or a context provider, mirroring the existing `cart-count-state` pattern.
 */

type CartDrawerSnapshot = {
  open: boolean;
};

const INITIAL_SNAPSHOT: CartDrawerSnapshot = {
  open: false,
};

let snapshot = INITIAL_SNAPSHOT;
const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((listener) => listener());
}

function setSnapshot(next: CartDrawerSnapshot) {
  if (snapshot.open === next.open) {
    return;
  }

  snapshot = next;
  emitChange();
}

export function openCartDrawer() {
  setSnapshot({ open: true });
}

export function closeCartDrawer() {
  setSnapshot({ open: false });
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return snapshot;
}

function getServerSnapshot() {
  return INITIAL_SNAPSHOT;
}

export function useCartDrawerState() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** Test-only reset so a fresh module state is used between cases. */
export function __resetCartDrawerStateForTests() {
  listeners.clear();
  snapshot = INITIAL_SNAPSHOT;
}
