"use client";

import React, { useRef, useState } from "react";
import {
  Compass,
  Play,
  Scissors,
  ArrowRightLeft,
  Loader2,
  X,
  Zap,
} from "lucide-react";
import { sounds } from "@/lib/sound";
import { useModalDialog } from "@/lib/web-platform";
import type { Task } from "@/types/outterring";
import { useGroundingAdvice } from "./grounding/useGroundingAdvice";

interface GroundingModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTask: Task | null;
  hasAlternateTodo: boolean;
  onEngageTwoMinuteKickstart: (microAction: string) => void;
  onSliceActiveTask: () => Promise<void>;
  onSwitchToLighterTask: () => void;
  onOpenOmniBar: () => void;
}

export function GroundingModal({
  isOpen,
  onClose,
  activeTask,
  hasAlternateTodo,
  onEngageTwoMinuteKickstart,
  onSliceActiveTask,
  onSwitchToLighterTask,
  onOpenOmniBar,
}: GroundingModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const primaryBtnRef = useRef<HTMLButtonElement>(null);
  const [isSlicing, setIsSlicing] = useState(false);

  useModalDialog(dialogRef, isOpen, onClose, primaryBtnRef);
  const { advice, isLoading } = useGroundingAdvice(isOpen, activeTask);

  const handleSlice = async () => {
    if (!activeTask || isSlicing) return;
    setIsSlicing(true);
    sounds.playPop();
    try {
      await onSliceActiveTask();
      onClose();
    } finally {
      setIsSlicing(false);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="grounding-title"
      {...({ closedby: "any" } as Record<string, string>)}
      className="surface-overlay m-auto w-[calc(100%-1.5rem)] max-w-lg rounded-3xl p-0 text-ink-primary"
    >
      <div className="p-5 sm:p-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line-subtle pb-3.5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-accent-soft text-accent">
              <Compass className="h-4 w-4" aria-hidden="true" />
            </span>
            <div>
              <h2
                id="grounding-title"
                className="text-sm font-semibold text-ink-primary"
              >
                Ground
              </h2>
            </div>
          </div>

          <button
            type="button"
            aria-label="Close grounding dialog"
            onClick={onClose}
            className="miro-tactile rounded-full p-1.5 text-ink-muted hover:bg-hover hover:text-ink-primary"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* 1-Sentence Re-orientation */}
        <div className="mt-4 rounded-2xl border border-line-subtle bg-well/70 p-4">
          <div className="flex items-center justify-between text-xs font-medium text-ink-muted">
            <span>Context</span>
            {isLoading && (
              <span className="inline-flex items-center gap-1 text-accent">
                <Loader2 className="spinner-smooth h-3 w-3" aria-hidden="true" />
                <span>Refining</span>
              </span>
            )}
          </div>
          <p className="prose-pretty mt-1 text-sm leading-relaxed text-ink-primary">
            {advice?.reorientation}
          </p>
        </div>

        {/* Clean Immediate 2-Minute Micro-Action */}
        <div className="mt-3 rounded-2xl border border-line-subtle bg-card/80 p-4">
          <div className="flex items-center gap-1.5 text-xs font-medium text-ink-secondary">
            <Zap className="h-3.5 w-3.5 text-status-warn-ink" aria-hidden="true" />
            <span>Next Action</span>
          </div>
          <p className="prose-pretty mt-1 text-sm font-medium leading-relaxed text-ink-primary">
            {advice?.microAction}
          </p>
        </div>

        {/* Action Controls */}
        <div className="mt-5 flex flex-col gap-2">
          {activeTask ? (
            <>
              <button
                ref={primaryBtnRef}
                type="button"
                onClick={() => {
                  sounds.playPop();
                  onEngageTwoMinuteKickstart(
                    advice?.microAction || activeTask.kickstart_action
                  );
                  onClose();
                }}
                className="miro-tactile apple-btn-primary flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-xs font-medium"
              >
                <Play className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                <span>Start 2m Timer</span>
              </button>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  disabled={isSlicing}
                  onClick={handleSlice}
                  className="miro-tactile liquid-nav-bubble flex items-center justify-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium text-ink-primary hover:bg-hover disabled:opacity-50"
                >
                  {isSlicing ? (
                    <Loader2
                      className="spinner-smooth h-3.5 w-3.5 text-accent"
                      aria-hidden="true"
                    />
                  ) : (
                    <Scissors className="h-3.5 w-3.5 text-ink-secondary" aria-hidden="true" />
                  )}
                  <span>Slice</span>
                </button>

                {hasAlternateTodo && (
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playPop();
                      onSwitchToLighterTask();
                      onClose();
                    }}
                    className="miro-tactile liquid-nav-bubble flex items-center justify-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium text-ink-primary hover:bg-hover"
                  >
                    <ArrowRightLeft
                      className="h-3.5 w-3.5 text-ink-secondary"
                      aria-hidden="true"
                    />
                    <span>Swap Next</span>
                  </button>
                )}
              </div>
            </>
          ) : (
            <button
              ref={primaryBtnRef}
              type="button"
              onClick={() => {
                sounds.playPop();
                onClose();
                onOpenOmniBar();
              }}
              className="miro-tactile apple-btn-primary flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-xs font-medium"
            >
              <Play className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Capture (⌘K)</span>
            </button>
          )}
        </div>
      </div>
    </dialog>
  );
}
