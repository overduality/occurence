"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import { sounds } from "@/lib/sound";
import type { TaskStatus } from "@/types/outterring";

interface KanbanColumnInlineAddProps {
  status: TaskStatus;
  onInlineAdd: (status: TaskStatus, title: string) => void;
}

export function KanbanColumnInlineAdd({
  status,
  onInlineAdd,
}: KanbanColumnInlineAddProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [inlineTitle, setInlineTitle] = useState("");

  const handleSubmit = () => {
    const clean = inlineTitle.trim();
    if (!clean) {
      setIsAdding(false);
      return;
    }
    sounds.playPop();
    onInlineAdd(status, clean);
    setInlineTitle("");
    setIsAdding(false);
  };

  if (!isAdding) {
    return (
      <div className="mt-2.5 pt-1">
        <button
          type="button"
          onClick={() => {
            setIsAdding(true);
            setInlineTitle("");
          }}
          className="flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-ink-secondary transition-colors hover:bg-hover hover:text-ink-primary"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Add step</span>
        </button>
      </div>
    );
  }

  return (
    <div className="mt-2.5 pt-1">
      <div className="rounded-lg border border-accent bg-card p-2">
        <input
          type="text"
          autoFocus
          value={inlineTitle}
          onChange={(e) => setInlineTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSubmit();
            } else if (e.key === "Escape") {
              setIsAdding(false);
              setInlineTitle("");
            }
          }}
          placeholder="Type action and press Enter..."
          className="w-full bg-transparent text-xs text-ink-primary placeholder-ink-muted outline-none"
        />
        <div className="mt-2 flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => {
              setIsAdding(false);
              setInlineTitle("");
            }}
            className="rounded px-2 py-0.5 text-[11px] text-ink-muted hover:text-ink-primary"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="rounded bg-accent px-2.5 py-0.5 text-[11px] font-medium text-accent-fg hover:bg-accent-hover"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
