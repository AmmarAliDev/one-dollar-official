"use client";

import { useSyncExternalStore } from "react";

/**
 * Global storefront search dialog open/close state.
 *
 * The search command dialog is mounted once in the storefront layout but can be
 * opened from anywhere (desktop header search button, mobile search icon, etc.).
 * A tiny module-level external store lets any component call `openSearchDialog()`
 * / `closeSearchDialog()` without prop drilling or a context provider, mirroring
 * the existing `cart-drawer-state` pattern.
 */

type SearchDialogSnapshot = {
  open: boolean;
};

const INITIAL_SNAPSHOT: SearchDialogSnapshot = {
  open: false,
};

let snapshot = INITIAL_SNAPSHOT;
const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((listener) => listener());
}

function setSnapshot(next: SearchDialogSnapshot) {
  if (snapshot.open === next.open) {
    return;
  }

  snapshot = next;
  emitChange();
}

export function openSearchDialog() {
  setSnapshot({ open: true });
}

export function closeSearchDialog() {
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

export function useSearchDialogState() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** Test-only reset so a fresh module state is used between cases. */
export function __resetSearchDialogStateForTests() {
  listeners.clear();
  snapshot = INITIAL_SNAPSHOT;
}
