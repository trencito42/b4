import { useEffect, useRef, useState, type ReactNode } from "react";
import { IconButton } from "../IconButton/IconButton.js";

export interface CodeBlockProps {
  code: string;
  /** Label shown in the header, e.g. "tsx" or "bash". Purely informational — this component does not tokenize/highlight syntax. */
  language?: string;
  showLineNumbers?: boolean;
  className?: string;
}

type CopyState = "idle" | "copied" | "failed";

const CopyIcon = (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5}>
    <rect x="5.5" y="5.5" width="8" height="8" rx="1.5" />
    <path d="M10.5 5.5V3.5a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2" />
  </svg>
);

const CheckIcon = (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.75}>
    <path d="m3.5 8.5 3 3 6-7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ErrorIcon = (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.75}>
    <path d="m4.5 4.5 7 7m0-7-7 7" strokeLinecap="round" />
  </svg>
);

const iconByState: Record<CopyState, ReactNode> = {
  idle: CopyIcon,
  copied: CheckIcon,
  failed: ErrorIcon,
};

const labelByState: Record<CopyState, string> = {
  idle: "Copy code",
  copied: "Copied",
  failed: "Copy failed",
};

const announcementByState: Record<CopyState, string> = {
  idle: "",
  copied: "Copied to clipboard",
  failed: "Copy to clipboard failed",
};

/**
 * A real, copyable code block — not a syntax-highlighted mockup. Doesn't
 * bundle a tokenizer (keeps this package's dependency footprint small);
 * consumers who want highlighting pre-render tokenized markup into
 * `code` themselves or wrap this component. The copy button genuinely
 * writes to the clipboard and confirms it, both visually and to
 * assistive tech via an `aria-live` announcement — and surfaces a
 * distinct failure state (not a silent no-op) when the browser denies
 * clipboard permission, e.g. in a cross-origin iframe or an insecure
 * context.
 */
export function CodeBlock({ code, language, showLineNumbers = false, className }: CodeBlockProps) {
  const [state, setState] = useState<CopyState>("idle");
  const resetTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(resetTimer.current), []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setState("copied");
    } catch {
      setState("failed");
    }
    clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setState("idle"), 2000);
  };

  const lines = code.split("\n");

  return (
    <div className={["b4-code-block", className ?? ""].filter(Boolean).join(" ")}>
      <div className="b4-code-block__header">
        <span className="b4-code-block__language">{language ?? "code"}</span>
        <IconButton
          variant="ghost"
          size="sm"
          aria-label={labelByState[state]}
          icon={iconByState[state]}
          onClick={handleCopy}
          className={["b4-code-block__copy", state === "failed" ? "b4-code-block__copy--failed" : ""]
            .filter(Boolean)
            .join(" ")}
        />
      </div>
      <pre className="b4-code-block__pre">
        <code className="b4-code-block__code">
          {showLineNumbers
            ? lines.map((line, i) => (
                <span key={i} className="b4-code-block__line">
                  <span className="b4-code-block__line-number" aria-hidden="true">
                    {i + 1}
                  </span>
                  <span className="b4-code-block__line-content">{line}</span>
                </span>
              ))
            : code}
        </code>
      </pre>
      <span className="b4-code-block__live-region" role="status" aria-live="polite">
        {announcementByState[state]}
      </span>
    </div>
  );
}
