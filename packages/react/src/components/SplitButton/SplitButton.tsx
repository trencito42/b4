import { Button, type ButtonVariant, type ButtonSize } from "../Button/Button.js";
import { IconButton } from "../IconButton/IconButton.js";
import { DropdownMenu, type DropdownMenuItem } from "../DropdownMenu/DropdownMenu.js";

export interface SplitButtonProps {
  /** The primary action's label. */
  children: string;
  onClick?: () => void;
  /** Secondary actions shown in the attached dropdown. */
  items: readonly DropdownMenuItem[];
  onSelect: (value: string) => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  className?: string;
}

const ChevronIcon = (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="m4 6 4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/**
 * A primary `Button` joined with a chevron `IconButton` that opens a real
 * `DropdownMenu` of secondary actions — not a static mockup chevron. Reuses
 * `ButtonGroup`'s CSS for the joined-edge visual treatment rather than
 * duplicating it.
 */
export function SplitButton({
  children,
  onClick,
  items,
  onSelect,
  variant = "secondary",
  size = "md",
  disabled = false,
  className,
}: SplitButtonProps) {
  return (
    <div
      role="group"
      aria-label={children}
      className={["b4-button-group", className ?? ""].filter(Boolean).join(" ")}
    >
      <Button variant={variant} size={size} disabled={disabled} onClick={onClick}>
        {children}
      </Button>
      <DropdownMenu
        items={items}
        onSelect={onSelect}
        trigger={
          <IconButton
            variant={variant}
            size={size}
            disabled={disabled}
            icon={ChevronIcon}
            aria-label={`More ${children} options`}
          />
        }
      />
    </div>
  );
}
