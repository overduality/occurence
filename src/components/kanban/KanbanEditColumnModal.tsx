"use client";

import React, { useRef, useState, useEffect } from "react";
import { Trash2, X } from "lucide-react";
import { sounds } from "@/lib/sound";
import { useModalDialog } from "@/lib/web-platform";
import type { KanbanColumn } from "@/types/outterring";
import { ColorPicker } from "./ColorPicker";
import { KanbanColumnPositionControl } from "./KanbanColumnPositionControl";

interface KanbanEditColumnModalProps {
  editingCol: KanbanColumn | null;
  boardColumns: KanbanColumn[];
  onClose: () => void;
  onUpdateColumn?: (columnId: string, patch: Partial<KanbanColumn>) => Promise<void>;
  onDeleteColumn?: (columnId: string) => Promise<void>;
  onReorderColumns?: (reordered: KanbanColumn[]) => Promise<void>;
}

export function KanbanEditColumnModal({
  editingCol,
  boardColumns,
  onClose,
  onUpdateColumn,
  onDeleteColumn,
  onReorderColumns,
}: KanbanEditColumnModalProps) {
  const editColumnDialogRef = useRef<HTMLDialogElement>(null);
  const editColumnInputRef = useRef<HTMLInputElement>(null);
  const [editColTitle, setEditColTitle] = useState("");
  const [editColWipLimit, setEditColWipLimit] = useState("");
  const [editColColor, setEditColColor] = useState("accent");

  useModalDialog(editColumnDialogRef, Boolean(editingCol), onClose, editColumnInputRef);

  useEffect(() => {
    if (editingCol) {
      setEditColTitle(editingCol.title);
      setEditColWipLimit(editingCol.wip_limit ? String(editingCol.wip_limit) : "");
      setEditColColor(editingCol.color || "accent");
    }
  }, [editingCol]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCol || !editColTitle.trim()) return;
    sounds.playComplete();
    const limitNum = editColWipLimit.trim() ? Number(editColWipLimit) : null;
    if (onUpdateColumn) {
      await onUpdateColumn(editingCol.id, {
        title: editColTitle.trim(),
        wip_limit: limitNum,
        color: editColColor,
      });
    }
    onClose();
  };

  const handleDelete = async () => {
    if (!editingCol || editingCol.is_system === 1) return;
    sounds.playPop();
    if (confirm(`Delete column "${editingCol.title}"? Tasks inside will be moved to To Do.`)) {
      if (onDeleteColumn) {
        await onDeleteColumn(editingCol.id);
      }
      onClose();
    }
  };

  const handleMove = async (direction: "left" | "right") => {
    if (!editingCol || !onReorderColumns) return;
    const currIdx = boardColumns.findIndex((c) => c.id === editingCol.id);
    if (currIdx === -1) return;
    const targetIdx = direction === "left" ? currIdx - 1 : currIdx + 1;
    if (targetIdx < 0 || targetIdx >= boardColumns.length) return;

    sounds.playPop();
    const reordered = [...boardColumns];
    const [moved] = reordered.splice(currIdx, 1);
    reordered.splice(targetIdx, 0, moved);
    await onReorderColumns(reordered);
    onClose();
  };

  if (!editingCol) return null;

  return (
    <dialog
      ref={editColumnDialogRef}
      aria-labelledby="edit-column-modal-title"
      {...({ closedby: "any" } as Record<string, string>)}
      className="surface-overlay m-auto w-[calc(100%-1.5rem)] max-w-sm rounded-3xl p-0 text-ink-primary shadow-2xl backdrop:bg-black/40 backdrop:backdrop-blur-sm"
    >
      <form onSubmit={handleSubmit} className="p-5">
        <div className="flex items-center justify-between border-b border-line-subtle pb-3">
          <h2 id="edit-column-modal-title" className="text-sm font-semibold text-ink-primary">
            Edit Column
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
            <label htmlFor="edit-col-title-input" className="block text-xs font-medium text-ink-primary">
              Title <span className="text-status-danger-ink">*</span>
            </label>
            <input
              ref={editColumnInputRef}
              id="edit-col-title-input"
              type="text"
              required
              minLength={2}
              value={editColTitle}
              onChange={(e) => setEditColTitle(e.target.value)}
              className="mt-1 w-full rounded-lg border border-line-subtle bg-card px-3 py-2 text-xs text-ink-primary placeholder-ink-muted outline-none focus:border-accent"
            />
          </div>

          <div>
            <label htmlFor="edit-col-wip-input" className="block text-xs font-medium text-ink-primary">
              WIP Limit
            </label>
            <input
              id="edit-col-wip-input"
              type="number"
              min={1}
              max={99}
              value={editColWipLimit}
              onChange={(e) => setEditColWipLimit(e.target.value)}
              placeholder="Optional (e.g. 3)"
              className="mt-1 w-full rounded-lg border border-line-subtle bg-card px-3 py-2 text-xs text-ink-primary placeholder-ink-muted outline-none focus:border-accent"
            />
          </div>

          <ColorPicker selectedColor={editColColor} onSelectColor={setEditColColor} />

          {onReorderColumns && (
            <KanbanColumnPositionControl
              editingCol={editingCol}
              boardColumns={boardColumns}
              onMoveColumn={handleMove}
            />
          )}
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-line-subtle pt-3.5">
          <div>
            {editingCol.is_system !== 1 && onDeleteColumn ? (
              <button
                type="button"
                onClick={handleDelete}
                className="miro-tactile flex items-center gap-1 text-xs text-status-danger-ink hover:underline"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
            ) : (
              <span className="text-[11px] text-ink-muted">Default stage</span>
            )}
          </div>
          <div className="flex items-center gap-2">
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
              Save
            </button>
          </div>
        </div>
      </form>
    </dialog>
  );
}
