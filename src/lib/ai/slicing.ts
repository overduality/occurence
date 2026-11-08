import type { SlicedTask } from "@/types/outterring";
import { normalizeSlicedTask } from "./verbs";
import { buildHeuristicSprintSteps } from "./heuristics";
import { triageInput } from "./triage";

export async function sliceExistingTask(
  taskTitle: string,
  taskDescription = ""
): Promise<SlicedTask[]> {
  const combined = taskDescription
    ? `Sprint: ${taskTitle} — ${taskDescription}`
    : `Sprint: ${taskTitle}`;
  const result = await triageInput(combined, "sprint");
  if (result.sprint && result.sprint.activeSteps.length > 0) {
    return result.sprint.activeSteps.slice(0, 4);
  }
  return buildHeuristicSprintSteps(taskTitle).activeSteps;
}

export async function extractTasksFromDoc(
  docTitle: string,
  docContent: string
): Promise<{ activeSteps: SlicedTask[]; parkedSteps: SlicedTask[] }> {
  const allBullets = docContent
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => /^([-*•]|\d+\.)\s+/.test(l))
    .map((l) => l.replace(/^([-*•]|\d+\.)\s+(\[[ xX]\]\s*)?/, "").trim())
    .filter((l) => l.length > 4 && !/^`[^`]+`\s*[-—:]/.test(l));

  const verbFirstBullets = allBullets.filter((l) => {
    const first = l.split(/\s+/)[0].toLowerCase().replace(/[^a-z]/g, "");
    return ["open", "write", "run", "create", "draft", "verify", "inspect", "test", "check", "build", "update", "add"].includes(first);
  });

  const candidateLines = verbFirstBullets.length >= 2 ? verbFirstBullets : allBullets;

  if (candidateLines.length >= 2) {
    const allTasks = candidateLines.map((line) => normalizeSlicedTask({ title: line }, line));
    return {
      activeSteps: allTasks.slice(0, 4),
      parkedSteps: allTasks.slice(4, 10),
    };
  }

  const res = await triageInput(`Sprint: ${docTitle}\n${docContent.slice(0, 500)}`, "sprint");
  if (res.sprint) {
    return {
      activeSteps: res.sprint.activeSteps,
      parkedSteps: res.sprint.parkedSteps,
    };
  }

  const built = buildHeuristicSprintSteps(docTitle);
  return {
    activeSteps: built.activeSteps,
    parkedSteps: built.parkedSteps,
  };
}
