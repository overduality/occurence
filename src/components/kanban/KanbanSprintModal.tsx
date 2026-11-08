"use client";

import React, { useRef, useState, useEffect } from "react";
import { X } from "lucide-react";
import { sounds } from "@/lib/sound";
import { useModalDialog } from "@/lib/web-platform";
import type { Sprint } from "@/types/outterring";

interface KanbanSprintModalProps {
  isOpen: boolean;
  mode: "create" | "edit";
  activeSprint: Sprint | null;
  onClose: () => void;
  onCreateSprint: (
    title: string,
    goal: string,
    moveUnfinishedTasks?: boolean
  ) => Promise<string | null>;
  onUpdateSprint: (
    sprintId: string,
    patch: { title?: string; goal?: string }
  ) => Promise<void>;
  onSprintCreated: () => void;
}

export function KanbanSprintModal({
  isOpen,
  mode,
  activeSprint,
  onClose,
  onCreateSprint,
  onUpdateSprint,
  onSprintCreated,
}: KanbanSprintModalProps) {
  const sprintDialogRef = useRef<HTMLDialogElement>(null);
  const sprintTitleRef = useRef<HTMLInputElement>(null);
  const [sprintTitle, setSprintTitle] = useState("");
  const [sprintGoal, setSprintGoal] = useState("");
  const [moveUnfinishedOnCreate, setMoveUnfinishedOnCreate] = useState(true);

  useModalDialog(sprintDialogRef, isOpen, onClose, sprintTitleRef);

  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && activeSprint) {
        setSprintTitle(activeSprint.title);
        setSprintGoal(activeSprint.goal || "");
      } else {
        setSprintTitle("");
        setSprintGoal("");
        setMoveUnfinishedOnCreate(true);
      }
    }
  }, [isOpen, mode, activeSprint]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sprintTitle.trim()) return;
    sounds.playComplete();
    if (mode === "edit" && activeSprint) {
      await onUpdateSprint(activeSprint.id, {
        title: sprintTitle.trim(),
        goal: sprintGoal.trim(),
      });
    } else {
      await onCreateSprint(sprintTitle.trim(), sprintGoal.trim(), moveUnfinishedOnCreate);
      onSprintCreated();
    }
    onClose();
  };

  return (
    <dialog
      ref={sprintDialogRef}
      aria-labelledby="sprint-modal-title"
      {...({ closedby: "any" } as Record<string, string>)}
      className="surface-overlay m-auto w-[calc(100%-1.5rem)] max-w-md rounded-3xl p-0 text-ink-primary"
    >
      <form onSubmit={handleSubmit} className="p-5">
        <div className="flex items-center justify-between border-b border-line-subtle pb-3">
          <h2 id="sprint-modal-title" className="text-sm font-semibold text-ink-primary">
            {mode === "edit" ? "Edit Sprint" : "New Sprint"}
          </h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="miro-tactile rounded-md p-1 text-ink-muted hover:bg-hover hover:text-ink-primary"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-4 space-y-3.5">
          <div>
            <label htmlFor="sprint-name-input" className="block text-xs font-medium text-ink-primary">
              Name <span className="text-status-danger-ink">*</span>
            </label>
            <input
              ref={sprintTitleRef}
              id="sprint-name-input"
              type="text"
              required
              minLength={2}
              value={sprintTitle}
              onChange={(e) => setSprintTitle(e.target.value)}
              placeholder="Name..."
              className="mt-1 w-full rounded-lg border border-line-subtle bg-card px-3 py-2 text-sm text-ink-primary placeholder-ink-muted outline-none focus:border-accent"
            />
          </div>

          <div>
            <label htmlFor="sprint-goal-input" className="block text-xs font-medium text-ink-primary">
              Goal
            </label>
            <textarea
              id="sprint-goal-input"
              rows={2}
              value={sprintGoal}
              onChange={(e) => setSprintGoal(e.target.value)}
              placeholder="Definition of done..."
              className="auto-fit-textarea mt-1 rounded-lg border border-line-subtle bg-card px-3 py-2 text-xs text-ink-primary placeholder-ink-muted outline-none focus:border-accent"
            />
          </div>

          {mode === "create" && (
            <label className="flex items-start gap-2.5 cursor-pointer pt-1 select-none">
              <input
                type="checkbox"
                checked={moveUnfinishedOnCreate}
                onChange={(e) => setMoveUnfinishedOnCreate(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-line-strong text-accent focus:ring-accent"
              />
              <span className="text-xs text-ink-secondary leading-tight">
                Roll over unfinished tasks
              </span>
            </label>
          )}
        </div>

        <div className="mt-5 flex items-center justify-end gap-2 border-t border-line-subtle pt-3.5">
          <button
            type="button"
            onClick={onClose}
            className="miro-tactile liquid-nav-bubble rounded-full px-4 py-1.5 text-xs font-medium text-ink-primary hover:bg-hover"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="miro-tactile apple-btn-primary rounded-full px-4 py-1.5 text-xs font-medium"
          >
            {mode === "edit" ? "Save" : "Start"}
          </button>
        </div>
      </form>
    </dialog>
  );
}
