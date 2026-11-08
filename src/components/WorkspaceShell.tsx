"use client";

import React from "react";
import { FocusHUD } from "@/components/FocusHUD";
import { Header } from "@/components/Header";
import { KanbanBoard } from "@/components/KanbanBoard";
import { Scratchpad } from "@/components/Scratchpad";
import type { WorkspaceSnapshot } from "@/types/outterring";
import { useDocOperations } from "./workspace/useDocOperations";
import { useGlobalShortcuts } from "./workspace/useGlobalShortcuts";
import { useSprintAndColumnOperations } from "./workspace/useSprintAndColumnOperations";
import { useSubtaskOperations } from "./workspace/useSubtaskOperations";
import { useTaskOperations } from "./workspace/useTaskOperations";
import { useWorkspaceState } from "./workspace/useWorkspaceState";
import { WorkspaceModals } from "./workspace/WorkspaceModals";

interface WorkspaceShellProps {
  initialSnapshot: WorkspaceSnapshot;
}

export function WorkspaceShell({ initialSnapshot }: WorkspaceShellProps) {
  const state = useWorkspaceState(initialSnapshot);

  const taskOps = useTaskOperations({
    tasks: state.tasks,
    setTasks: state.setTasks,
    subtasks: state.subtasks,
    setSubtasks: state.setSubtasks,
    todayMetrics: state.todayMetrics,
    setTodayMetrics: state.setTodayMetrics,
    activeTask: state.activeTask,
    todoTasks: state.todoTasks,
    backlogTasks: state.backlogTasks,
    activeSprint: state.activeSprint,
    inspectedTaskId: state.inspectedTaskId,
    setInspectedTaskId: state.setInspectedTaskId,
    showNotice: state.showNotice,
    applySnapshot: state.applySnapshot,
    navigateToTab: state.navigateToTab,
    setKickstartTimerTrigger: state.setKickstartTimerTrigger,
  });

  const subtaskOps = useSubtaskOperations({
    subtasks: state.subtasks,
    setSubtasks: state.setSubtasks,
  });

  const sprintAndColOps = useSprintAndColumnOperations({
    applySnapshot: state.applySnapshot,
    showNotice: state.showNotice,
    setColumns: state.setColumns,
  });

  const docOps = useDocOperations({
    docs: state.docs,
    setDocs: state.setDocs,
    selectedDocId: state.selectedDocId,
    setSelectedDocId: state.setSelectedDocId,
    navigateToTab: state.navigateToTab,
    showNotice: state.showNotice,
    applySnapshot: state.applySnapshot,
    todayMetrics: state.todayMetrics,
    sprints: state.sprints,
    tasks: state.tasks,
    subtasks: state.subtasks,
  });

  useGlobalShortcuts({
    currentTab: state.currentTab,
    navigateToTab: state.navigateToTab,
    activeTask: state.activeTask,
    isOmniOpen: state.isOmniOpen,
    setIsOmniOpen: state.setIsOmniOpen,
    isGroundingOpen: state.isGroundingOpen,
    setIsGroundingOpen: state.setIsGroundingOpen,
    setIsOnboardingOpen: state.setIsOnboardingOpen,
    inspectedTaskId: state.inspectedTaskId,
    setInspectedTaskId: state.setInspectedTaskId,
    handleCompleteTask: taskOps.handleCompleteTask,
  });

  return (
    <div className="miro-canvas flex min-h-screen flex-col text-ink-primary">
      <Header
        currentTab={state.currentTab}
        onTabChange={state.navigateToTab}
        onOpenOmniBar={() => state.setIsOmniOpen(true)}
        onTriggerGrounding={() => state.setIsGroundingOpen(true)}
        onOpenGuide={() => state.setIsOnboardingOpen(true)}
        onExportWorkspace={docOps.handleExportWorkspace}
        tasksCompletedCount={state.todayMetrics.tasks_completed}
        focusMinutesCount={state.todayMetrics.focus_minutes}
        activeSprintTitle={state.activeSprint?.title ?? null}
        hasActiveFocus={Boolean(state.activeTask)}
        runwayCount={state.todoTasks.length + (state.activeTask ? 1 : 0)}
        docsCount={state.docs.length}
      />

      <main className="workspace-stage flex-1">
        {state.currentTab === "focus" && (
          <FocusHUD
            activeTask={state.activeTask}
            todoTasks={state.todoTasks}
            backlogCount={state.backlogTasks.length}
            subtasks={state.subtasks}
            activeSprint={state.activeSprint}
            kickstartTimerTrigger={state.kickstartTimerTrigger}
            onCompleteTask={taskOps.handleCompleteTask}
            onToggleKickstart={taskOps.handleToggleKickstart}
            onToggleSubtask={subtaskOps.handleToggleSubtask}
            onDeleteSubtask={subtaskOps.handleDeleteSubtask}
            onAddSubtask={subtaskOps.handleAddSubtask}
            onPromoteTask={(taskId) => taskOps.handleMoveTask(taskId, "in_progress")}
            onParkActiveTask={taskOps.handleParkActiveAndSwap}
            onSliceTask={taskOps.handleSliceTask}
            onInspectTask={(task) => state.setInspectedTaskId(task.id)}
            onRecordFocusMinutes={taskOps.handleRecordFocusMinutes}
            onTriggerGrounding={() => state.setIsGroundingOpen(true)}
            onOpenOmniBar={() => state.setIsOmniOpen(true)}
            onPullFromBacklog={taskOps.handlePullFromBacklog}
          />
        )}

        {state.currentTab === "board" && (
          <KanbanBoard
            tasks={state.tasks}
            subtasks={state.subtasks}
            sprints={state.sprints}
            columns={state.columns}
            activeSprint={state.activeSprint}
            onMoveTask={taskOps.handleMoveTask}
            onCreateTask={taskOps.handleCreateTask}
            onInspectTask={(task) => state.setInspectedTaskId(task.id)}
            onSliceTask={taskOps.handleSliceTask}
            onDeleteTask={taskOps.handleDeleteTask}
            onClearCompleted={taskOps.handleClearCompleted}
            onCreateSprint={sprintAndColOps.handleCreateSprint}
            onUpdateSprint={sprintAndColOps.handleUpdateSprint}
            onCreateColumn={sprintAndColOps.handleCreateColumn}
            onUpdateColumn={sprintAndColOps.handleUpdateColumn}
            onDeleteColumn={sprintAndColOps.handleDeleteColumn}
            onReorderColumns={sprintAndColOps.handleReorderColumns}
            onSwitchToFocusHUD={() => state.navigateToTab("focus")}
            onOpenGuide={() => state.setIsOnboardingOpen(true)}
          />
        )}

        {state.currentTab === "docs" && (
          <Scratchpad
            docs={state.docs}
            selectedDocId={state.selectedDocId}
            onSelectDoc={state.setSelectedDocId}
            onCreateDoc={docOps.handleCreateDoc}
            onUpdateDoc={docOps.handleUpdateDoc}
            onDeleteDoc={docOps.handleDeleteDoc}
            onExtractTasksFromDoc={docOps.handleExtractTasksFromDoc}
          />
        )}
      </main>

      <WorkspaceModals
        statusNotice={state.statusNotice}
        isOmniOpen={state.isOmniOpen}
        onCloseOmni={() => state.setIsOmniOpen(false)}
        tasks={state.tasks}
        docs={state.docs}
        subtasks={state.subtasks}
        sprints={state.sprints}
        columns={state.columns}
        activeTask={state.activeTask}
        todoTasks={state.todoTasks}
        inspectedTask={state.inspectedTask}
        isGroundingOpen={state.isGroundingOpen}
        isOnboardingOpen={state.isOnboardingOpen}
        onCloseGrounding={() => state.setIsGroundingOpen(false)}
        onCloseOnboarding={() => state.setIsOnboardingOpen(false)}
        onCloseTaskDetail={() => state.setInspectedTaskId(null)}
        onNavigateTab={state.navigateToTab}
        onApplySnapshot={state.applySnapshot}
        onShowNotice={state.showNotice}
        onMoveTask={taskOps.handleMoveTask}
        onSelectDocId={state.setSelectedDocId}
        onSaveTaskDetails={taskOps.handleSaveTaskDetails}
        onDeleteTask={taskOps.handleDeleteTask}
        onAddSubtask={subtaskOps.handleAddSubtask}
        onToggleSubtask={subtaskOps.handleToggleSubtask}
        onRenameSubtask={subtaskOps.handleRenameSubtask}
        onDeleteSubtask={subtaskOps.handleDeleteSubtask}
        onConvertTaskToDoc={docOps.handleConvertTaskToDoc}
        onEngageTwoMinuteKickstart={taskOps.handleEngageTwoMinuteKickstart}
        onSliceTask={taskOps.handleSliceTask}
        onParkActiveAndSwap={taskOps.handleParkActiveAndSwap}
        onOpenOmniBar={() => state.setIsOmniOpen(true)}
      />
    </div>
  );
}
