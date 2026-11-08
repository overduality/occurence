"use client";

import React, { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import { sounds } from "@/lib/sound";
import { useAccessibleFormValidation, useModalDialog } from "@/lib/web-platform";
import type {
  KanbanColumn,
  Sprint,
  Subtask,
  Task,
  TaskPriority,
  TaskStatus,
} from "@/types/outterring";
import { TaskDetailHeader } from "./task-detail/TaskDetailHeader";
import { TaskMetadataGrid } from "./task-detail/TaskMetadataGrid";
import { TaskDetailFields } from "./task-detail/TaskDetailFields";
import { TaskSubtaskList } from "./task-detail/TaskSubtaskList";

interface TaskDetailModalProps {
  task: Task | null;
  subtasks: Subtask[];
  sprints: Sprint[];
  columns?: KanbanColumn[];
  onClose: () => void;
  onSaveTask: (
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
  onAddSubtask: (taskId: string, title: string) => void;
  onToggleSubtask: (subtaskId: string, completed: boolean) => void;
  onRenameSubtask: (subtaskId: string, title: string) => void;
  onDeleteSubtask: (subtaskId: string) => void;
  onConvertTaskToDoc: (task: Task, taskSubtasks: Subtask[]) => void;
}

export function TaskDetailModal({
  task,
  subtasks,
  sprints,
  columns,
  onClose,
  onSaveTask,
  onDeleteTask,
  onAddSubtask,
  onToggleSubtask,
  onRenameSubtask,
  onDeleteSubtask,
  onConvertTaskToDoc,
}: TaskDetailModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [kickstart, setKickstart] = useState("");
  const [whyItMatters, setWhyItMatters] = useState("");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [minutes, setMinutes] = useState<number>(10);
  const [sprintId, setSprintId] = useState<string>("");

  const isOpen = Boolean(task);

  useModalDialog(dialogRef, isOpen, onClose, titleRef);
  useAccessibleFormValidation(formRef);

  useEffect(() => {
    if (!task) return;
    setTitle(task.title);
    setDescription(task.description || "");
    setKickstart(task.kickstart_action || "");
    setWhyItMatters(task.why_it_matters || "");
    setStatus(task.status);
    setPriority(task.priority);
    setMinutes(task.estimated_minutes || 10);
    setSprintId(task.sprint_id || "");
  }, [task]);

  const taskSubtasks = task ? subtasks.filter((s) => s.task_id === task.id) : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!task || !formRef.current?.checkValidity()) return;

    sounds.playPop();
    onSaveTask(task.id, {
      title: title.trim(),
      description: description.trim(),
      kickstart_action: kickstart.trim(),
      why_it_matters: whyItMatters.trim(),
      status,
      priority,
      estimated_minutes: minutes,
      sprint_id: sprintId || null,
    });
    onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="issue-inspector-title"
      {...({ closedby: "any" } as Record<string, string>)}
      className="surface-overlay m-auto w-[calc(100%-1.5rem)] max-w-2xl rounded-3xl p-0 text-ink-primary"
    >
      {task && (
        <form ref={formRef} onSubmit={handleSubmit} className="flex max-h-[88vh] flex-col">
          <TaskDetailHeader
            task={task}
            status={status}
            columns={columns}
            taskSubtasks={taskSubtasks}
            onStatusChange={setStatus}
            onConvertTaskToDoc={onConvertTaskToDoc}
            onDeleteTask={onDeleteTask}
            onClose={onClose}
          />

          <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
            <TaskDetailFields
              titleRef={titleRef}
              title={title}
              onTitleChange={setTitle}
              kickstart={kickstart}
              onKickstartChange={setKickstart}
              description={description}
              onDescriptionChange={setDescription}
              whyItMatters={whyItMatters}
              onWhyItMattersChange={setWhyItMatters}
            />

            <TaskMetadataGrid
              priority={priority}
              minutes={minutes}
              sprintId={sprintId}
              sprints={sprints}
              onPriorityChange={setPriority}
              onMinutesChange={setMinutes}
              onSprintIdChange={setSprintId}
            />

            <TaskSubtaskList
              taskId={task.id}
              subtasks={taskSubtasks}
              onAddSubtask={onAddSubtask}
              onToggleSubtask={onToggleSubtask}
              onRenameSubtask={onRenameSubtask}
              onDeleteSubtask={onDeleteSubtask}
            />
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-line-subtle px-5 py-3.5">
            <button
              type="button"
              onClick={onClose}
              className="miro-tactile liquid-nav-bubble rounded-full px-4 py-1.5 text-xs font-medium text-ink-primary hover:bg-hover"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="miro-tactile apple-btn-primary inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium"
            >
              <Check className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Save</span>
            </button>
          </div>
        </form>
      )}
    </dialog>
  );
}
