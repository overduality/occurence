"use client";

import React, { useRef, useState } from "react";
import {
  Sparkles,
  Target,
  Kanban,
  FileText,
  Command,
  X,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { sounds } from "@/lib/sound";
import { useModalDialog } from "@/lib/web-platform";
import { GuideSectionTour } from "./onboarding/GuideSectionTour";
import { GuideSectionSprints } from "./onboarding/GuideSectionSprints";
import { GuideSectionFocus } from "./onboarding/GuideSectionFocus";
import { GuideSectionDocs } from "./onboarding/GuideSectionDocs";
import { GuideSectionShortcuts } from "./onboarding/GuideSectionShortcuts";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: "focus" | "board" | "docs") => void;
}

type GuideSection = "tour" | "focus" | "sprints" | "docs" | "shortcuts";

const SECTIONS: Array<{
  id: GuideSection;
  label: string;
  Icon: typeof Sparkles;
}> = [
  { id: "tour", label: "Overview", Icon: Sparkles },
  { id: "sprints", label: "Sprints", Icon: Kanban },
  { id: "focus", label: "Focus", Icon: Target },
  { id: "docs", label: "Docs", Icon: FileText },
  { id: "shortcuts", label: "Keys", Icon: Command },
];

export function OnboardingModal({
  isOpen,
  onClose,
  onNavigateTab,
}: OnboardingModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const primaryBtnRef = useRef<HTMLButtonElement>(null);
  const [activeSection, setActiveSection] = useState<GuideSection>("tour");

  useModalDialog(dialogRef, isOpen, onClose, primaryBtnRef);

  const changeSection = (direction: "prev" | "next") => {
    sounds.playPop();
    const order: GuideSection[] = ["tour", "sprints", "focus", "docs", "shortcuts"];
    const idx = order.indexOf(activeSection);
    if (direction === "next") {
      if (idx < order.length - 1) setActiveSection(order[idx + 1]);
      else onClose();
    } else if (idx > 0) {
      setActiveSection(order[idx - 1]);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="onboarding-guide-title"
      {...({ closedby: "any" } as Record<string, string>)}
      className="surface-overlay m-auto w-[calc(100%-1.5rem)] max-w-2xl rounded-3xl p-0 text-ink-primary shadow-2xl"
    >
      <div className="flex max-h-[85vh] flex-col">
        <div className="border-b border-line-subtle px-6 pt-5 pb-3.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="apple-btn-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
              </div>
              <div>
                <h2 id="onboarding-guide-title" className="text-sm font-semibold tracking-tight text-ink-primary">
                  Guide
                </h2>
                <p className="text-xs text-ink-secondary">
                  Focus system overview.
                </p>
              </div>
            </div>

            <button
              type="button"
              aria-label="Close guide"
              onClick={onClose}
              className="miro-tactile rounded-full p-1.5 text-ink-muted hover:bg-hover hover:text-ink-primary"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <div
            role="tablist"
            aria-label="Guide sections"
            className="mt-4 flex flex-wrap items-center gap-1 rounded-2xl bg-well p-1 text-xs"
          >
            {SECTIONS.map(({ id, label, Icon }) => {
              const active = activeSection === id;
              return (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => {
                    sounds.playPop();
                    setActiveSection(id);
                  }}
                  className={`miro-tactile flex flex-1 items-center justify-center gap-1.5 rounded-xl px-2.5 py-1.5 font-medium transition-colors sm:flex-initial ${
                    active
                      ? "liquid-nav-bubble text-ink-primary"
                      : "text-ink-secondary hover:text-ink-primary"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5 text-sm">
          {activeSection === "tour" && <GuideSectionTour />}
          {activeSection === "sprints" && <GuideSectionSprints />}
          {activeSection === "focus" && <GuideSectionFocus />}
          {activeSection === "docs" && <GuideSectionDocs />}
          {activeSection === "shortcuts" && <GuideSectionShortcuts />}
        </div>

        <div className="flex items-center justify-between border-t border-line-subtle px-6 py-3.5">
          <div className="flex items-center gap-2">
            {activeSection !== "tour" && (
              <button
                type="button"
                onClick={() => changeSection("prev")}
                className="miro-tactile liquid-nav-bubble inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium text-ink-secondary hover:text-ink-primary"
              >
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Back</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                sounds.playPop();
                onClose();
                onNavigateTab("board");
              }}
              className="text-xs text-ink-muted hover:text-ink-primary underline underline-offset-4"
            >
              Open Sprint Board
            </button>
          </div>

          <div className="flex items-center gap-2">
            {activeSection !== "shortcuts" ? (
              <button
                type="button"
                ref={primaryBtnRef}
                onClick={() => changeSection("next")}
                className="miro-tactile apple-btn-primary inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium"
              >
                <span>Continue</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            ) : (
              <button
                type="button"
                ref={primaryBtnRef}
                onClick={() => {
                  sounds.playComplete();
                  onClose();
                }}
                className="miro-tactile apple-btn-primary inline-flex items-center gap-1.5 rounded-full px-5 py-1.5 text-xs font-medium"
              >
                <span>Done</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </dialog>
  );
}
