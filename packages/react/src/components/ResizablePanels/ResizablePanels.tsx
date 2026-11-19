import { useRef, useState, type KeyboardEvent, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";

export interface ResizablePanelsProps {
  /** Exactly two panels — the first before the divider, the second after. */
  children: [ReactNode, ReactNode];
  orientation?: "horizontal" | "vertical";
  /** The first panel's size as a percentage of the container (0-100). */
  split?: number;
  defaultSplit?: number;
  onSplitChange?: (split: number) => void;
  minSplit?: number;
  maxSplit?: number;
  /** Required — the divider has no visible label of its own. */
  "aria-label": string;
  className?: string;
}

const STEP = 2;

/**
 * A real two-pane split layout — the divider is a genuine ARIA
 * `separator` (`aria-orientation`, `aria-valuenow`/`min`/`max`), drag-
 * resizable with the pointer and keyboard-resizable with arrow keys
 * (Home/End jump to the min/max split), not a fixed-width layout with
 * a decorative line between panels.
 */
export function ResizablePanels({
  children,
  orientation = "horizontal",
  split: controlledSplit,
  defaultSplit = 50,
  onSplitChange,
  minSplit = 10,
  maxSplit = 90,
  className,
  ...rest
}: ResizablePanelsProps) {
  const [uncontrolledSplit, setUncontrolledSplit] = useState(defaultSplit);
  const split = controlledSplit !== undefined ? controlledSplit : uncontrolledSplit;
  const containerRef = useRef<HTMLDivElement>(null);
  const isHorizontal = orientation === "horizontal";

  const setSplit = (next: number) => {
    const clamped = Math.min(maxSplit, Math.max(minSplit, next));
    if (controlledSplit === undefined) setUncontrolledSplit(clamped);
    onSplitChange?.(clamped);
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    const container = containerRef.current;
    if (!container) return;
    const divider = event.currentTarget;
    divider.setPointerCapture(event.pointerId);

    const handleMove = (moveEvent: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const ratio = isHorizontal
        ? (moveEvent.clientX - rect.left) / rect.width
        : (moveEvent.clientY - rect.top) / rect.height;
      setSplit(ratio * 100);
    };
    const handleUp = () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const decreaseKey = isHorizontal ? "ArrowLeft" : "ArrowUp";
    const increaseKey = isHorizontal ? "ArrowRight" : "ArrowDown";
    if (event.key === decreaseKey) {
      event.preventDefault();
      setSplit(split - STEP);
    } else if (event.key === increaseKey) {
      event.preventDefault();
      setSplit(split + STEP);
    } else if (event.key === "Home") {
      event.preventDefault();
      setSplit(minSplit);
    } else if (event.key === "End") {
      event.preventDefault();
      setSplit(maxSplit);
    }
  };

  return (
    <div
      ref={containerRef}
      className={["b4-resizable-panels", `b4-resizable-panels--${orientation}`, className ?? ""].filter(Boolean).join(" ")}
    >
      <div className="b4-resizable-panels__panel" style={{ flexBasis: `${split}%` }}>
        {children[0]}
      </div>
      <div
        role="separator"
        aria-orientation={orientation}
        aria-valuenow={Math.round(split)}
        aria-valuemin={minSplit}
        aria-valuemax={maxSplit}
        tabIndex={0}
        className="b4-resizable-panels__divider"
        onPointerDown={handlePointerDown}
        onKeyDown={handleKeyDown}
        {...rest}
      />
      <div className="b4-resizable-panels__panel b4-resizable-panels__panel--fill">{children[1]}</div>
    </div>
  );
}
