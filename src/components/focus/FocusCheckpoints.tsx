"use client";

import React, { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { sounds } from "@/lib/sound";
import type { Subtask } from "@/types/outterring";

interface FocusCheckpointsProps {
  taskId: string;
  taskSubtasks: Subtask[];
  onToggleSubtask: (subtaskId: string, completed: boolean) => void;
  onDeleteSubtask: (subtaskId: string) => void;
  onAddSubtask: (taskId: string, title: string) => void;
}

export function FocusCheckpoints({
  taskId,
  taskSubtasks,
  onToggleSubtask,
  onDeleteSubtask,
  onAddSubtask,
}: FocusCheckpointsProps) {
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");

  const handleSubtaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    sounds.playPop();
    onAddSubtask(taskId, newSubtaskTitle.trim());
    setNewSubtaskTitle("");
  };

  const completedSubtasks = taskSubtasks.filter((s) => s.is_completed).length;

  return (
    <div className="mt-6">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium text-ink-secondary">
          Subtasks ({completedSubtasks}/{taskSubtasks.length})
        </span>
      </div>

      {taskSubtasks.length > 0 && (
        <ul className="divide-y divide-line-subtle overflow-hidden rounded-2xl border border-line-subtle bg-well/45">
          {taskSubtasks.map((sub) => (
            <li
              key={sub.id}
              className={`subtask-row group flex items-center justify-between gap-2 px-3.5 py-2.5 ${
                sub.is_completed ? "is-subtask-done" : ""
              }`}
            >
              <label className="flex flex-1 cursor-pointer items-center gap-3 text-sm text-ink-primary">
                <input
                  type="checkbox"
                  checked={Boolean(sub.is_completed)}
                  onChange={(e) => {
                    sounds.playPop();
                    onToggleSubtask(sub.id, e.target.checked);
                  }}
                  className="h-4 w-4 shrink-0 cursor-pointer rounded-full border-line-strong"
                />
                <span className="subtask-label leading-snug">{sub.title}</span>
              </label>
              <button
                type="button"
                aria-label={`Remove checkpoint ${sub.title}`}
                onClick={() => {
                  sounds.playPop();
                  onDeleteSubtask(sub.id);
                }}
                className="rounded-full p-1 text-ink-muted opacity-0 transition-opacity hover:bg-status-danger-soft hover:text-status-danger-ink focus:opacity-100 group-hover:opacity-100"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleSubtaskSubmit} className="mt-2.5 flex items-center gap-2">
        <label htmlFor="new-micro-checkpoint" className="sr-only">
          Add subtask
        </label>
        <input
          id="new-micro-checkpoint"
          type="text"
          value={newSubtaskTitle}
          onChange={(e) => setNewSubtaskTitle(e.target.value)}
          placeholder="+ Add subtask..."
          className="w-full rounded-xl border border-line-subtle bg-well/65 px-3.5 py-2 text-xs text-ink-primary placeholder-ink-muted outline-none transition-colors focus:border-accent focus:bg-card"
        />
        {newSubtaskTitle.trim() && (
          <button
            type="submit"
            className="miro-tactile liquid-nav-bubble inline-flex shrink-0 items-center gap-1 rounded-full px-3.5 py-2 text-xs font-medium text-ink-primary"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Add</span>
          </button>
        )}
      </form>
    </div>
  );
}
