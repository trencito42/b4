import type { ReactNode } from "react";
import { Avatar } from "../Avatar/Avatar";

export interface ActivityFeedItem {
  id: string;
  actorName: string;
  actorAvatarSrc?: string;
  /** The action text, e.g. "merged pull request #248". Rendered after the actor's name. */
  action: ReactNode;
  /** Formatted timestamp text, e.g. "2 hours ago". */
  timestamp?: ReactNode;
}

export interface ActivityFeedProps {
  items: ActivityFeedItem[];
  className?: string;
}

/**
 * A chronological list of actor-attributed events — distinct from
 * `Timeline` (which has no actor/avatar and can represent system events
 * with no "who"). Reuses `Avatar` rather than reimplementing initials/
 * image-fallback logic.
 */
export function ActivityFeed({ items, className }: ActivityFeedProps) {
  return (
    <ol className={["b4-activity-feed", className ?? ""].filter(Boolean).join(" ")}>
      {items.map((item) => (
        <li key={item.id} className="b4-activity-feed__item">
          <Avatar name={item.actorName} src={item.actorAvatarSrc} size="sm" className="b4-activity-feed__avatar" />
          <div className="b4-activity-feed__content">
            <span className="b4-activity-feed__text">
              <span className="b4-activity-feed__actor">{item.actorName}</span> {item.action}
            </span>
            {item.timestamp && <span className="b4-activity-feed__timestamp">{item.timestamp}</span>}
          </div>
        </li>
      ))}
    </ol>
  );
}
