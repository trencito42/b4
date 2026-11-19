import { forwardRef, useId, useState, type ChangeEvent, type UIEvent } from "react";
import { tokenizeQuery, type QueryToken } from "./queryLanguage.js";

export interface QueryEditorProps {
  /** Required — the editor has no visible caption of its own. */
  "aria-label": string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  disabled?: boolean;
  className?: string;
  /**
   * The only language this editor actually parses. Passing it is optional
   * because there is no second mode hiding behind the prop.
   */
  language?: "sql";
}

function tokenClass(token: QueryToken): string | undefined {
  if (token.type === "keyword" || token.type === "string" || token.type === "number" || token.type === "comment" || token.type === "invalid") {
    return `b4-query-editor__token b4-query-editor__token--${token.type}`;
  }
  return undefined;
}

/**
 * A SQL editor: a native textarea keeps the caret, selection, IME, and
 * undo behavior, and a parallel token layer paints keywords, strings,
 * numbers, and comments from `tokenizeQuery`. Syntax errors (unclosed
 * string, unclosed comment, unbalanced parentheses) are real diagnostics,
 * announced in a live region. This is not a monospace Textarea.
 */
export const QueryEditor = forwardRef<HTMLTextAreaElement, QueryEditorProps>(function QueryEditor(
  {
    "aria-label": ariaLabel,
    value: controlledValue,
    defaultValue,
    onValueChange,
    placeholder,
    readOnly,
    disabled,
    className,
    language = "sql",
  },
  ref,
) {
  const [uncontrolled, setUncontrolled] = useState(defaultValue ?? "");
  const value = controlledValue ?? uncontrolled;
  const { tokens, diagnostic } = tokenizeQuery(value);
  const errorId = useId();
  const lineCount = value.split("\n").length;

  function onChange(event: ChangeEvent<HTMLTextAreaElement>) {
    const next = event.target.value;
    if (controlledValue === undefined) setUncontrolled(next);
    onValueChange?.(next);
  }

  function onScroll(event: UIEvent<HTMLTextAreaElement>) {
    const stage = event.currentTarget.parentElement;
    const highlight = stage?.querySelector<HTMLElement>(".b4-query-editor__highlight");
    const gutter = stage?.parentElement?.querySelector<HTMLElement>(".b4-query-editor__gutter");
    if (highlight) {
      highlight.scrollTop = event.currentTarget.scrollTop;
      highlight.scrollLeft = event.currentTarget.scrollLeft;
    }
    if (gutter) gutter.scrollTop = event.currentTarget.scrollTop;
  }

  return (
    <div className={["b4-query-editor", className ?? ""].filter(Boolean).join(" ")} data-language={language}>
      <div
        className="b4-query-editor__frame"
        data-invalid={diagnostic ? "" : undefined}
        data-disabled={disabled ? "" : undefined}
      >
        <div className="b4-query-editor__gutter" aria-hidden="true">
          {Array.from({ length: lineCount }, (_, index) => (
            <div key={index} className="b4-query-editor__line-number">
              {index + 1}
            </div>
          ))}
        </div>
        <div className="b4-query-editor__stage">
          <pre className="b4-query-editor__highlight" aria-hidden="true">
            {tokens.map((token) => (
              <span key={token.index} className={tokenClass(token)}>
                {token.text}
              </span>
            ))}
          </pre>
          <textarea
            ref={ref}
            className="b4-query-editor__input"
            aria-label={ariaLabel}
            aria-invalid={diagnostic ? true : undefined}
            aria-describedby={diagnostic ? errorId : undefined}
            value={value}
            placeholder={placeholder}
            readOnly={readOnly}
            disabled={disabled}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            wrap="off"
            onChange={onChange}
            onScroll={onScroll}
          />
        </div>
      </div>
      {diagnostic ? (
        <p id={errorId} className="b4-query-editor__error" role="alert">
          {diagnostic.message}
        </p>
      ) : null}
    </div>
  );
});
