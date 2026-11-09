import { describe, expect, it } from "vitest";
import { deriveKickstart, ensurePhysicalVerb, normalizeSlicedTask } from "@/lib/ai/verbs";

describe("AI Verbs & Physical Action Normalization", () => {
  it("enforces a physical action verb when title starts with vague intent", () => {
    const input = "think about backend structure";
    const result = ensurePhysicalVerb(input);
    expect(result).toMatch(/^(Draft|Open|Write|Review|Outline)\s+/i);
  });

  it("preserves titles that already start with an accepted physical verb", () => {
    const input = "Run unit tests across auth module";
    const result = ensurePhysicalVerb(input);
    expect(result).toBe("Run unit tests across auth module");
  });

  it("derives a 2-minute concrete kickstart action from a task title", () => {
    const title = "Implement database connection pooling";
    const kickstart = deriveKickstart(title);
    expect(kickstart).toBeTruthy();
    expect(typeof kickstart).toBe("string");
    expect(kickstart.length).toBeGreaterThan(5);
  });

  it("normalizes sliced tasks with default estimates and kickstarts", () => {
    const raw = {
      title: "Write API documentation",
      description: "Document endpoints",
    };
    const normalized = normalizeSlicedTask(raw, "fallback");
    expect(normalized.title).toBe("Write API documentation");
    expect(normalized.estimatedMinutes).toBeGreaterThanOrEqual(5);
    expect(normalized.estimatedMinutes).toBeLessThanOrEqual(15);
    expect(normalized.kickstartAction).toBeTruthy();
    expect(Array.isArray(normalized.subtasks)).toBe(true);
  });
});
