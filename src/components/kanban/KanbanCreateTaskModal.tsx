"use client";

import React, { useRef, useState } from "react";
import { X } from "lucide-react";
import { sounds } from "@/lib/sound";
import { useAccessibleFormValidation, useModalDialog } from "@/lib/web-platform";
import type { KanbanColumn, TaskPriority, TaskStatus } from "@/types/outterring";
import { KanbanCreateTaskFields } from "./KanbanCreateTaskFields";

interface KanbanCreateTaskModalProps {
  isOpen: boolean;
  targetStatus: TaskStatus;
  boardColumns: KanbanColumn[];
  currentSprintId?: string | null;
  onClose: () => void;
  onCreateTask: (payload: {
    title: string;
    description: string;
    priority: TaskPriority;
    estimated_minutes: number;
    kickstart_action: string;
    status: TaskStatus;
    sprint_id?: string | null;
  }) => void;
}

export function KanbanCreateTaskModal({
  isOpen,
  targetStatus: initialStatus,
  boardColumns,
  currentSprintId,
  onClose,
  onCreateTask,
}: KanbanCreateTaskModalProps) {
  const composerDialogRef = useRef<HTMLDialogElement>(null);
  const composerFormRef = useRef<HTMLFormElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [kickstart, setKickstart] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [minutes, setMinutes] = useState(10);
  const [targetStatus, setTargetStatus] = useState<TaskStatus>(initialStatus);

  useModalDialog(composerDialogRef, isOpen, onClose, titleInputRef);
  useAccessibleFormValidation(composerFormRef);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!composerFormRef.current?.checkValidity()) return;

    sounds.playComplete();
    onCreateTask({
      title: title.trim(),
      description: description.trim(),
      priority,
      estimated_minutes: minutes,
      kickstart_action: kickstart.trim(),
      status: targetStatus,
      sprint_id: currentSprintId,
    });

    setTitle("");
    setKickstart("");
    setDescription("");
    setPriority("medium");
    setMinutes(10);
    composerFormRef.current?.reset();
    onClose();
  };

  return (
    <dialog
      ref={composerDialogRef}
      aria-labelledby="composer-dialog-title"
      {...({ closedby: "any" } as Record<string, string>)}
      className="surface-overlay m-auto w-[calc(100%-1.5rem)] max-w-lg rounded-3xl p-0 text-ink-primary"
    >
      <form ref={composerFormRef} onSubmit={handleSubmit} className="p-5">
        <div className="flex items-center justify-between border-b border-line-subtle pb-3">
          <h2 id="composer-dialog-title" className="text-sm font-semibold text-ink-primary">
            New Step
          </h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="miro-tactile rounded-md p-1 text-ink-muted hover:bg-hover hover:text-ink-primary"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <KanbanCreateTaskFields
          title={title}
          kickstart={kickstart}
          description={description}
          priority={priority}
          minutes={minutes}
          targetStatus={targetStatus}
          boardColumns={boardColumns}
          titleInputRef={titleInputRef}
          onTitleChange={setTitle}
          onKickstartChange={setKickstart}
          onDescriptionChange={setDescription}
          onPriorityChange={setPriority}
          onMinutesChange={setMinutes}
          onTargetStatusChange={setTargetStatus}
        />

        <div className="mt-5 flex items-center justify-end gap-2 border-t border-line-subtle pt-3.5">
          <button
            type="button"
            onClick={onClose}
            className="miro-tactile liquid-nav-bubble rounded-full px-4 py-1.5 text-xs font-medium text-ink-primary hover:bg-hover"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="miro-tactile apple-btn-primary rounded-full px-4 py-1.5 text-xs font-medium"
          >
            Create
          </button>
        </div>
      </form>
    </dialog>
  );
}
