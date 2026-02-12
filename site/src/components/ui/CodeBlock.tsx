"use client";

import { useState } from "react";

export function CodeBlock({
  code,
  language = "bash",
  filename,
}: {
  code: string;
  language?: string;
  filename?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg border border-surface-border overflow-hidden">
      {filename && (
        <div className="flex items-center justify-between px-4 py-2 bg-surface-terminal border-b border-surface-border">
          <span className="text-xs text-text-dim font-mono">{filename}</span>
        </div>
      )}
      <div className="relative group">
        <pre className="p-4 bg-surface-terminal overflow-x-auto">
          <code className={`text-sm font-mono text-text-body language-${language}`}>
            {code}
          </code>
        </pre>
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-md border border-surface-border bg-surface-card px-2 py-1 text-xs text-text-muted hover:text-gold hover:border-gold/50"
          aria-label="Copy code"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
    </div>
  );
}
