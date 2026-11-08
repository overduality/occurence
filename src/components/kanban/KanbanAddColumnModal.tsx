"use client";

import React, { useRef, useState } from "react";
import { X } from "lucide-react";
import { sounds } from "@/lib/sound";
import { useModalDialog } from "@/lib/web-platform";
import { ColorPicker } from "./ColorPicker";

interface KanbanAddColumnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateColumn?: (title: string, wip_limit?: number | null, color?: string) => Promise<void>;
}

export function KanbanAddColumnModal({
  isOpen,
  onClose,
  onCreateColumn,
}: KanbanAddColumnModalProps) {
  const addColumnDialogRef = useRef<HTMLDialogElement>(null);
  const addColumnInputRef = useRef<HTMLInputElement>(null);
  const [newColTitle, setNewColTitle] = useState("");
  const [newColWipLimit, setNewColWipLimit] = useState("");
  const [newColColor, setNewColColor] = useState("accent");

  useModalDialog(addColumnDialogRef, isOpen, onClose, addColumnInputRef);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColTitle.trim()) return;
    sounds.playComplete();
    const limitNum = newColWipLimit.trim() ? Number(newColWipLimit) : null;
    if (onCreateColumn) {
      await onCreateColumn(newColTitle.trim(), limitNum, newColColor);
    }
    setNewColTitle("");
    setNewColWipLimit("");
    setNewColColor("accent");
    onClose();
  };

  return (
    <dialog
      ref={addColumnDialogRef}
      aria-labelledby="add-column-modal-title"
      {...({ closedby: "any" } as Record<string, string>)}
      className="surface-overlay m-auto w-[calc(100%-1.5rem)] max-w-sm rounded-3xl p-0 text-ink-primary shadow-2xl backdrop:bg-black/40 backdrop:backdrop-blur-sm"
    >
      <form onSubmit={handleSubmit} className="p-5">
        <div className="flex items-center justify-between border-b border-line-subtle pb-3">
          <h2 id="add-column-modal-title" className="text-sm font-semibold text-ink-primary">
            New Column
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
            <label htmlFor="new-col-title-input" className="block text-xs font-medium text-ink-primary">
              Title <span className="text-status-danger-ink">*</span>
            </label>
            <input
              ref={addColumnInputRef}
              id="new-col-title-input"
              type="text"
              required
              minLength={2}
              value={newColTitle}
              onChange={(e) => setNewColTitle(e.target.value)}
              placeholder="e.g. Review, Testing..."
              className="mt-1 w-full rounded-lg border border-line-subtle bg-card px-3 py-2 text-xs text-ink-primary placeholder-ink-muted outline-none focus:border-accent"
            />
          </div>

          <div>
            <label htmlFor="new-col-wip-input" className="block text-xs font-medium text-ink-primary">
              WIP Limit
            </label>
            <input
              id="new-col-wip-input"
              type="number"
              min={1}
              max={99}
              value={newColWipLimit}
              onChange={(e) => setNewColWipLimit(e.target.value)}
              placeholder="Optional (e.g. 3)"
              className="mt-1 w-full rounded-lg border border-line-subtle bg-card px-3 py-2 text-xs text-ink-primary placeholder-ink-muted outline-none focus:border-accent"
            />
          </div>

          <ColorPicker selectedColor={newColColor} onSelectColor={setNewColColor} />
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
            Add Column
          </button>
        </div>
      </form>
    </dialog>
  );
}
