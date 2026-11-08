"use client";

import { useEffect, useState } from "react";
import { sounds } from "@/lib/sound";
import type { GroundingAdvice, Task } from "@/types/outterring";

export function useGroundingAdvice(isOpen: boolean, activeTask: Task | null) {
  const [advice, setAdvice] = useState<GroundingAdvice | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    sounds.playGrounding();

    // Instant optimistic local anchor (<16ms visual response), then refine via /api/ai/ground
    const immediateFallback: GroundingAdvice = activeTask
      ? {
          reorientation: `Current: "${activeTask.title}"`,
          microAction:
            activeTask.kickstart_action ||
            "Take the first immediate action.",
          suggestedAction: "continue",
        }
      : {
          reorientation: "Focus canvas is clear.",
          microAction:
            "Capture a step to build momentum.",
          suggestedAction: "switch_task",
        };

    setAdvice(immediateFallback);

    let cancelled = false;
    setIsLoading(true);

    fetch("/api/ai/ground", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        taskTitle: activeTask?.title || "",
        kickstartAction: activeTask?.kickstart_action || "",
      }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: GroundingAdvice | null) => {
        if (!cancelled && data?.reorientation && data?.microAction) {
          setAdvice(data);
        }
      })
      .catch(() => {
        // Optimistic advice already rendered
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, activeTask]);

  return { advice, isLoading };
}
