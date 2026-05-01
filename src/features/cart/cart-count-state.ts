"use client";

import { useSyncExternalStore } from "react";

import { addCartChangedListener } from "./client-events";
import type { CartSummary } from "./types";

type CartCountSnapshot = {
  itemCount: number;
  pending: boolean;
  errorMessage: string | null;
};

const INITIAL_SNAPSHOT: CartCountSnapshot = {
  itemCount: 0,
  pending: false,
  errorMessage: null,
};

type CartApiPayload = {
  ok?: boolean;
  cart?: CartSummary | null;
  error?: string;
};

let snapshot = INITIAL_SNAPSHOT;
const listeners = new Set<() => void>();

let isInitialized = false;
let detachCartListener: (() => void) | null = null;
let pendingRefresh: Promise<void> | null = null;

function emitChange() {
  listeners.forEach((listener) => listener());
}

function setSnapshot(next: CartCountSnapshot) {
  if (
    snapshot.itemCount === next.itemCount
    && snapshot.pending === next.pending
    && snapshot.errorMessage === next.errorMessage
  ) {
    return;
  }

  snapshot = next;
  emitChange();
}

function setCountFromCart(cart: CartSummary | null) {
  setSnapshot({
    itemCount: cart?.itemCount ?? 0,
    pending: false,
    errorMessage: null,
  });
}

export async function refreshGlobalCartCount() {
  if (typeof window === "undefined") {
    return;
  }

  if (pendingRefresh) {
    return pendingRefresh;
  }

  setSnapshot({
    itemCount: snapshot.itemCount,
    pending: true,
    errorMessage: null,
  });

  pendingRefresh = (async () => {
    try {
      const response = await fetch("/api/cart", {
        method: "GET",
        cache: "no-store",
      });

      const payload = (await response.json().catch(() => null)) as CartApiPayload | null;

      if (!response.ok) {
        setSnapshot({
          itemCount: snapshot.itemCount,
          pending: false,
          errorMessage: payload?.error ?? "Could not refresh your cart count right now.",
        });
        return;
      }

      setCountFromCart(payload?.cart ?? null);
    } catch {
      setSnapshot({
        itemCount: snapshot.itemCount,
        pending: false,
        errorMessage: "Could not refresh your cart count right now.",
      });
    } finally {
      pendingRefresh = null;
    }
  })();

  return pendingRefresh;
}

function ensureInitialized() {
  if (isInitialized || typeof window === "undefined") {
    return;
  }

  isInitialized = true;
  detachCartListener = addCartChangedListener((nextCart) => {
    if (typeof nextCart !== "undefined") {
      setCountFromCart(nextCart ?? null);
      return;
    }

    void refreshGlobalCartCount();
  });

  void refreshGlobalCartCount();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  ensureInitialized();

  return () => {
    listeners.delete(listener);

    if (listeners.size === 0) {
      detachCartListener?.();
      detachCartListener = null;
      isInitialized = false;
      pendingRefresh = null;
    }
  };
}

function getSnapshot() {
  return snapshot;
}

function getServerSnapshot() {
  return INITIAL_SNAPSHOT;
}

export function useCartCountState() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function syncGlobalCartCount(cart: CartSummary | null) {
  setCountFromCart(cart);
}

export function __resetGlobalCartCountStateForTests() {
  detachCartListener?.();
  detachCartListener = null;
  isInitialized = false;
  pendingRefresh = null;
  listeners.clear();
  snapshot = INITIAL_SNAPSHOT;
}
