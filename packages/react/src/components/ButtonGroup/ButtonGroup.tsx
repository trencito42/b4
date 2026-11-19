import { forwardRef, type ReactNode } from "react";

export interface ButtonGroupProps {
  /** `Button`/`IconButton`/`ToggleButton` elements to join visually. */
  children: ReactNode;
  /** Required — the group has no visible label of its own. */
  "aria-label": string;
  className?: string;
}

/**
 * Visually joins a row of `Button`/`IconButton` elements (e.g. formatting
 * controls in a toolbar) — flattens the shared edges' radius via CSS so
 * they read as one segmented object, without any of the shared-selection
 * logic `SegmentedControl`/`ToggleGroup` provide. Use `ButtonGroup` when
 * every button is an independent action; use `SegmentedControl` when
 * exactly one of several options should be selected at a time.
 */
export const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(function ButtonGroup(
  { children, className, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      role="group"
      className={["b4-button-group", className ?? ""].filter(Boolean).join(" ")}
      {...rest}
    >
      {children}
    </div>
  );
});
