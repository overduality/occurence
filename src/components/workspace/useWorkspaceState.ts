"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { runViewTransition } from "@/lib/web-platform";
import type {
  DailyMetrics,
  Doc,
  KanbanColumn,
  Sprint,
  Subtask,
  Task,
  WorkspaceSnapshot,
  WorkspaceTab,
} from "@/types/outterring";

const TAB_ORDER: Record<WorkspaceTab, number> = {
  focus: 0,
  board: 1,
  docs: 2,
};

export function useWorkspaceState(initialSnapshot: WorkspaceSnapshot) {
  const [currentTab, setCurrentTab] = useState<WorkspaceTab>("focus");
  const currentTabRef = useRef<WorkspaceTab>("focus");
  currentTabRef.current = currentTab;

  const navigateToTab = useCallback((nextTab: WorkspaceTab) => {
    const prevTab = currentTabRef.current;
    if (prevTab === nextTab) return;
    const direction = TAB_ORDER[nextTab] > TAB_ORDER[prevTab] ? "forward" : "backward";
    runViewTransition(() => {
      setCurrentTab(nextTab);
    }, direction);
  }, []);

  const [tasks, setTasks] = useState<Task[]>(initialSnapshot.tasks);
  const [subtasks, setSubtasks] = useState<Subtask[]>(initialSnapshot.subtasks);
  const [sprints, setSprints] = useState<Sprint[]>(initialSnapshot.sprints);
  const [docs, setDocs] = useState<Doc[]>(initialSnapshot.docs);
  const [columns, setColumns] = useState<KanbanColumn[]>(
    initialSnapshot.columns && initialSnapshot.columns.length > 0
      ? initialSnapshot.columns
      : [
          { id: "in_progress", title: "In Progress", order_idx: 0, wip_limit: 1, is_system: 1, color: "accent" },
          { id: "todo", title: "To Do", order_idx: 1, wip_limit: null, is_system: 1, color: "muted" },
          { id: "done", title: "Done", order_idx: 2, wip_limit: null, is_system: 1, color: "success" },
          { id: "backlog", title: "Backlog", order_idx: 3, wip_limit: null, is_system: 0, color: "warn" },
        ]
  );
  const [todayMetrics, setTodayMetrics] = useState<DailyMetrics>(initialSnapshot.todayMetrics);

  const [isOmniOpen, setIsOmniOpen] = useState(false);
  const [isGroundingOpen, setIsGroundingOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [inspectedTaskId, setInspectedTaskId] = useState<string | null>(null);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(initialSnapshot.docs[0]?.id ?? null);
  const [kickstartTimerTrigger, setKickstartTimerTrigger] = useState(0);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  const noticeTimerRef = useRef<number | null>(null);

  const showNotice = useCallback((msg: string) => {
    setStatusNotice(msg);
    if (noticeTimerRef.current) {
      window.clearTimeout(noticeTimerRef.current);
    }
    noticeTimerRef.current = window.setTimeout(() => {
      setStatusNotice(null);
    }, 3200);
  }, []);

  const applySnapshot = useCallback(
    (
      snapshot: WorkspaceSnapshot,
      destinationTab?: WorkspaceTab,
      createdId?: string | null
    ) => {
      setTasks(snapshot.tasks);
      setSubtasks(snapshot.subtasks);
      setSprints(snapshot.sprints);
      setDocs(snapshot.docs);
      if (snapshot.columns && snapshot.columns.length > 0) {
        setColumns(snapshot.columns);
      }
      setTodayMetrics(snapshot.todayMetrics);

      if (destinationTab === "docs" && createdId) {
        setSelectedDocId(createdId);
      }
      if (destinationTab) {
        navigateToTab(destinationTab);
      }
    },
    [navigateToTab]
  );

  const activeTask = useMemo(() => {
    return tasks.find((t) => t.status === "in_progress") ?? null;
  }, [tasks]);

  const inspectedTask = useMemo(
    () => tasks.find((t) => t.id === inspectedTaskId) ?? null,
    [tasks, inspectedTaskId]
  );

  const todoTasks = useMemo(() => tasks.filter((t) => t.status === "todo"), [tasks]);
  const backlogTasks = useMemo(() => tasks.filter((t) => t.status === "backlog"), [tasks]);

  const activeSprint = useMemo(() => {
    const active = sprints.find((s) => s.status === "active");
    if (active) return active;
    if (activeTask?.sprint_id) {
      const taskSprint = sprints.find((s) => s.id === activeTask.sprint_id);
      if (taskSprint) return taskSprint;
    }
    return sprints[0] || null;
  }, [sprints, activeTask]);

  return {
    currentTab,
    navigateToTab,
    tasks,
    setTasks,
    subtasks,
    setSubtasks,
    sprints,
    setSprints,
    docs,
    setDocs,
    columns,
    setColumns,
    todayMetrics,
    setTodayMetrics,
    isOmniOpen,
    setIsOmniOpen,
    isGroundingOpen,
    setIsGroundingOpen,
    isOnboardingOpen,
    setIsOnboardingOpen,
    inspectedTaskId,
    setInspectedTaskId,
    selectedDocId,
    setSelectedDocId,
    kickstartTimerTrigger,
    setKickstartTimerTrigger,
    statusNotice,
    showNotice,
    applySnapshot,
    activeTask,
    inspectedTask,
    todoTasks,
    backlogTasks,
    activeSprint,
  };
}
