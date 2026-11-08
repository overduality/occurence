import React from "react";

export function renderInline(line: string): React.ReactNode[] {
  const tokens = line.split(/(`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g);
  return tokens.map((tok, idx) => {
    if (tok.startsWith("`") && tok.endsWith("`") && tok.length >= 2) {
      return (
        <code
          key={idx}
          className="rounded border border-line-subtle bg-well px-1.5 py-0.5 font-mono text-[12.5px] text-ink-primary"
        >
          {tok.slice(1, -1)}
        </code>
      );
    }
    if (tok.startsWith("**") && tok.endsWith("**") && tok.length >= 4) {
      return (
        <strong key={idx} className="font-semibold text-ink-primary">
          {tok.slice(2, -2)}
        </strong>
      );
    }
    const linkMatch = tok.match(/^\[([^\]]+)\]\((https?:\/\/[^)]+)\)$/);
    if (linkMatch) {
      return (
        <a
          key={idx}
          href={linkMatch[2]}
          target="_blank"
          rel="noreferrer noopener"
          className="font-medium text-accent underline underline-offset-4 hover:opacity-85"
        >
          {linkMatch[1]}
        </a>
      );
    }
    return <span key={idx}>{tok}</span>;
  });
}
