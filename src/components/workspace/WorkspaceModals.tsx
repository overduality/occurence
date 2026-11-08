"use client";

import React from "react";
import { CheckCircle2 } from "lucide-react";
import { GroundingModal } from "@/components/GroundingModal";
import { OnboardingModal } from "@/components/OnboardingModal";
import { OmniBar } from "@/components/OmniBar";
import { TaskDetailModal } from "@/components/TaskDetailModal";
import type {
  Doc,
  KanbanColumn,
  Sprint,
  Subtask,
  Task,
  TaskPriority,
  TaskStatus,
  WorkspaceSnapshot,
  WorkspaceTab,
} from "@/types/outterring";

interface WorkspaceModalsProps {
  statusNotice: string | null;
  isOmniOpen: boolean;
  onCloseOmni: () => void;
  tasks: Task[];
  docs: Doc[];
  subtasks: Subtask[];
  sprints: Sprint[];
  columns: KanbanColumn[];
  activeTask: Task | null;
  todoTasks: Task[];
  inspectedTask: Task | null;
  isGroundingOpen: boolean;
  isOnboardingOpen: boolean;
  onCloseGrounding: () => void;
  onCloseOnboarding: () => void;
  onCloseTaskDetail: () => void;
  onNavigateTab: (tab: WorkspaceTab) => void;
  onApplySnapshot: (snapshot: WorkspaceSnapshot, destTab?: WorkspaceTab, createdId?: string | null) => void;
  onShowNotice: (msg: string) => void;
  onMoveTask: (taskId: string, status: TaskStatus) => void;
  onSelectDocId: (docId: string) => void;
  onSaveTaskDetails: (
    taskId: string,
    patch: {
      title: string;
      description: string;
      kickstart_action: string;
      why_it_matters: string;
      status: TaskStatus;
      priority: TaskPriority;
      estimated_minutes: number;
      sprint_id: string | null;
    }
  ) => void;
  onDeleteTask: (taskId: string) => void;
  onAddSubtask: (taskId: string, rawTitle: string) => void;
  onToggleSubtask: (subtaskId: string, completed: boolean) => void;
  onRenameSubtask: (subtaskId: string, title: string) => void;
  onDeleteSubtask: (subtaskId: string) => void;
  onConvertTaskToDoc: (task: Task, taskSubtasks: Subtask[]) => void;
  onEngageTwoMinuteKickstart: (microAction: string) => void;
  onSliceTask: (taskId: string) => Promise<void>;
  onParkActiveAndSwap: (currentActiveId: string) => void;
  onOpenOmniBar: () => void;
}

export function WorkspaceModals({
  statusNotice,
  isOmniOpen,
  onCloseOmni,
  tasks,
  docs,
  subtasks,
  sprints,
  columns,
  activeTask,
  todoTasks,
  inspectedTask,
  isGroundingOpen,
  isOnboardingOpen,
  onCloseGrounding,
  onCloseOnboarding,
  onCloseTaskDetail,
  onNavigateTab,
  onApplySnapshot,
  onShowNotice,
  onMoveTask,
  onSelectDocId,
  onSaveTaskDetails,
  onDeleteTask,
  onAddSubtask,
  onToggleSubtask,
  onRenameSubtask,
  onDeleteSubtask,
  onConvertTaskToDoc,
  onEngageTwoMinuteKickstart,
  onSliceTask,
  onParkActiveAndSwap,
  onOpenOmniBar,
}: WorkspaceModalsProps) {
  return (
    <>
      {statusNotice && (
        <div
          role="status"
          aria-live="polite"
          className="miro-island fixed bottom-5 right-5 z-20 flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium text-ink-primary animate-fade-in"
        >
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-status-success-ink" aria-hidden="true" />
          <span>{statusNotice}</span>
        </div>
      )}

      <OmniBar
        isOpen={isOmniOpen}
        onClose={onCloseOmni}
        tasks={tasks}
        docs={docs}
        onSnapshotUpdated={(snapshot, destTab, createdId) => {
          onApplySnapshot(snapshot, destTab, createdId);
          onShowNotice(
            destTab === "docs"
              ? "Saved to Docs"
              : destTab === "board"
                ? "Sprint created"
                : "Step created"
          );
        }}
        onJumpToTask={(taskId) => {
          onMoveTask(taskId, "in_progress");
          onNavigateTab("focus");
        }}
        onJumpToDoc={(docId) => {
          onSelectDocId(docId);
          onNavigateTab("docs");
        }}
      />

      <TaskDetailModal
        task={inspectedTask}
        subtasks={subtasks}
        sprints={sprints}
        columns={columns}
        onClose={onCloseTaskDetail}
        onSaveTask={onSaveTaskDetails}
        onDeleteTask={onDeleteTask}
        onAddSubtask={onAddSubtask}
        onToggleSubtask={onToggleSubtask}
        onRenameSubtask={onRenameSubtask}
        onDeleteSubtask={onDeleteSubtask}
        onConvertTaskToDoc={onConvertTaskToDoc}
      />

      <GroundingModal
        isOpen={isGroundingOpen}
        onClose={onCloseGrounding}
        activeTask={activeTask}
        hasAlternateTodo={todoTasks.length > 0}
        onEngageTwoMinuteKickstart={onEngageTwoMinuteKickstart}
        onSliceActiveTask={async () => {
          if (activeTask) await onSliceTask(activeTask.id);
        }}
        onSwitchToLighterTask={() => {
          if (activeTask) onParkActiveAndSwap(activeTask.id);
        }}
        onOpenOmniBar={onOpenOmniBar}
      />

      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={onCloseOnboarding}
        onNavigateTab={onNavigateTab}
      />
    </>
  );
}
