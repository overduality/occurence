"use client";

import React, { useState } from "react";
import { Clock, Pencil } from "lucide-react";
import { sounds } from "@/lib/sound";
import { formatIssueKey } from "@/lib/web-platform";
import type { Sprint, Subtask, Task } from "@/types/outterring";
import { PRIORITY_STYLES } from "./focus/constants";
import { FocusHUDEmptyState } from "./focus/FocusHUDEmptyState";
import { FocusTimerCapsule } from "./focus/FocusTimerCapsule";
import { FocusKickstartBox } from "./focus/FocusKickstartBox";
import { FocusCheckpoints } from "./focus/FocusCheckpoints";
import { FocusCardActions } from "./focus/FocusCardActions";
import { FocusRunwayQueue } from "./focus/FocusRunwayQueue";
import { useFocusTimer } from "./focus/useFocusTimer";

interface FocusHUDProps {
  activeTask: Task | null;
  todoTasks: Task[];
  backlogCount: number;
  subtasks: Subtask[];
  activeSprint: Sprint | null;
  kickstartTimerTrigger: number;
  onCompleteTask: (taskId: string) => void;
  onToggleKickstart: (taskId: string, completed: boolean) => void;
  onToggleSubtask: (subtaskId: string, completed: boolean) => void;
  onDeleteSubtask: (subtaskId: string) => void;
  onAddSubtask: (taskId: string, title: string) => void;
  onPromoteTask: (taskId: string) => void;
  onParkActiveTask: (taskId: string) => void;
  onSliceTask: (taskId: string) => Promise<void>;
  onInspectTask: (task: Task) => void;
  onRecordFocusMinutes: (minutes: number) => void;
  onTriggerGrounding: () => void;
  onOpenOmniBar: () => void;
  onPullFromBacklog: () => void;
}

export function FocusHUD({
  activeTask,
  todoTasks,
  backlogCount,
  subtasks,
  activeSprint,
  kickstartTimerTrigger,
  onCompleteTask,
  onToggleKickstart,
  onToggleSubtask,
  onDeleteSubtask,
  onAddSubtask,
  onPromoteTask,
  onParkActiveTask,
  onSliceTask,
  onInspectTask,
  onRecordFocusMinutes,
  onTriggerGrounding,
  onOpenOmniBar,
  onPullFromBacklog,
}: FocusHUDProps) {
  const [isMiniWidget, setIsMiniWidget] = useState(false);

  const {
    presetMinutes,
    secondsLeft,
    timerRunning,
    formattedTimer,
    handleSelectPreset,
    toggleTimer,
    resetTimer,
    startKickstartTimer,
  } = useFocusTimer({ kickstartTimerTrigger, onRecordFocusMinutes });

  const taskSubtasks = activeTask ? subtasks.filter((s) => s.task_id === activeTask.id) : [];

  if (!activeTask) {
    return (
      <FocusHUDEmptyState
        todoTasks={todoTasks}
        backlogCount={backlogCount}
        onOpenOmniBar={onOpenOmniBar}
        onPromoteTask={onPromoteTask}
        onPullFromBacklog={onPullFromBacklog}
      />
    );
  }

  const priorityMeta = PRIORITY_STYLES[activeTask.priority] || PRIORITY_STYLES.medium;
  const issueKey = formatIssueKey(activeTask.id);

  return (
    <section
      aria-label="Single-Step Focus Sheet"
      className="flex w-full flex-col items-center px-4 pt-3 pb-14 sm:px-8 sm:pt-5"
    >
      <FocusTimerCapsule
        activeSprint={activeSprint}
        todoTasks={todoTasks}
        presetMinutes={presetMinutes}
        secondsLeft={secondsLeft}
        timerRunning={timerRunning}
        isMiniWidget={isMiniWidget}
        formattedTimer={formattedTimer}
        onSelectPreset={handleSelectPreset}
        onToggleTimer={toggleTimer}
        onResetTimer={resetTimer}
        onToggleMiniWidget={() => setIsMiniWidget((v) => !v)}
      />

      <div
        className={`focus-widget-container w-full transition-[max-width] duration-300 ease-out ${
          isMiniWidget ? "max-w-md" : "max-w-3xl"
        }`}
      >
        <article
          className={`focus-card card-elevated rounded-3xl p-6 sm:p-8 ${
            activeTask.kickstart_completed ? "is-kickstart-done" : ""
          }`}
        >
          <div className="focus-card-header border-b border-line-subtle pb-3.5">
            <div className="flex flex-wrap items-center gap-2.5 text-xs">
              <span className="font-mono font-medium text-ink-muted">{issueKey}</span>
              <span className="h-3 w-px bg-line-subtle" aria-hidden="true" />
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${priorityMeta.badgeClass}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${priorityMeta.dotClass}`} aria-hidden="true" />
                <span>{priorityMeta.label}</span>
              </span>
              <span className="inline-flex items-center gap-1 font-mono text-[11px] text-ink-muted">
                <Clock className="h-3 w-3" aria-hidden="true" />
                <span>{activeTask.estimated_minutes}m</span>
              </span>
            </div>

            <div className="flex items-center gap-3">
              {activeTask.why_it_matters && (
                <p className="focus-extended-meta items-center gap-1.5 text-xs text-ink-muted">
                  <span className="max-w-xs truncate">{activeTask.why_it_matters}</span>
                </p>
              )}

              <button
                type="button"
                onClick={() => {
                  sounds.playPop();
                  onInspectTask(activeTask);
                }}
                className="miro-tactile liquid-nav-bubble inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium text-ink-secondary hover:text-ink-primary"
              >
                <Pencil className="h-3 w-3" aria-hidden="true" />
                <span>Inspect</span>
                <kbd className="ml-0.5 font-mono text-[10px] text-ink-muted">E</kbd>
              </button>
            </div>
          </div>

          <h2 className="heading-balance mt-5 text-xl font-semibold leading-snug tracking-tight text-ink-primary sm:text-[1.45rem]">
            {activeTask.title}
          </h2>

          {activeTask.description && (
            <p className="prose-pretty mt-2 text-sm leading-relaxed text-ink-secondary">
              {activeTask.description}
            </p>
          )}

          <FocusKickstartBox
            activeTask={activeTask}
            onToggleKickstart={onToggleKickstart}
            onStartKickstartTimer={startKickstartTimer}
          />

          <FocusCheckpoints
            taskId={activeTask.id}
            taskSubtasks={taskSubtasks}
            onToggleSubtask={onToggleSubtask}
            onDeleteSubtask={onDeleteSubtask}
            onAddSubtask={onAddSubtask}
          />

          <FocusCardActions
            taskId={activeTask.id}
            hasTodoTasks={todoTasks.length > 0}
            onCompleteTask={onCompleteTask}
            onSliceTask={onSliceTask}
            onTriggerGrounding={onTriggerGrounding}
            onParkActiveTask={onParkActiveTask}
          />
        </article>

        <FocusRunwayQueue
          todoTasks={todoTasks}
          onInspectTask={onInspectTask}
          onPromoteTask={onPromoteTask}
        />
      </div>
    </section>
  );
}
