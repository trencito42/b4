import { forwardRef, type AnchorHTMLAttributes, type ReactNode } from "react";

export type LinkTone = "accent" | "neutral";

export interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  tone?: LinkTone;
  /** Shows a small external-link glyph and forces target/rel for safety. */
  external?: boolean;
  children?: ReactNode;
}

/**
 * Inline/standalone text link. `tone="neutral"` is for links embedded in
 * body copy where an accent-colored link would compete with surrounding
 * emphasis; `tone="accent"` (default) is for links that are themselves an
 * action, like a "View all" affordance. `external` sets
 * `target="_blank" rel="noopener noreferrer"` for you — never set those
 * manually and also pass `external`, they'd conflict.
 */
export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { tone = "accent", external = false, className, children, ...rest },
  ref,
) {
  return (
    <a
      ref={ref}
      className={["b4-link", `b4-link--${tone}`, className ?? ""].filter(Boolean).join(" ")}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      {...rest}
    >
      {children}
      {external && (
        <svg
          className="b4-link__icon"
          aria-hidden="true"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path d="M6 3h7v7M13 3 3 13" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </a>
  );
});
