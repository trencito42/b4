import { forwardRef, type HTMLAttributes, type ReactNode } from "react";

export type CardVariant = "flat" | "raised" | "outlined";
export type CardPadding = "none" | "sm" | "md" | "lg";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Visual treatment. Defaults to "flat" (a surface step above canvas, no shadow). */
  variant?: CardVariant;
  /** Inner padding scale. Defaults to "md". */
  padding?: CardPadding;
  children?: ReactNode;
}

/**
 * B4's static content surface. Composes with Stat/EmptyState/ErrorState and
 * any other Family D content that needs a bounded, elevated container
 * without the press/hover affordances of InteractiveCard.
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { variant = "flat", padding = "md", children, className, ...rest },
  ref,
) {
  const classNames = [
    "b4-card",
    `b4-card--${variant}`,
    `b4-card--padding-${padding}`,
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div ref={ref} className={classNames} {...rest}>
      {children}
    </div>
  );
});
