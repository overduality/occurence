"use client";

import { useEffect, type RefObject } from "react";

let cachedSupportsDisplayTransition: boolean | undefined;

/**
 * Probes actual discrete display transition behavior (guards against Firefox bug 1882408).
 */
export function canTransitionDisplay(): boolean {
  if (typeof window === "undefined" || typeof document === "undefined") return false;
  if (cachedSupportsDisplayTransition !== undefined) return cachedSupportsDisplayTransition;
  if (!window.CSS?.supports?.("transition-behavior", "allow-discrete") || !document.body) {
    return false;
  }

  const probe = document.createElement("div");
  probe.style.cssText = "transition: display 1s allow-discrete !important; display: block;";
  document.body.appendChild(probe);
  void getComputedStyle(probe).display;
  probe.style.display = "none";
  cachedSupportsDisplayTransition = getComputedStyle(probe).display === "block";
  probe.remove();
  return cachedSupportsDisplayTransition;
}

export function supportsTopLayerExit(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(window.CSS?.supports?.("overlay", "auto")) && canTransitionDisplay();
}

export async function closeDialogGracefully(dialog: HTMLDialogElement): Promise<void> {
  if (!dialog.open) return;

  if (!supportsTopLayerExit()) {
    dialog.setAttribute("data-closing", "");
    const animations = dialog.getAnimations({ subtree: true });
    if (animations.length > 0) {
      await Promise.race([
        Promise.allSettled(animations.map((a) => a.finished)),
        new Promise((r) => setTimeout(r, 240)),
      ]);
    }
    dialog.removeAttribute("data-closing");
  }

  if (dialog.open) {
    dialog.close();
  }
}

/**
 * Manages a native modal <dialog closedby="any"> with:
 * 1. Top-layer focus trapping via showModal()
 * 2. Bounding-box light-dismiss fallback for browsers lacking HTMLDialogElement.prototype.closedBy
 * 3. Smooth exit animation fallback via data-closing
 */
export function useModalDialog(
  dialogRef: RefObject<HTMLDialogElement>,
  isOpen: boolean,
  onClose: () => void,
  initialFocusRef?: RefObject<HTMLElement>
) {
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      dialog.removeAttribute("data-closing");
      if (!dialog.open) {
        dialog.showModal();
        requestAnimationFrame(() => {
          initialFocusRef?.current?.focus();
        });
      }
    } else if (dialog.open) {
      void closeDialogGracefully(dialog);
    }
  }, [dialogRef, isOpen, initialFocusRef]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleCancel = (event: Event) => {
      event.preventDefault();
      onClose();
    };

    const handleNativeClose = () => {
      if (isOpen) {
        onClose();
      }
    };

    dialog.addEventListener("cancel", handleCancel);
    dialog.addEventListener("close", handleNativeClose);

    // Fallback for browsers without native <dialog closedby="any"> support (e.g., Safari)
    let handleBackdropClick: ((event: MouseEvent) => void) | null = null;
    if (typeof HTMLDialogElement !== "undefined" && !("closedBy" in HTMLDialogElement.prototype)) {
      handleBackdropClick = (event: MouseEvent) => {
        if (event.target !== dialog) return;
        const rect = dialog.getBoundingClientRect();
        const isDialogContent =
          rect.top <= event.clientY &&
          event.clientY <= rect.top + rect.height &&
          rect.left <= event.clientX &&
          event.clientX <= rect.left + rect.width;

        if (!isDialogContent) {
          onClose();
        }
      };
      dialog.addEventListener("click", handleBackdropClick);
    }

    return () => {
      dialog.removeEventListener("cancel", handleCancel);
      dialog.removeEventListener("close", handleNativeClose);
      if (handleBackdropClick) {
        dialog.removeEventListener("click", handleBackdropClick);
      }
    };
  }, [dialogRef, isOpen, onClose]);
}
