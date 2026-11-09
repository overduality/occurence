import { describe, expect, it } from "vitest";
import { buildHeuristicSprintSteps, fallbackTriage } from "@/lib/ai/heuristics";

describe("Offline Heuristic NLP & Micro-Slicing Engine", () => {
  it("decomposes complex intent into active and parked sprint steps", () => {
    const rawGoal = "Build user authentication, email verification, and session management";
    const sprint = buildHeuristicSprintSteps(rawGoal);

    expect(sprint.activeSteps.length).toBeGreaterThan(0);
    expect(sprint.activeSteps.length).toBeLessThanOrEqual(5);

    // Every active step must start with a concrete verb
    for (const step of sprint.activeSteps) {
      expect(step.title).toMatch(/^[A-Z][a-z]+/);
      expect(step.estimatedMinutes).toBeGreaterThanOrEqual(5);
      expect(step.estimatedMinutes).toBeLessThanOrEqual(15);
      expect(step.kickstartAction).toBeTruthy();
    }
  });

  it("classifies documentation notes into doc type", () => {
    const docInput = "Note: Architecture decisions for caching layer\n- Use Redis\n- Set TTL";
    const result = fallbackTriage(docInput, "auto");
    expect(result.type).toBe("doc");
    expect(result.doc).toBeDefined();
    expect(result.doc?.title).toBeTruthy();
  });

  it("classifies single actionable item into task type", () => {
    const taskInput = "Fix navbar z-index on mobile screen";
    const result = fallbackTriage(taskInput, "auto");
    expect(result.type).toBe("task");
    expect(result.task).toBeDefined();
    expect(result.task?.title).toBeTruthy();
  });
});
