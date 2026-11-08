"use client";

import { useEffect } from "react";
import { sounds } from "@/lib/sound";
import type { Task, WorkspaceTab } from "@/types/outterring";

interface GlobalShortcutsProps {
  currentTab: WorkspaceTab;
  navigateToTab: (tab: WorkspaceTab) => void;
  activeTask: Task | null;
  isOmniOpen: boolean;
  setIsOmniOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isGroundingOpen: boolean;
  setIsGroundingOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsOnboardingOpen: React.Dispatch<React.SetStateAction<boolean>>;
  inspectedTaskId: string | null;
  setInspectedTaskId: React.Dispatch<React.SetStateAction<string | null>>;
  handleCompleteTask: (taskId: string) => void;
}

export function useGlobalShortcuts({
  currentTab,
  navigateToTab,
  activeTask,
  isOmniOpen,
  setIsOmniOpen,
  isGroundingOpen,
  setIsGroundingOpen,
  setIsOnboardingOpen,
  inspectedTaskId,
  setInspectedTaskId,
  handleCompleteTask,
}: GlobalShortcutsProps) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        sounds.playPop();
        setIsOmniOpen((open) => !open);
        return;
      }

      if (isOmniOpen || isGroundingOpen || inspectedTaskId) return;
      if (document.querySelector("dialog[open]")) return;

      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      const isEditable =
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        target?.isContentEditable;

      if (isEditable) return;

      if (e.key === "1" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        if (currentTab !== "focus") sounds.playPop();
        navigateToTab("focus");
      } else if (e.key === "2" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        if (currentTab !== "board") sounds.playPop();
        navigateToTab("board");
      } else if (e.key === "3" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        if (currentTab !== "docs") sounds.playPop();
        navigateToTab("docs");
      } else if (
        e.key.toLowerCase() === "g" &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey
      ) {
        e.preventDefault();
        setIsGroundingOpen(true);
      } else if (
        e.key.toLowerCase() === "e" &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey
      ) {
        if (activeTask && currentTab === "focus") {
          e.preventDefault();
          sounds.playPop();
          setInspectedTaskId(activeTask.id);
        }
      } else if (
        (e.key === "?" || (e.key === "/" && e.shiftKey)) &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey
      ) {
        e.preventDefault();
        sounds.playPop();
        setIsOnboardingOpen(true);
      } else if (e.code === "Space" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        if (tag === "BUTTON" || tag === "SUMMARY" || tag === "A") return;
        if (activeTask && currentTab === "focus") {
          e.preventDefault();
          handleCompleteTask(activeTask.id);
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    activeTask,
    currentTab,
    handleCompleteTask,
    inspectedTaskId,
    isGroundingOpen,
    isOmniOpen,
    navigateToTab,
    setIsGroundingOpen,
    setIsOmniOpen,
    setIsOnboardingOpen,
    setInspectedTaskId,
  ]);
}
