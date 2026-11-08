"use client";

import React from "react";
import type { KanbanColumn, Sprint, TaskPriority, TaskStatus } from "@/types/outterring";
import { KanbanAddColumnModal } from "./KanbanAddColumnModal";
import { KanbanCreateTaskModal } from "./KanbanCreateTaskModal";
import { KanbanEditColumnModal } from "./KanbanEditColumnModal";
import { KanbanSprintModal } from "./KanbanSprintModal";

interface KanbanBoardModalsProps {
  isComposerOpen: boolean;
  composerTargetStatus: TaskStatus;
  boardColumns: KanbanColumn[];
  currentSprintId?: string | null;
  onCloseComposer: () => void;
  onCreateTask: (payload: {
    title: string;
    description: string;
    priority: TaskPriority;
    estimated_minutes: number;
    kickstart_action: string;
    status: TaskStatus;
    sprint_id?: string | null;
  }) => void;
  isSprintModalOpen: boolean;
  sprintModalMode: "create" | "edit";
  activeSprint: Sprint | null;
  onCloseSprintModal: () => void;
  onCreateSprint: (
    title: string,
    goal: string,
    moveUnfinishedTasks?: boolean
  ) => Promise<string | null>;
  onUpdateSprint: (
    sprintId: string,
    patch: { title?: string; goal?: string }
  ) => Promise<void>;
  onSprintCreated: () => void;
  isAddColumnOpen: boolean;
  onCloseAddColumn: () => void;
  onCreateColumn?: (title: string, wip_limit?: number | null, color?: string) => Promise<void>;
  editingCol: KanbanColumn | null;
  onCloseEditColumn: () => void;
  onUpdateColumn?: (columnId: string, patch: Partial<KanbanColumn>) => Promise<void>;
  onDeleteColumn?: (columnId: string) => Promise<void>;
  onReorderColumns?: (reordered: KanbanColumn[]) => Promise<void>;
}

export function KanbanBoardModals({
  isComposerOpen,
  composerTargetStatus,
  boardColumns,
  currentSprintId,
  onCloseComposer,
  onCreateTask,
  isSprintModalOpen,
  sprintModalMode,
  activeSprint,
  onCloseSprintModal,
  onCreateSprint,
  onUpdateSprint,
  onSprintCreated,
  isAddColumnOpen,
  onCloseAddColumn,
  onCreateColumn,
  editingCol,
  onCloseEditColumn,
  onUpdateColumn,
  onDeleteColumn,
  onReorderColumns,
}: KanbanBoardModalsProps) {
  return (
    <>
      <KanbanCreateTaskModal
        isOpen={isComposerOpen}
        targetStatus={composerTargetStatus}
        boardColumns={boardColumns}
        currentSprintId={currentSprintId}
        onClose={onCloseComposer}
        onCreateTask={onCreateTask}
      />

      <KanbanSprintModal
        isOpen={isSprintModalOpen}
        mode={sprintModalMode}
        activeSprint={activeSprint}
        onClose={onCloseSprintModal}
        onCreateSprint={onCreateSprint}
        onUpdateSprint={onUpdateSprint}
        onSprintCreated={onSprintCreated}
      />

      <KanbanAddColumnModal
        isOpen={isAddColumnOpen}
        onClose={onCloseAddColumn}
        onCreateColumn={onCreateColumn}
      />

      <KanbanEditColumnModal
        editingCol={editingCol}
        boardColumns={boardColumns}
        onClose={onCloseEditColumn}
        onUpdateColumn={onUpdateColumn}
        onDeleteColumn={onDeleteColumn}
        onReorderColumns={onReorderColumns}
      />
    </>
  );
}
