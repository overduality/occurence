"use client";

import { useEffect, type RefObject } from "react";

/**
 * Bridges native :user-invalid / :has() with:
 * - Dynamic aria-invalid synchronization for assistive technologies
 * - WeakMap interaction tracking fallback when :user-invalid is unsupported
 * - Parent .has-error-fallback toggling when :has() is unsupported
 */
export function useAccessibleFormValidation(formRef: RefObject<HTMLFormElement>) {
  useEffect(() => {
    const form = formRef.current;
    if (!form || typeof window === "undefined") return;

    const supportsUserInvalid = Boolean(window.CSS?.supports?.("selector(:user-invalid)"));
    const supportsHas = Boolean(window.CSS?.supports?.("selector(:has(*))"));
    const dirtyState = new WeakMap<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
      { hasInteracted: boolean; hasBlurred: boolean }
    >();

    const isFormField = (
      el: EventTarget | null
    ): el is HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement => {
      return (
        el instanceof HTMLInputElement ||
        el instanceof HTMLTextAreaElement ||
        el instanceof HTMLSelectElement
      );
    };

    const syncFieldValidity = (
      field: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
      applyFallbackClasses: boolean
    ) => {
      const valid = field.checkValidity();
      let matchesVisualInvalid = !valid;

      if (supportsUserInvalid) {
        try {
          matchesVisualInvalid = field.matches(":user-invalid") || !valid;
        } catch {
          matchesVisualInvalid = !valid;
        }
      } else if (applyFallbackClasses) {
        field.classList.toggle("user-invalid-fallback", !valid);
        field.classList.toggle("user-valid-fallback", valid);
      }

      if (!valid && matchesVisualInvalid) {
        field.setAttribute("aria-invalid", "true");
      } else {
        field.removeAttribute("aria-invalid");
      }

      if (!supportsHas) {
        const container = field.closest(".field-group");
        if (container) {
          const anyInvalid = Boolean(
            container.querySelector(".user-invalid-fallback, [aria-invalid='true']")
          );
          container.classList.toggle("has-error-fallback", anyInvalid);
        }
      }
    };

    const handleBlur = (e: Event) => {
      if (!isFormField(e.target)) return;
      const state = dirtyState.get(e.target) || { hasInteracted: false, hasBlurred: false };
      state.hasBlurred = true;
      dirtyState.set(e.target, state);

      if (supportsUserInvalid || state.hasInteracted) {
        syncFieldValidity(e.target, true);
      }
    };

    const handleInput = (e: Event) => {
      if (!isFormField(e.target)) return;
      const state = dirtyState.get(e.target) || { hasInteracted: false, hasBlurred: false };
      state.hasInteracted = true;
      dirtyState.set(e.target, state);

      if (e.target.hasAttribute("aria-invalid") || state.hasBlurred) {
        syncFieldValidity(e.target, true);
      }
    };

    const handleSubmit = () => {
      const fields = form.querySelectorAll<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >("input[required], textarea[required], select[required]");
      fields.forEach((f) => syncFieldValidity(f, true));
    };

    const handleReset = () => {
      const fields = form.querySelectorAll<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >("input, textarea, select");
      fields.forEach((f) => {
        dirtyState.delete(f);
        f.classList.remove("user-invalid-fallback", "user-valid-fallback");
        f.removeAttribute("aria-invalid");
      });
      form.querySelectorAll(".has-error-fallback").forEach((el) => {
        el.classList.remove("has-error-fallback");
      });
    };

    form.addEventListener("blur", handleBlur, true);
    form.addEventListener("input", handleInput);
    form.addEventListener("change", handleInput);
    form.addEventListener("submit", handleSubmit);
    form.addEventListener("reset", handleReset, true);

    return () => {
      form.removeEventListener("blur", handleBlur, true);
      form.removeEventListener("input", handleInput);
      form.removeEventListener("change", handleInput);
      form.removeEventListener("submit", handleSubmit);
      form.removeEventListener("reset", handleReset, true);
    };
  }, [formRef]);
}
