"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { KanbanColumn } from "@/types/outterring";

interface KanbanColumnPositionControlProps {
  editingCol: KanbanColumn;
  boardColumns: KanbanColumn[];
  onMoveColumn: (direction: "left" | "right") => void;
}

export function KanbanColumnPositionControl({
  editingCol,
  boardColumns,
  onMoveColumn,
}: KanbanColumnPositionControlProps) {
  const currentIdx = boardColumns.findIndex((c) => c.id === editingCol.id);

  return (
    <div>
      <span className="block text-xs font-medium text-ink-primary">Position</span>
      <div className="mt-1.5 flex items-center gap-2">
        <button
          type="button"
          disabled={currentIdx <= 0}
          onClick={() => onMoveColumn("left")}
          className="miro-tactile flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-line-subtle bg-card py-1.5 text-xs text-ink-secondary hover:text-ink-primary disabled:opacity-30 disabled:pointer-events-none"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Move Left
        </button>
        <button
          type="button"
          disabled={currentIdx >= boardColumns.length - 1}
          onClick={() => onMoveColumn("right")}
          className="miro-tactile flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-line-subtle bg-card py-1.5 text-xs text-ink-secondary hover:text-ink-primary disabled:opacity-30 disabled:pointer-events-none"
        >
          Move Right
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
