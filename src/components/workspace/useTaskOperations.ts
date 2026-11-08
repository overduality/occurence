"use client";

import type {
  DailyMetrics,
  Sprint,
  Subtask,
  Task,
  WorkspaceSnapshot,
  WorkspaceTab,
} from "@/types/outterring";
import { useFocusActions } from "./useFocusActions";
import { useTaskLifecycle } from "./useTaskLifecycle";
import { useTaskMutations } from "./useTaskMutations";

interface TaskOperationsProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  subtasks: Subtask[];
  setSubtasks: React.Dispatch<React.SetStateAction<Subtask[]>>;
  todayMetrics: DailyMetrics;
  setTodayMetrics: React.Dispatch<React.SetStateAction<DailyMetrics>>;
  activeTask: Task | null;
  todoTasks: Task[];
  backlogTasks: Task[];
  activeSprint: Sprint | null;
  inspectedTaskId: string | null;
  setInspectedTaskId: React.Dispatch<React.SetStateAction<string | null>>;
  showNotice: (msg: string) => void;
  applySnapshot: (snapshot: WorkspaceSnapshot, destinationTab?: WorkspaceTab) => void;
  navigateToTab: (tab: WorkspaceTab) => void;
  setKickstartTimerTrigger: React.Dispatch<React.SetStateAction<number>>;
}

export function useTaskOperations({
  tasks,
  setTasks,
  subtasks,
  setSubtasks,
  todayMetrics,
  setTodayMetrics,
  activeTask,
  todoTasks,
  backlogTasks,
  activeSprint,
  inspectedTaskId,
  setInspectedTaskId,
  showNotice,
  applySnapshot,
  navigateToTab,
  setKickstartTimerTrigger,
}: TaskOperationsProps) {
  const mutations = useTaskMutations({
    tasks,
    setTasks,
    todayMetrics,
    setTodayMetrics,
    showNotice,
  });

  const lifecycle = useTaskLifecycle({
    tasks,
    setTasks,
    subtasks,
    setSubtasks,
    activeSprint,
    inspectedTaskId,
    setInspectedTaskId,
    setTodayMetrics,
    showNotice,
    applySnapshot,
  });

  const focus = useFocusActions({
    activeTask,
    todoTasks,
    backlogTasks,
    handleMoveTask: mutations.handleMoveTask,
    setTasks,
    navigateToTab,
    setKickstartTimerTrigger,
    showNotice,
  });

  return {
    ...mutations,
    ...lifecycle,
    ...focus,
  };
}
