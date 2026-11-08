/**
 * Formats a stable, readable Jira-style issue key (e.g. OC-101) from a task ID.
 */
export function formatIssueKey(taskId: string): string {
  const seedMatch = taskId.match(/(\d+)$/);
  if (seedMatch && seedMatch[1].length <= 2) {
    return `OC-${100 + Number(seedMatch[1])}`;
  }
  let hash = 0;
  for (let i = 0; i < taskId.length; i += 1) {
    hash = (hash * 31 + taskId.charCodeAt(i)) >>> 0;
  }
  const num = 110 + (hash % 880);
  return `OC-${num}`;
}
