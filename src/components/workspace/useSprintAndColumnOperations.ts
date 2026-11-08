"use client";

import { useCallback } from "react";
import type { KanbanColumn, WorkspaceSnapshot } from "@/types/outterring";

interface SprintAndColumnOperationsProps {
  applySnapshot: (snapshot: WorkspaceSnapshot) => void;
  showNotice: (msg: string) => void;
  setColumns: React.Dispatch<React.SetStateAction<KanbanColumn[]>>;
}

export function useSprintAndColumnOperations({
  applySnapshot,
  showNotice,
  setColumns,
}: SprintAndColumnOperationsProps) {
  const handleCreateSprint = useCallback(
    async (
      title: string,
      goal: string,
      moveUnfinishedTasks = true
    ): Promise<string | null> => {
      try {
        const res = await fetch("/api/sprints", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            goal,
            makeActive: true,
            moveUnfinishedTasks,
          }),
        });
        if (res.ok) {
          const data = (await res.json()) as {
            id: string;
            snapshot: WorkspaceSnapshot;
          };
          applySnapshot(data.snapshot);
          showNotice("Sprint started");
          return data.id;
        }
      } catch {
        showNotice("Sprint error");
      }
      return null;
    },
    [applySnapshot, showNotice]
  );

  const handleUpdateSprint = useCallback(
    async (
      sprintId: string,
      patch: {
        title?: string;
        goal?: string;
        status?: "active" | "completed";
        parkUnfinished?: boolean;
        pullUnfinishedTasks?: boolean;
        assignTaskIds?: string[];
      }
    ) => {
      try {
        const res = await fetch("/api/sprints", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: sprintId, ...patch }),
        });
        if (res.ok) {
          const data = (await res.json()) as { snapshot: WorkspaceSnapshot };
          applySnapshot(data.snapshot);
          showNotice(
            patch.status === "completed"
              ? "Sprint completed"
              : patch.pullUnfinishedTasks
                ? "Tasks moved"
                : "Sprint updated"
          );
        }
      } catch {
        showNotice("Update error");
      }
    },
    [applySnapshot, showNotice]
  );

  const handleCreateColumn = useCallback(
    async (title: string, wip_limit?: number | null, color?: string) => {
      try {
        const res = await fetch("/api/columns", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, wip_limit, color }),
        });
        if (res.ok) {
          const data = (await res.json()) as { snapshot: WorkspaceSnapshot };
          applySnapshot(data.snapshot);
          showNotice("Column created");
        }
      } catch {
        showNotice("Column error");
      }
    },
    [applySnapshot, showNotice]
  );

  const handleUpdateColumn = useCallback(
    async (columnId: string, patch: Partial<KanbanColumn>) => {
      try {
        const res = await fetch("/api/columns", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: columnId, ...patch }),
        });
        if (res.ok) {
          const data = (await res.json()) as { snapshot: WorkspaceSnapshot };
          applySnapshot(data.snapshot);
          showNotice("Column updated");
        }
      } catch {
        showNotice("Update error");
      }
    },
    [applySnapshot, showNotice]
  );

  const handleDeleteColumn = useCallback(
    async (columnId: string) => {
      try {
        const res = await fetch(`/api/columns?id=${encodeURIComponent(columnId)}`, {
          method: "DELETE",
        });
        if (res.ok) {
          const data = (await res.json()) as { snapshot: WorkspaceSnapshot };
          applySnapshot(data.snapshot);
          showNotice("Column removed");
        }
      } catch {
        showNotice("Delete error");
      }
    },
    [applySnapshot, showNotice]
  );

  const handleReorderColumns = useCallback(
    async (reordered: KanbanColumn[]) => {
      setColumns(reordered);
      try {
        const payload = reordered.map((c, idx) => ({ id: c.id, order_idx: idx }));
        const res = await fetch("/api/columns", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reorder: payload }),
        });
        if (res.ok) {
          const data = (await res.json()) as { snapshot: WorkspaceSnapshot };
          applySnapshot(data.snapshot);
        }
      } catch {
        // Fallback silently
      }
    },
    [applySnapshot, setColumns]
  );

  return {
    handleCreateSprint,
    handleUpdateSprint,
    handleCreateColumn,
    handleUpdateColumn,
    handleDeleteColumn,
    handleReorderColumns,
  };
}
