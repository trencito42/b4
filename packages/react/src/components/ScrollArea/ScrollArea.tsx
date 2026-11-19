import { forwardRef, type CSSProperties, type ReactNode } from "react";
import { ScrollArea as BaseScrollArea } from "@base-ui/react/scroll-area";

export interface ScrollAreaProps {
  children: ReactNode;
  /** CSS max-height for the viewport — the area scrolls once content exceeds it. */
  maxHeight?: CSSProperties["maxHeight"];
  className?: string;
}

/**
 * A scrollable region with B4-styled overlay scrollbars (thin, only
 * visible on hover/scroll, never shifting layout like native OS
 * scrollbars can) — built on Base UI's `ScrollArea` for real keyboard/
 * wheel/touch scrolling, not a custom scroll-jacking implementation.
 */
export const ScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(function ScrollArea(
  { children, maxHeight, className },
  ref,
) {
  return (
    <BaseScrollArea.Root
      ref={ref}
      className={["b4-scroll-area", className ?? ""].filter(Boolean).join(" ")}
      style={{ maxHeight }}
    >
      <BaseScrollArea.Viewport className="b4-scroll-area__viewport">
        <BaseScrollArea.Content className="b4-scroll-area__content">{children}</BaseScrollArea.Content>
      </BaseScrollArea.Viewport>
      <BaseScrollArea.Scrollbar orientation="vertical" className="b4-scroll-area__scrollbar">
        <BaseScrollArea.Thumb className="b4-scroll-area__thumb" />
      </BaseScrollArea.Scrollbar>
      <BaseScrollArea.Scrollbar orientation="horizontal" className="b4-scroll-area__scrollbar">
        <BaseScrollArea.Thumb className="b4-scroll-area__thumb" />
      </BaseScrollArea.Scrollbar>
      <BaseScrollArea.Corner className="b4-scroll-area__corner" />
    </BaseScrollArea.Root>
  );
});
