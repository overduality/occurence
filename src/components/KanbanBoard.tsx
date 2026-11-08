"use client";

import React, { useState } from "react";
import { sounds } from "@/lib/sound";
import type { KanbanColumn as IKanbanColumn, TaskStatus } from "@/types/outterring";
import { KanbanBoardModals } from "./kanban/KanbanBoardModals";
import { KanbanColumn } from "./kanban/KanbanColumn";
import { KanbanEmptySprintBanner } from "./kanban/KanbanEmptySprintBanner";
import { KanbanHeader } from "./kanban/KanbanHeader";
import type { KanbanBoardProps } from "./kanban/types";
import { useKanbanBoardState } from "./kanban/useKanbanBoardState";

export function KanbanBoard({
  tasks,
  subtasks,
  sprints,
  columns,
  activeSprint,
  onMoveTask,
  onCreateTask,
  onInspectTask,
  onSliceTask,
  onDeleteTask,
  onClearCompleted,
  onCreateSprint,
  onUpdateSprint,
  onCreateColumn,
  onUpdateColumn,
  onDeleteColumn,
  onReorderColumns,
  onSwitchToFocusHUD,
}: KanbanBoardProps) {
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [composerTargetStatus, setComposerTargetStatus] = useState<TaskStatus>("todo");
  const [isSprintModalOpen, setIsSprintModalOpen] = useState(false);
  const [sprintModalMode, setSprintModalMode] = useState<"create" | "edit">("create");
  const [isAddColumnOpen, setIsAddColumnOpen] = useState(false);
  const [editingCol, setEditingCol] = useState<IKanbanColumn | null>(null);

  const state = useKanbanBoardState(tasks, subtasks, sprints, columns, activeSprint);

  const handleSliceWithFeedback = async (taskId: string) => {
    state.setSlicingTaskId(taskId);
    sounds.playPop();
    try {
      await onSliceTask(taskId);
    } finally {
      state.setSlicingTaskId(null);
    }
  };

  const handleInlineAdd = (status: TaskStatus, title: string) => {
    onCreateTask({
      title,
      description: "",
      priority: "medium",
      estimated_minutes: 10,
      kickstart_action: "",
      status,
      sprint_id: state.currentViewedSprint?.id ?? activeSprint?.id ?? null,
    });
  };

  return (
    <section aria-label="Sprint Board" className="mx-auto max-w-7xl px-4 pt-3 pb-14 sm:px-6 sm:pt-5">
      <KanbanHeader
        currentViewedSprint={state.currentViewedSprint}
        activeSprint={activeSprint}
        sprints={sprints}
        sprintFilter={state.sprintFilter}
        totalTasks={tasks.length}
        backlogCount={state.backlogCount}
        activeRunwayLoad={state.activeRunwayLoad}
        showBacklogVault={state.showBacklogVault}
        boardSearch={state.boardSearch}
        priorityFilter={state.priorityFilter}
        onToggleBacklogVault={() => state.setShowBacklogVault((v) => !v)}
        onOpenSprintEditor={(mode) => {
          sounds.playPop();
          setSprintModalMode(mode);
          setIsSprintModalOpen(true);
        }}
        onCompleteSprint={(sprintId) => {
          sounds.playComplete();
          void onUpdateSprint(sprintId, { status: "completed", parkUnfinished: false });
        }}
        onOpenAddColumn={() => {
          sounds.playPop();
          setIsAddColumnOpen(true);
        }}
        onOpenStepComposer={() => {
          sounds.playPop();
          setComposerTargetStatus("todo");
          setIsComposerOpen(true);
        }}
        onSelectSprintFilter={state.setSprintFilter}
        onSearchChange={state.setBoardSearch}
        onPriorityChange={state.setPriorityFilter}
      />

      {state.isViewingSpecificSprint && state.currentSprintTasks.length === 0 && (
        <KanbanEmptySprintBanner
          currentViewedSprint={state.currentViewedSprint!}
          hasOtherUnfinishedTasks={state.hasOtherUnfinishedTasks}
          onRollOverUnfinished={async (sprintId) => {
            await onUpdateSprint(sprintId, { pullUnfinishedTasks: true });
          }}
          onOpenStepComposer={() => {
            setComposerTargetStatus("todo");
            setIsComposerOpen(true);
          }}
        />
      )}

      <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
        {state.displayedColumns.map((col) => (
          <KanbanColumn
            key={col.id}
            col={col}
            tasks={state.visibleTasks.filter((t) => t.status === col.id)}
            dragOverCol={state.dragOverCol}
            subtaskStats={state.subtaskStats}
            sprintMap={state.sprintMap}
            sprintFilter={state.sprintFilter}
            slicingTaskId={state.slicingTaskId}
            onDrop={(status) => {
              if (state.draggedTaskId) onMoveTask(state.draggedTaskId, status);
              state.setDraggedTaskId(null);
              state.setDragOverCol(null);
            }}
            onDragOver={state.setDragOverCol}
            onDragLeave={() => state.setDragOverCol(null)}
            onClearCompleted={onClearCompleted}
            onOpenColumnEditor={(c) => {
              sounds.playPop();
              setEditingCol(c);
            }}
            onInlineAdd={handleInlineAdd}
            onInspectTask={onInspectTask}
            onMoveTask={onMoveTask}
            onSwitchToFocusHUD={onSwitchToFocusHUD}
            onSliceTask={handleSliceWithFeedback}
            onDeleteTask={onDeleteTask}
            onDragStart={state.setDraggedTaskId}
            onDragEnd={() => {
              state.setDraggedTaskId(null);
              state.setDragOverCol(null);
            }}
          />
        ))}
      </div>

      <KanbanBoardModals
        isComposerOpen={isComposerOpen}
        composerTargetStatus={composerTargetStatus}
        boardColumns={state.boardColumns}
        currentSprintId={state.currentViewedSprint?.id ?? activeSprint?.id ?? null}
        onCloseComposer={() => setIsComposerOpen(false)}
        onCreateTask={onCreateTask}
        isSprintModalOpen={isSprintModalOpen}
        sprintModalMode={sprintModalMode}
        activeSprint={activeSprint}
        onCloseSprintModal={() => setIsSprintModalOpen(false)}
        onCreateSprint={onCreateSprint}
        onUpdateSprint={onUpdateSprint}
        onSprintCreated={() => state.setSprintFilter("active")}
        isAddColumnOpen={isAddColumnOpen}
        onCloseAddColumn={() => setIsAddColumnOpen(false)}
        onCreateColumn={onCreateColumn}
        editingCol={editingCol}
        onCloseEditColumn={() => setEditingCol(null)}
        onUpdateColumn={onUpdateColumn}
        onDeleteColumn={onDeleteColumn}
        onReorderColumns={onReorderColumns}
      />
    </section>
  );
}
