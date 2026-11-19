import { forwardRef, type ElementType, type ReactNode } from "react";

export interface VisuallyHiddenProps {
  children: ReactNode;
  /** Render as a different element than the default `<span>`. */
  as?: ElementType;
  className?: string;
}

/**
 * Hides content visually while keeping it in the accessibility tree —
 * the standard clip-based technique (not `display: none`/`visibility:
 * hidden`, which remove it from assistive tech too). Use for an icon
 * button's accessible name, a skip link, or any text that only screen
 * readers should hear.
 */
export const VisuallyHidden = forwardRef<HTMLElement, VisuallyHiddenProps>(function VisuallyHidden(
  { children, as: Component = "span", className },
  ref,
) {
  const Tag = Component as ElementType;
  return (
    <Tag ref={ref} className={["b4-visually-hidden", className ?? ""].filter(Boolean).join(" ")}>
      {children}
    </Tag>
  );
});
