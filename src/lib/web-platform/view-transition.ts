"use client";

import { flushSync } from "react-dom";

export type TransitionDirection = "forward" | "backward";

type StartViewTransitionFn = (
  callbackOrOptions:
    | (() => void)
    | { update: () => void; types?: string[] }
) => unknown;

/**
 * Runs a DOM state update inside a native View Transition with directional types
 * ('forward' | 'backward'), falling back cleanly when unsupported or when
 * prefers-reduced-motion: reduce is active.
 */
export function runViewTransition(
  updateDOM: () => void,
  direction?: TransitionDirection
): void {
  if (typeof window === "undefined" || typeof document === "undefined") {
    updateDOM();
    return;
  }

  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
    updateDOM();
    return;
  }

  const startVT = (
    document as unknown as { startViewTransition?: StartViewTransitionFn }
  ).startViewTransition;

  if (typeof startVT !== "function") {
    updateDOM();
    return;
  }

  const syncCommit = () => {
    flushSync(() => {
      updateDOM();
    });
  };

  try {
    if (
      direction &&
      typeof window !== "undefined" &&
      "ViewTransition" in window &&
      "types" in (window as unknown as { ViewTransition: { prototype: object } }).ViewTransition.prototype
    ) {
      startVT.call(document, {
        update: syncCommit,
        types: [direction],
      });
    } else {
      startVT.call(document, syncCommit);
    }
  } catch {
    updateDOM();
  }
}
