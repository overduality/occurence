import type { DocCategory } from "@/types/outterring";

export const CATEGORIES: Array<{ id: "all" | DocCategory; label: string }> = [
  { id: "all", label: "All" },
  { id: "architecture", label: "Architecture" },
  { id: "runbook", label: "Runbooks" },
  { id: "meeting", label: "Meetings" },
  { id: "ideas", label: "Ideas" },
  { id: "general", label: "General" },
];

export const DOC_TEMPLATES: Array<{
  id: string;
  label: string;
  title: string;
  category: DocCategory;
  tags: string[];
  content: string;
}> = [
  {
    id: "adr",
    label: "ADR",
    title: "ADR: Architectural Decision Record",
    category: "architecture",
    tags: ["adr", "architecture"],
    content: `# Context & Problem\n\nDescribe the technical constraint or decision required.\n\n## Options Considered\n\n| Option | Pros | Trade-offs |\n| --- | --- | --- |\n| Option A | Simple local persistence | Single-node |\n| Option B | Distributed | Higher ops overhead |\n\n## Decision\n\n> Chosen Option A because it eliminates operational friction.\n\n## Action Checklist\n- [ ] Open target module and scaffold interface\n- [ ] Write integration test covering failure path\n- [ ] Update deployment runbook`,
  },
  {
    id: "runbook",
    label: "Runbook",
    title: "Runbook: Production Verification & Recovery",
    category: "runbook",
    tags: ["runbook", "ops"],
    content: `# Service Health Check\n\n\`\`\`bash\ncurl -s http://localhost:5555/api/health\n\`\`\`\n\n## Verification Steps\n- [ ] Run health endpoint and confirm WAL journal mode\n- [ ] Verify ./data volume free disk space\n- [ ] Inspect container logs for unhandled errors`,
  },
  {
    id: "meeting",
    label: "Meeting",
    title: "Sync Notes & Decisions",
    category: "meeting",
    tags: ["meeting", "notes"],
    content: `# Key Discussion Points\n\n- \n\n## Decisions Locked\n> \n\n## Next Micro-Actions\n- [ ] Draft 2-sentence follow-up summary\n- [ ] Open sprint board and schedule top priority item`,
  },
];

export function parseTags(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.map((t) => String(t).trim()).filter(Boolean);
    }
  } catch {
    // Fallback empty
  }
  return [];
}
