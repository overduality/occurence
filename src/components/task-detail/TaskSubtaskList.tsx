"use client";

import React, { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { sounds } from "@/lib/sound";
import type { Subtask } from "@/types/outterring";

interface TaskSubtaskListProps {
  taskId: string;
  subtasks: Subtask[];
  onAddSubtask: (taskId: string, title: string) => void;
  onToggleSubtask: (subtaskId: string, completed: boolean) => void;
  onRenameSubtask: (subtaskId: string, title: string) => void;
  onDeleteSubtask: (subtaskId: string) => void;
}

export function TaskSubtaskList({
  taskId,
  subtasks,
  onAddSubtask,
  onToggleSubtask,
  onRenameSubtask,
  onDeleteSubtask,
}: TaskSubtaskListProps) {
  const [newSubtask, setNewSubtask] = useState("");

  const handleAddCheckpoint = () => {
    if (!newSubtask.trim()) return;
    sounds.playPop();
    onAddSubtask(taskId, newSubtask.trim());
    setNewSubtask("");
  };

  const completedCount = subtasks.filter((s) => s.is_completed).length;

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-xs font-medium text-ink-secondary">
          Subtasks ({completedCount}/{subtasks.length})
        </span>
      </div>

      {subtasks.length > 0 && (
        <ul className="divide-y divide-line-subtle rounded-lg border border-line-subtle bg-card">
          {subtasks.map((sub) => (
            <li
              key={sub.id}
              className="flex items-center justify-between gap-2 px-3 py-1.5"
            >
              <div className="flex flex-1 items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={Boolean(sub.is_completed)}
                  onChange={(e) => {
                    sounds.playPop();
                    onToggleSubtask(sub.id, e.target.checked);
                  }}
                  aria-label={`Mark checkpoint ${sub.title} complete`}
                  className="h-3.5 w-3.5 shrink-0 cursor-pointer rounded border-line-strong"
                />
                <input
                  type="text"
                  defaultValue={sub.title}
                  key={`${sub.id}-${sub.title}`}
                  onBlur={(e) => {
                    const val = e.target.value.trim();
                    if (val && val !== sub.title) {
                      onRenameSubtask(sub.id, val);
                    }
                  }}
                  aria-label="Checkpoint title"
                  className={`w-full bg-transparent py-0.5 text-xs outline-none focus:text-ink-primary ${
                    sub.is_completed
                      ? "line-through text-ink-muted"
                      : "text-ink-primary"
                  }`}
                />
              </div>

              <button
                type="button"
                aria-label={`Delete checkpoint ${sub.title}`}
                onClick={() => {
                  sounds.playPop();
                  onDeleteSubtask(sub.id);
                }}
                className="rounded p-1 text-ink-muted hover:bg-status-danger-soft hover:text-status-danger-ink"
              >
                <Trash2 className="h-3 w-3" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-2 flex items-center gap-2">
        <input
          type="text"
          value={newSubtask}
          onChange={(e) => setNewSubtask(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAddCheckpoint();
            }
          }}
          placeholder="+ Add subtask..."
          aria-label="New checkpoint title"
          className="w-full rounded-lg border border-line-subtle bg-well/60 px-3 py-1.5 text-xs text-ink-primary placeholder-ink-muted outline-none transition-colors focus:border-accent focus:bg-card"
        />
        {newSubtask.trim() && (
          <button
            type="button"
            onClick={handleAddCheckpoint}
            className="miro-tactile inline-flex shrink-0 items-center gap-1 rounded-md border border-line-subtle bg-card px-2.5 py-1.5 text-xs font-medium text-ink-primary hover:bg-hover"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Add</span>
          </button>
        )}
      </div>
    </div>
  );
}
