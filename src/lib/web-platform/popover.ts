"use client";

/**
 * Progressive enhancement helper for declarative Invoker Commands (commandfor / command="toggle-popover")
 * and the HTML Popover API. Native browsers handle invocation automatically; older browsers fall back cleanly.
 */
export function handleDeclarativePopoverClick(
  popoverEl: HTMLElement | null,
  buttonEl: HTMLButtonElement | null
) {
  if (!popoverEl || typeof window === "undefined") return;

  // When native Invoker Commands are supported, the browser already toggles the popover
  if (
    typeof HTMLButtonElement !== "undefined" &&
    "commandForElement" in HTMLButtonElement.prototype
  ) {
    return;
  }

  // Fallback 1: Native Popover API available without Invoker Commands
  if ("popover" in HTMLElement.prototype && typeof popoverEl.togglePopover === "function") {
    const isNowOpen = popoverEl.togglePopover();
    if (buttonEl && typeof isNowOpen === "boolean") {
      buttonEl.setAttribute("aria-expanded", String(isNowOpen));
    }
    return;
  }

  // Fallback 2: Legacy browser without Popover API
  const nextOpen = !popoverEl.classList.contains("is-popover-open");
  popoverEl.classList.toggle("is-popover-open", nextOpen);
  buttonEl?.setAttribute("aria-expanded", String(nextOpen));
}
