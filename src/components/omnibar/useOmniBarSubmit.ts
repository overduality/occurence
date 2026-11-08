import { useState, type RefObject } from "react";
import { sounds } from "@/lib/sound";
import type { TriageMode, WorkspaceSnapshot, WorkspaceTab } from "@/types/outterring";

export function useOmniBarSubmit({
  formRef,
  onSnapshotUpdated,
  onClose,
}: {
  formRef: RefObject<HTMLFormElement>;
  onSnapshotUpdated: (
    snapshot: WorkspaceSnapshot,
    destinationTab?: WorkspaceTab,
    createdId?: string | null
  ) => void;
  onClose: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitTriage = async (
    text: string,
    mode: TriageMode,
    resetForm: () => void
  ) => {
    if (!formRef.current?.checkValidity()) return;

    const raw = text.trim();
    if (!raw || isSubmitting) return;

    setIsSubmitting(true);
    sounds.playPop();

    try {
      const res = await fetch("/api/ai/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: raw, mode }),
      });

      if (res.ok) {
        const data = (await res.json()) as {
          savedKind: "task" | "sprint" | "doc";
          primaryId: string | null;
          snapshot: WorkspaceSnapshot;
        };
        sounds.playComplete();
        resetForm();
        const destTab: WorkspaceTab =
          data.savedKind === "doc"
            ? "docs"
            : data.savedKind === "sprint"
              ? "board"
              : "focus";
        onSnapshotUpdated(data.snapshot, destTab, data.primaryId);
        onClose();
      }
    } catch (err) {
      console.error("OmniBar triage error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return { isSubmitting, submitTriage };
}
