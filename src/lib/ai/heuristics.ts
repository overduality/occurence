import type { DocCategory, SlicedSprint, TriageMode, TriageResult } from "@/types/outterring";
import { deriveKickstart, ensurePhysicalVerb, inferPriority, normalizeSlicedTask } from "./verbs";

export function detectHeuristicMode(rawText: string): "task" | "sprint" | "doc" {
  const trimmed = rawText.trim();
  const lower = trimmed.toLowerCase();

  if (
    /^(note:|doc:|catat:|idea:|meeting:|adr:|runbook:|# )/i.test(trimmed) ||
    lower.includes("meeting notes") ||
    trimmed.includes("\n\n")
  ) {
    return "doc";
  }

  const commaOrSemiParts = trimmed
    .split(/(?:,|;|\band then\b|\bthen\b|\n)+/i)
    .map((s) => s.trim())
    .filter((s) => s.length > 3);

  if (
    /^(sprint:|project:|epic:|plan:|ship\s)/i.test(trimmed) ||
    commaOrSemiParts.length >= 3 ||
    (trimmed.length > 85 && /\b(and|with|plus)\b/i.test(trimmed))
  ) {
    return "sprint";
  }

  return "task";
}

export function summarizeSprintTitle(rawText: string): string {
  const clean = rawText.replace(/^(sprint:|project:|epic:|plan:)\s*/i, "").trim();
  const firstLine = clean.split(/[\n.;]/)[0].trim();
  if (firstLine.length <= 54) return firstLine || "Focused Micro-Sprint";
  return firstLine.slice(0, 51) + "...";
}

export function buildHeuristicSprintSteps(rawText: string): SlicedSprint {
  const clean = rawText.replace(/^(sprint:|project:|epic:|plan:)\s*/i, "").trim();
  const explicitSegments = clean
    .split(/(?:,|;|\band then\b|\bthen\b|\n)+/i)
    .map((s) => s.replace(/^[-*•\d.)\s]+/, "").trim())
    .filter((s) => s.length > 3);

  let stepSeeds: Array<{ title: string; minutes: number; kickstart?: string }>;

  if (explicitSegments.length >= 2) {
    stepSeeds = explicitSegments.map((seg, idx) => ({
      title: ensurePhysicalVerb(seg),
      minutes: idx === 0 ? 10 : 15,
      kickstart: idx === 0 ? deriveKickstart(seg) : undefined,
    }));
  } else {
    const subject = clean || "feature implementation";
    stepSeeds = [
      {
        title: `Open target files and outline 3 bullet requirements for ${subject}`,
        minutes: 5,
        kickstart: `Open Scratchpad or target file and write 3 bullet lines defining "${subject}".`,
      },
      {
        title: `Write the core implementation slice for ${subject}`,
        minutes: 15,
        kickstart: `Open the primary module and implement the first function signature for "${subject}".`,
      },
      {
        title: `Run command to verify edge cases and state persistence for ${subject}`,
        minutes: 10,
        kickstart: `Open terminal and run build or health verification for "${subject}".`,
      },
      {
        title: `Review diff and ship clean commit for ${subject}`,
        minutes: 5,
        kickstart: "Run git status and inspect modified files line by line.",
      },
    ];
  }

  const normalized = stepSeeds.map((seed) =>
    normalizeSlicedTask(
      {
        title: seed.title,
        estimatedMinutes: seed.minutes,
        kickstartAction: seed.kickstart || deriveKickstart(seed.title),
      },
      seed.title
    )
  );

  return {
    title: summarizeSprintTitle(rawText),
    goal: `Complete ${Math.min(4, normalized.length)} focused 5-15 minute micro-actions in sequence.`,
    activeSteps: normalized.slice(0, 4),
    parkedSteps: normalized.slice(4, 10),
  };
}

export function fallbackTriage(rawText: string, forcedMode: TriageMode): TriageResult {
  const mode = forcedMode === "auto" ? detectHeuristicMode(rawText) : forcedMode;
  const lower = rawText.toLowerCase();

  if (mode === "doc") {
    const cleanContent = rawText
      .replace(/^(catat:|note:|doc:|idea:|meeting:|adr:|runbook:)\s*/i, "")
      .trim();
    const firstLine = (cleanContent.split("\n")[0] || "Quick Note").replace(/^#+\s*/, "").trim();
    const title = firstLine.length > 60 ? firstLine.slice(0, 57) + "..." : firstLine;

    let category: DocCategory = "general";
    if (lower.includes("meeting") || lower.includes("sync")) category = "meeting";
    else if (lower.includes("arch") || lower.includes("schema") || lower.includes("adr")) category = "architecture";
    else if (lower.includes("runbook") || lower.includes("deploy") || lower.includes("docker")) category = "runbook";
    else if (lower.includes("idea") || lower.includes("brainstorm")) category = "ideas";

    const formattedBody = cleanContent.startsWith("#")
      ? cleanContent
      : `# ${title}\n\n${cleanContent}`;

    return {
      type: "doc",
      doc: {
        title,
        content: formattedBody,
        category,
        tags: [category, "omni-capture"],
      },
    };
  }

  if (mode === "sprint") {
    return {
      type: "sprint",
      sprint: buildHeuristicSprintSteps(rawText),
    };
  }

  const cleanTaskText = rawText.replace(/^(task:|todo:)\s*/i, "").trim();
  return {
    type: "task",
    task: normalizeSlicedTask(
      {
        title: ensurePhysicalVerb(cleanTaskText),
        description: "Captured via Omni-Bar and sliced into a single immediate action.",
        estimatedMinutes: 10,
        priority: inferPriority(cleanTaskText),
        kickstartAction: deriveKickstart(cleanTaskText),
      },
      cleanTaskText
    ),
  };
}
