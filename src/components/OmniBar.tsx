"use client";

import React, { useMemo, useRef, useState } from "react";
import { CornerDownLeft, Loader2, Search, AlertCircle } from "lucide-react";
import { sounds } from "@/lib/sound";
import { detectHeuristicMode } from "@/lib/ai";
import { useAccessibleFormValidation, useModalDialog } from "@/lib/web-platform";
import type { Doc, Task, TriageMode, WorkspaceSnapshot, WorkspaceTab } from "@/types/outterring";
import { OmniBarModeSelector } from "./omnibar/OmniBarModeSelector";
import { OmniBarExamples } from "./omnibar/OmniBarExamples";
import { OmniBarSearchResults, type OmniBarSearchHit } from "./omnibar/OmniBarSearchResults";
import { OmniBarTypeBadge } from "./omnibar/OmniBarTypeBadge";
import { useOmniBarSearch } from "./omnibar/useOmniBarSearch";
import { useOmniBarSubmit } from "./omnibar/useOmniBarSubmit";

interface OmniBarProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  docs: Doc[];
  onSnapshotUpdated: (
    snapshot: WorkspaceSnapshot,
    destinationTab?: WorkspaceTab,
    createdId?: string | null
  ) => void;
  onJumpToTask: (taskId: string) => void;
  onJumpToDoc: (docId: string) => void;
}

export function OmniBar({
  isOpen,
  onClose,
  tasks,
  docs,
  onSnapshotUpdated,
  onJumpToTask,
  onJumpToDoc,
}: OmniBarProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const [text, setText] = useState("");
  const [mode, setMode] = useState<TriageMode>("auto");

  useModalDialog(dialogRef, isOpen, onClose, inputRef);
  useAccessibleFormValidation(formRef);

  const { matchingResults, selectedIndex, setSelectedIndex, handleArrowKeys } =
    useOmniBarSearch(text, tasks, docs);

  const { isSubmitting, submitTriage } = useOmniBarSubmit({
    formRef,
    onSnapshotUpdated,
    onClose,
  });

  const resolvedType = useMemo(() => {
    if (mode !== "auto") return mode;
    if (!text.trim()) return "task";
    return detectHeuristicMode(text);
  }, [mode, text]);

  const handleSelectItem = (item: OmniBarSearchHit) => {
    sounds.playPop();
    setText("");
    setSelectedIndex(-1);
    onClose();
    if (item.kind === "task") {
      onJumpToTask(item.id);
    } else {
      onJumpToDoc(item.id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (handleArrowKeys(e)) return;
    if (e.key === "Enter" && selectedIndex >= 0 && matchingResults[selectedIndex]) {
      e.preventDefault();
      handleSelectItem(matchingResults[selectedIndex]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void submitTriage(text, mode, () => {
      setText("");
      setMode("auto");
      setSelectedIndex(-1);
    });
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="omnibar-title"
      {...({ closedby: "any" } as Record<string, string>)}
      className="surface-overlay m-auto w-[calc(100%-1.5rem)] max-w-2xl rounded-3xl p-0 text-ink-primary"
    >
      <div className="p-5 sm:p-6">
        <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2">
          <h2 id="omnibar-title" className="text-xs font-semibold tracking-tight text-ink-secondary">
            Spotlight
          </h2>
          <OmniBarModeSelector mode={mode} onSelectMode={setMode} />
        </div>

        <form ref={formRef} onSubmit={handleSubmit} noValidate={false}>
          <div className="field-group">
            <label htmlFor="omnibar-capture-input" className="sr-only field-label">
              Capture or search
            </label>
            <div className="relative flex items-center">
              <Search className="pointer-events-none absolute left-4 h-4 w-4 text-ink-muted" aria-hidden="true" />
              <input
                ref={inputRef}
                id="omnibar-capture-input"
                name="capture"
                type="text"
                required
                minLength={2}
                value={text}
                onKeyDown={handleKeyDown}
                onChange={(e) => {
                  setText(e.target.value);
                  setSelectedIndex(-1);
                }}
                placeholder="Type a task, sprint, note, or search..."
                disabled={isSubmitting}
                aria-describedby="omnibar-error"
                className="validated-input w-full rounded-2xl border border-line-subtle bg-well/65 py-3.5 pl-11 pr-28 text-sm text-ink-primary placeholder-ink-muted outline-none transition-colors focus:border-accent focus:bg-card"
              />

              <div className="absolute right-2 flex items-center gap-1.5">
                {isSubmitting ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-well px-3 py-1.5 text-xs font-medium text-ink-secondary">
                    <Loader2 className="spinner-smooth h-3.5 w-3.5 text-accent" aria-hidden="true" />
                    <span>Saving</span>
                  </span>
                ) : (
                  <button
                    type="submit"
                    className="miro-tactile apple-btn-primary inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium"
                  >
                    <span>Capture</span>
                    <CornerDownLeft className="h-3 w-3" aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>

            <div id="omnibar-error" className="field-error-msg mt-2 items-center gap-1.5 text-xs text-status-danger-ink">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>Enter at least 2 characters.</span>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-ink-muted">
            <OmniBarTypeBadge text={text} resolvedType={resolvedType} />
            <span className="font-mono text-[11px]">↑↓ Select · ↵ Run · Esc</span>
          </div>
        </form>

        <OmniBarSearchResults items={matchingResults} selectedIndex={selectedIndex} onSelectItem={handleSelectItem} />

        {!text.trim() && (
          <OmniBarExamples
            onSelectExample={(sample) => {
              setText(sample);
              inputRef.current?.focus();
            }}
          />
        )}
      </div>
    </dialog>
  );
}
