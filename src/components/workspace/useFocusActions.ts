"use client";

import { useCallback } from "react";
import type { Task, TaskStatus, WorkspaceTab } from "@/types/outterring";

interface FocusActionsProps {
  activeTask: Task | null;
  todoTasks: Task[];
  backlogTasks: Task[];
  handleMoveTask: (taskId: string, newStatus: TaskStatus, autoPromoteNext?: boolean) => void;
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  navigateToTab: (tab: WorkspaceTab) => void;
  setKickstartTimerTrigger: React.Dispatch<React.SetStateAction<number>>;
  showNotice: (msg: string) => void;
}

export function useFocusActions({
  activeTask,
  todoTasks,
  backlogTasks,
  handleMoveTask,
  setTasks,
  navigateToTab,
  setKickstartTimerTrigger,
  showNotice,
}: FocusActionsProps) {
  const handleParkActiveAndSwap = useCallback(
    (currentActiveId: string) => {
      const nextCandidate = todoTasks[0];
      if (!nextCandidate) return;
      handleMoveTask(nextCandidate.id, "in_progress", false);
      showNotice("Swapped");
      void currentActiveId;
    },
    [todoTasks, handleMoveTask, showNotice]
  );

  const handlePullFromBacklog = useCallback(() => {
    const firstParked = backlogTasks[0];
    if (!firstParked) return;
    handleMoveTask(firstParked.id, "in_progress", false);
    showNotice("Promoted to Focus");
  }, [backlogTasks, handleMoveTask, showNotice]);

  const handleEngageTwoMinuteKickstart = useCallback(
    (microAction: string) => {
      if (activeTask && microAction && microAction !== activeTask.kickstart_action) {
        setTasks((curr) =>
          curr.map((t) => (t.id === activeTask.id ? { ...t, kickstart_action: microAction } : t))
        );
        void fetch("/api/tasks", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: activeTask.id, kickstart_action: microAction }),
        });
      }
      navigateToTab("focus");
      setKickstartTimerTrigger((n) => n + 1);
      showNotice("2m timer started");
    },
    [activeTask, navigateToTab, setTasks, setKickstartTimerTrigger, showNotice]
  );

  return {
    handleParkActiveAndSwap,
    handlePullFromBacklog,
    handleEngageTwoMinuteKickstart,
  };
}
