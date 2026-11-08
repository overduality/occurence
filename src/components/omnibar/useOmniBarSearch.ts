import { useMemo, useState } from "react";
import { formatIssueKey } from "@/lib/web-platform";
import type { Doc, Task } from "@/types/outterring";
import type { OmniBarSearchHit } from "./OmniBarSearchResults";

export function useOmniBarSearch(text: string, tasks: Task[], docs: Doc[]) {
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const matchingResults: OmniBarSearchHit[] = useMemo(() => {
    const q = text.trim().toLowerCase();
    if (q.length < 2) return [];

    const taskHits: OmniBarSearchHit[] = tasks
      .filter(
        (t) =>
          t.status !== "done" &&
          (t.title.toLowerCase().includes(q) ||
            t.description.toLowerCase().includes(q) ||
            formatIssueKey(t.id).toLowerCase().includes(q))
      )
      .slice(0, 3)
      .map((t) => ({
        kind: "task",
        id: t.id,
        code: formatIssueKey(t.id),
        title: t.title,
        subtitle:
          t.status === "in_progress"
            ? "Focus · In Progress"
            : t.status === "todo"
              ? "Board · To Do"
              : "Board · Backlog",
      }));

    const docHits: OmniBarSearchHit[] = docs
      .filter(
        (d) => d.title.toLowerCase().includes(q) || d.content.toLowerCase().includes(q)
      )
      .slice(0, 3)
      .map((d) => ({
        kind: "doc",
        id: d.id,
        code: "DOC",
        title: d.title,
        subtitle: `Docs · ${d.category}`,
      }));

    return [...taskHits, ...docHits];
  }, [text, tasks, docs]);

  const handleArrowKeys = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (matchingResults.length === 0) return false;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < matchingResults.length - 1 ? prev + 1 : -1
      );
      return true;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev > -1 ? prev - 1 : matchingResults.length - 1
      );
      return true;
    }
    return false;
  };

  return {
    matchingResults,
    selectedIndex,
    setSelectedIndex,
    handleArrowKeys,
  };
}
