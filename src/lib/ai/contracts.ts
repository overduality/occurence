import type { DocCategory, TriageResult } from "@/types/outterring";
import { normalizeSlicedTask } from "./verbs";
import { buildHeuristicSprintSteps, summarizeSprintTitle } from "./heuristics";

export function enforceTriageContracts(result: TriageResult, rawText: string): TriageResult {
  if (result.type === "doc" && result.doc) {
    const validCategories: DocCategory[] = ["architecture", "runbook", "meeting", "ideas", "general"];
    const cat = validCategories.includes(result.doc.category) ? result.doc.category : "general";
    return {
      type: "doc",
      doc: {
        title: result.doc.title?.trim() || "Quick Scratchpad Note",
        content: result.doc.content?.trim() || rawText,
        category: cat,
        tags: Array.isArray(result.doc.tags) ? result.doc.tags.slice(0, 5) : ["capture"],
      },
    };
  }

  if (result.type === "sprint" && result.sprint) {
    const rawActive = Array.isArray(result.sprint.activeSteps) ? result.sprint.activeSteps : [];
    const rawParked = Array.isArray(result.sprint.parkedSteps) ? result.sprint.parkedSteps : [];
    const combined = [...rawActive, ...rawParked].map((step, i) =>
      normalizeSlicedTask(step, `Execute step ${i + 1} for ${rawText}`)
    );

    const ensured = combined.length > 0 ? combined : buildHeuristicSprintSteps(rawText).activeSteps;
    return {
      type: "sprint",
      sprint: {
        title: result.sprint.title?.trim() || summarizeSprintTitle(rawText),
        goal: result.sprint.goal?.trim() || "Move through 3-5 focused micro-actions without backlog noise.",
        activeSteps: ensured.slice(0, 4),
        parkedSteps: ensured.slice(4, 10),
      },
    };
  }

  return {
    type: "task",
    task: normalizeSlicedTask(result.task || {}, rawText),
  };
}
