import { forwardRef, type ReactNode } from "react";

export type TimelineItemTone = "neutral" | "success" | "warning" | "danger" | "info";

export interface TimelineItem {
  id: string;
  title: ReactNode;
  description?: ReactNode;
  /** Formatted timestamp text, e.g. "2 hours ago" or "Mar 4, 2026". */
  timestamp?: ReactNode;
  tone?: TimelineItemTone;
}

export interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

/**
 * A chronological, connected list of events — distinct from `ActivityFeed`
 * (which pairs each entry with an actor/avatar) and from `Stepper` (which
 * tracks progress through a fixed sequence of steps, not an open-ended
 * history). Renders as a real ordered list so screen readers announce
 * position/count per entry.
 */
export const Timeline = forwardRef<HTMLOListElement, TimelineProps>(function Timeline(
  { items, className },
  ref,
) {
  return (
    <ol ref={ref} className={["b4-timeline", className ?? ""].filter(Boolean).join(" ")}>
      {items.map((item) => (
        <li key={item.id} className="b4-timeline__item">
          <span
            className={`b4-timeline__dot b4-timeline__dot--${item.tone ?? "neutral"}`}
            aria-hidden="true"
          />
          <div className="b4-timeline__content">
            <div className="b4-timeline__header">
              <span className="b4-timeline__title">{item.title}</span>
              {item.timestamp && <span className="b4-timeline__timestamp">{item.timestamp}</span>}
            </div>
            {item.description && <div className="b4-timeline__description">{item.description}</div>}
          </div>
        </li>
      ))}
    </ol>
  );
});
