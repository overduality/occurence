import type { SlicedTask, TaskPriority } from "@/types/outterring";

export const PHYSICAL_VERBS = [
  "open",
  "write",
  "run",
  "create",
  "draft",
  "verify",
  "inspect",
  "sketch",
  "test",
  "check",
  "build",
  "update",
  "add",
  "remove",
  "refactor",
  "deploy",
  "configure",
  "send",
  "review",
  "outline",
  "type",
  "read",
  "trace",
  "commit",
  "push",
  "fix",
  "install",
  "measure",
  "connect",
  "extract",
];

/**
 * Guarantees every step begins with an explicit physical verb to eliminate executive ambiguity.
 */
export function ensurePhysicalVerb(rawTitle: string): string {
  const cleaned = rawTitle.replace(/^[-*•\d.)\s]+/, "").trim();
  if (!cleaned) return "Open workspace and write 1 line of progress";

  const firstWord = cleaned.split(/\s+/)[0].toLowerCase().replace(/[^a-z]/g, "");
  if (PHYSICAL_VERBS.includes(firstWord)) {
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }

  const lower = cleaned.toLowerCase();
  if (lower.includes("bug") || lower.includes("error") || lower.includes("issue")) {
    return `Inspect and fix ${cleaned}`;
  }
  if (lower.includes("doc") || lower.includes("readme") || lower.includes("spec") || lower.includes("summary")) {
    return `Write 3 bullet points for ${cleaned}`;
  }
  if (lower.includes("test") || lower.includes("build") || lower.includes("docker") || lower.includes("script")) {
    return `Run command to verify ${cleaned}`;
  }
  if (lower.includes("email") || lower.includes("message") || lower.includes("reply") || lower.includes("update")) {
    return `Draft 2-sentence message for ${cleaned}`;
  }
  return `Open workspace and execute: ${cleaned}`;
}

export function clampMicroMinutes(mins?: number): number {
  if (!mins || Number.isNaN(mins)) return 10;
  return Math.min(15, Math.max(5, Math.round(mins)));
}

export function deriveKickstart(rawTitle: string): string {
  const lower = rawTitle.toLowerCase();
  const cleanSubject = rawTitle.replace(/^(sprint:|task:|todo:)\s*/i, "").trim();

  if (lower.includes("email") || lower.includes("slack") || lower.includes("reply") || lower.includes("message")) {
    return `Open compose window and write 1 plain-text opening sentence for "${cleanSubject}".`;
  }
  if (lower.includes("docker") || lower.includes("deploy") || lower.includes("command") || lower.includes("cli")) {
    return `Open terminal in the project root and run a dry-run status check for "${cleanSubject}".`;
  }
  if (lower.includes("bug") || lower.includes("fix") || lower.includes("error") || lower.includes("auth") || lower.includes(".ts")) {
    return `Open the target source file and place one log/assertion at the entry point of "${cleanSubject}".`;
  }
  if (lower.includes("doc") || lower.includes("write") || lower.includes("draft") || lower.includes("slide") || lower.includes("spec")) {
    return `Open a blank editor block and write 3 rough bullet points for "${cleanSubject}".`;
  }
  if (lower.includes("design") || lower.includes("ui") || lower.includes("css") || lower.includes("layout")) {
    return `Open the component file and sketch the outer container markup for "${cleanSubject}".`;
  }
  return `Open your primary file or tab and spend 2 minutes outlining the first concrete line for "${cleanSubject}".`;
}

export function inferPriority(text: string): TaskPriority {
  const lower = text.toLowerCase();
  if (lower.includes("urgent") || lower.includes("critical") || lower.includes("prod") || lower.includes("crash") || lower.includes("500")) {
    return "urgent";
  }
  if (lower.includes("high") || lower.includes("bug") || lower.includes("important") || lower.includes("penting") || lower.includes("blocker")) {
    return "high";
  }
  if (lower.includes("later") || lower.includes("someday") || lower.includes("nice to have") || lower.includes("optional")) {
    return "low";
  }
  return "medium";
}

export function normalizeSlicedTask(partial: Partial<SlicedTask>, fallbackTitle: string): SlicedTask {
  const title = ensurePhysicalVerb(partial.title || fallbackTitle);
  const kickstartRaw = partial.kickstartAction?.trim() || deriveKickstart(title);
  const kickstartAction = ensurePhysicalVerb(kickstartRaw);
  const validPriorities: TaskPriority[] = ["low", "medium", "high", "urgent"];
  const priority: TaskPriority =
    partial.priority && validPriorities.includes(partial.priority)
      ? partial.priority
      : inferPriority(title);

  const subtasks = Array.isArray(partial.subtasks) && partial.subtasks.length > 0
    ? partial.subtasks.slice(0, 4).map((s) => ensurePhysicalVerb(String(s)))
    : [
        kickstartAction,
        `Write or execute the core change for ${title.slice(0, 48)}`,
        "Verify output and mark complete",
      ];

  return {
    title,
    description: partial.description?.trim() || "Decomposed into a 5-15 minute single-focus micro-action.",
    estimatedMinutes: clampMicroMinutes(partial.estimatedMinutes),
    priority,
    kickstartAction,
    whyItMatters:
      partial.whyItMatters?.trim() ||
      "Completing one small physical step breaks inertia and compounds momentum.",
    subtasks,
  };
}
