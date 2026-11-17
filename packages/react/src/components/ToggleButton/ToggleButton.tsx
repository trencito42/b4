import type { ReactNode } from "react";
import { Toggle } from "@base-ui/react/toggle";

export type ToggleButtonSize = "sm" | "md" | "lg";

export interface ToggleButtonProps {
  pressed?: boolean;
  defaultPressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
  disabled?: boolean;
  size?: ToggleButtonSize;
  children: ReactNode;
  className?: string;
}

/**
 * A standalone two-state button (bold/italic in a toolbar, "starred",
 * "muted") — the single-button counterpart to `SegmentedControl`'s
 * grouped, exclusive selection. Built directly on Base UI's `Toggle`
 * (no `ToggleGroup` wrapper, since there's nothing to coordinate between
 * multiple items here).
 */
export function ToggleButton({
  pressed,
  defaultPressed,
  onPressedChange,
  disabled = false,
  size = "md",
  children,
  className,
}: ToggleButtonProps) {
  return (
    <Toggle
      pressed={pressed}
      defaultPressed={defaultPressed}
      onPressedChange={onPressedChange}
      disabled={disabled}
      className={["b4-toggle-button", `b4-toggle-button--${size}`, className ?? ""]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </Toggle>
  );
}
