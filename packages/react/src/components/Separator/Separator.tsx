import { forwardRef } from "react";
import { Separator as BaseSeparator } from "@base-ui/react/separator";

export interface SeparatorProps {
  orientation?: "horizontal" | "vertical";
  className?: string;
}

/**
 * A visual + semantic divider between content, built on Base UI's
 * `Separator` (real `role="separator"`/`aria-orientation`, not a bare
 * `<hr>` or decorative `<div>`). Horizontal fills its container's width;
 * vertical fills its container's height — the parent controls length.
 */
export const Separator = forwardRef<HTMLDivElement, SeparatorProps>(function Separator(
  { orientation = "horizontal", className },
  ref,
) {
  return (
    <BaseSeparator
      ref={ref}
      orientation={orientation}
      className={["b4-separator", `b4-separator--${orientation}`, className ?? ""].filter(Boolean).join(" ")}
    />
  );
});
