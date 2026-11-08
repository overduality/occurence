import React from "react";
import { getWorkspaceSnapshot } from "@/lib/db";
import { WorkspaceShell } from "@/components/WorkspaceShell";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const initialSnapshot = getWorkspaceSnapshot();
  return <WorkspaceShell initialSnapshot={initialSnapshot} />;
}
