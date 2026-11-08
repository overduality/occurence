"use client";

import { useMemo, useState } from "react";
import { formatIssueKey } from "@/lib/web-platform";
import type { KanbanColumn, Sprint, Subtask, Task, TaskPriority } from "@/types/outterring";

export function useKanbanBoardState(
  tasks: Task[],
  subtasks: Subtask[],
  sprints: Sprint[],
  columns?: KanbanColumn[],
  activeSprint?: Sprint | null
) {
  const [showBacklogVault, setShowBacklogVault] = useState(false);
  const [boardSearch, setBoardSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<"all" | TaskPriority>("all");
  const [sprintFilter, setSprintFilter] = useState<string>("active");
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);
  const [slicingTaskId, setSlicingTaskId] = useState<string | null>(null);

  const subtaskStats = useMemo(() => {
    const map = new Map<string, { done: number; total: number }>();
    for (const s of subtasks) {
      const curr = map.get(s.task_id) || { done: 0, total: 0 };
      curr.total += 1;
      if (s.is_completed) curr.done += 1;
      map.set(s.task_id, curr);
    }
    return map;
  }, [subtasks]);

  const sprintMap = useMemo(() => new Map(sprints.map((s) => [s.id, s])), [sprints]);

  const currentViewedSprint = useMemo(() => {
    if (sprintFilter === "active") return activeSprint ?? null;
    if (sprintFilter === "all" || sprintFilter === "unassigned") return null;
    return sprintMap.get(sprintFilter) || null;
  }, [sprintFilter, activeSprint, sprintMap]);

  const isViewingSpecificSprint = currentViewedSprint !== null;

  const currentSprintTasks = useMemo(() => {
    if (!currentViewedSprint) return [];
    return tasks.filter((t) => t.sprint_id === currentViewedSprint.id);
  }, [tasks, currentViewedSprint]);

  const hasOtherUnfinishedTasks = useMemo(() => {
    if (!currentViewedSprint) return false;
    return tasks.some(
      (t) =>
        (t.status === "todo" || t.status === "in_progress") &&
        t.sprint_id !== currentViewedSprint.id
    );
  }, [tasks, currentViewedSprint]);

  const visibleTasks = useMemo(() => {
    const q = boardSearch.trim().toLowerCase();
    return tasks.filter((t) => {
      if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;
      if (sprintFilter === "unassigned") {
        if (t.sprint_id) return false;
      } else if (sprintFilter === "active") {
        if (activeSprint) {
          if (t.sprint_id !== activeSprint.id) return false;
        }
      } else if (sprintFilter !== "all") {
        if (t.sprint_id !== sprintFilter) return false;
      }
      if (!q) return true;
      const key = formatIssueKey(t.id).toLowerCase();
      return (
        key.includes(q) ||
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
      );
    });
  }, [tasks, boardSearch, priorityFilter, sprintFilter, activeSprint]);

  const backlogCount = useMemo(
    () => tasks.filter((t) => t.status === "backlog").length,
    [tasks]
  );

  const activeRunwayLoad = useMemo(
    () => tasks.filter((t) => t.status === "in_progress" || t.status === "todo").length,
    [tasks]
  );

  const boardColumns = useMemo(() => {
    if (columns && columns.length > 0) {
      return [...columns].sort((a, b) => a.order_idx - b.order_idx);
    }
    return [
      { id: "in_progress", title: "In Progress", order_idx: 0, wip_limit: 1, is_system: 1, color: "accent" },
      { id: "todo", title: "To Do", order_idx: 1, wip_limit: null, is_system: 1, color: "muted" },
      { id: "done", title: "Done", order_idx: 2, wip_limit: null, is_system: 1, color: "success" },
      { id: "backlog", title: "Backlog", order_idx: 3, wip_limit: null, is_system: 0, color: "warn" },
    ];
  }, [columns]);

  const displayedColumns = useMemo(() => {
    return boardColumns.filter((col) => {
      if (col.id === "backlog") return showBacklogVault;
      return true;
    });
  }, [boardColumns, showBacklogVault]);

  return {
    showBacklogVault,
    setShowBacklogVault,
    boardSearch,
    setBoardSearch,
    priorityFilter,
    setPriorityFilter,
    sprintFilter,
    setSprintFilter,
    draggedTaskId,
    setDraggedTaskId,
    dragOverCol,
    setDragOverCol,
    slicingTaskId,
    setSlicingTaskId,
    subtaskStats,
    sprintMap,
    currentViewedSprint,
    isViewingSpecificSprint,
    currentSprintTasks,
    hasOtherUnfinishedTasks,
    visibleTasks,
    backlogCount,
    activeRunwayLoad,
    boardColumns,
    displayedColumns,
  };
}
