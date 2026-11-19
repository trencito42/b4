import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { Toolbar as BaseToolbar } from "@base-ui/react/toolbar";
import { Button, type ButtonVariant, type ButtonSize } from "../Button/Button.js";
import { IconButton, type IconButtonVariant, type IconButtonSize } from "../IconButton/IconButton.js";
import { motionCompatibleProps } from "../../internal/motionCompatibleProps.js";

export interface ToolbarProps {
  children: ReactNode;
  /** Required — the toolbar has no visible label of its own. */
  "aria-label": string;
  className?: string;
}

/**
 * A real ARIA toolbar — built on Base UI's `Toolbar.Root`, which
 * implements the APG toolbar keyboard pattern (roving tabindex, arrow
 * keys move focus between items, Home/End jump to the first/last),
 * not a styled flex row of buttons that only happens to Tab through in
 * document order. Items are `ToolbarButton`/`ToolbarIconButton` (wrap
 * Base UI's `Toolbar.Button` for the roving-tabindex registration,
 * delegating all visual rendering to B4's existing `Button`/
 * `IconButton` via the `render` prop — the exact composition pattern
 * `Checkbox` already uses for Base UI primitives with a custom look),
 * not raw `Button`/`IconButton` dropped in directly, which Base UI's
 * toolbar wouldn't know to manage focus for.
 *
 * `ToolbarButton`/`ToolbarIconButton` deliberately take plain native
 * button props (not `Button`/`IconButton`'s own Motion-flavored prop
 * types) — Base UI's `Toolbar.Button` expects a plain `<button>`
 * shape, and Motion's prop surface (`whileTap`, `style` as
 * `MotionStyle`, etc.) isn't assignable to it. The underlying
 * `Button`/`IconButton` still gets its own Motion press feedback
 * internally; only the item's own public prop type here is plain.
 */
export function Toolbar({ children, className, ...rest }: ToolbarProps) {
  return (
    <BaseToolbar.Root className={["b4-toolbar", className ?? ""].filter(Boolean).join(" ")} {...rest}>
      {children}
    </BaseToolbar.Root>
  );
}

export interface ToolbarGroupProps {
  children: ReactNode;
  className?: string;
}

/** Visually and semantically groups related toolbar items (e.g. a set of formatting toggles) with a divider's worth of extra spacing from neighboring groups. */
export function ToolbarGroup({ children, className }: ToolbarGroupProps) {
  return <BaseToolbar.Group className={["b4-toolbar__group", className ?? ""].filter(Boolean).join(" ")}>{children}</BaseToolbar.Group>;
}

export function ToolbarSeparator({ className }: { className?: string }) {
  return <BaseToolbar.Separator className={["b4-toolbar__separator", className ?? ""].filter(Boolean).join(" ")} />;
}

interface ToolbarButtonOwnProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  iconStart?: ReactNode;
  iconEnd?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export interface ToolbarButtonProps
  extends ToolbarButtonOwnProps,
    Omit<ComponentPropsWithoutRef<"button">, keyof ToolbarButtonOwnProps | "type"> {}

export const ToolbarButton = forwardRef<HTMLButtonElement, ToolbarButtonProps>(function ToolbarButton(
  { variant, size, loading, iconStart, iconEnd, children, className, ...rest },
  ref,
) {
  return (
    <BaseToolbar.Button
      render={(baseProps) => (
        <Button
          ref={ref}
          {...motionCompatibleProps(baseProps)}
          variant={variant}
          size={size}
          loading={loading}
          iconStart={iconStart}
          iconEnd={iconEnd}
          className={className}
        >
          {children}
        </Button>
      )}
      {...rest}
    />
  );
});

interface ToolbarIconButtonOwnProps {
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  loading?: boolean;
  icon: ReactNode;
  className?: string;
  /** Required — an icon-only button has no visible text for assistive tech to read. */
  "aria-label": string;
}

export interface ToolbarIconButtonProps
  extends ToolbarIconButtonOwnProps,
    Omit<ComponentPropsWithoutRef<"button">, keyof ToolbarIconButtonOwnProps | "type" | "aria-label"> {}

export const ToolbarIconButton = forwardRef<HTMLButtonElement, ToolbarIconButtonProps>(function ToolbarIconButton(
  { variant, size, loading, icon, className, "aria-label": ariaLabel, ...rest },
  ref,
) {
  return (
    <BaseToolbar.Button
      aria-label={ariaLabel}
      render={(baseProps) => (
        <IconButton
          ref={ref}
          {...motionCompatibleProps(baseProps)}
          variant={variant}
          size={size}
          loading={loading}
          icon={icon}
          className={className}
          aria-label={ariaLabel}
        />
      )}
      {...rest}
    />
  );
});
