import type { ReactElement, ReactNode } from "react";
import { Popover } from "../Popover/Popover.js";
import { Button } from "../Button/Button.js";

export interface NotificationItem {
  id: string;
  title: ReactNode;
  description?: ReactNode;
  /** A pre-formatted, display-ready string (e.g. "2h ago") — this component doesn't do relative-time formatting itself. */
  timestamp?: string;
  read?: boolean;
}

export interface NotificationPanelProps {
  items: readonly NotificationItem[];
  onItemClick?: (id: string) => void;
  onMarkAllRead?: () => void;
  emptyMessage?: string;
  /** The trigger element, typically a bell `IconButton`. */
  trigger: ReactElement;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/**
 * A persistent notification list in a popover — distinct from `Toast`
 * (transient, self-dismissing) and from a single `InlineAlert`
 * (one message, not a list). Built on the existing `Popover` for its
 * chrome (real Escape/outside-click-to-close, positioning), not a
 * second popup implementation. Unread state is never color-only — each
 * unread item gets a visible dot *and* bolder title text, following the
 * same "color never carries meaning alone" rule `StatusBadge` already
 * established.
 */
export function NotificationPanel({
  items,
  onItemClick,
  onMarkAllRead,
  emptyMessage = "No notifications",
  trigger,
  open,
  onOpenChange,
}: NotificationPanelProps) {
  const unreadCount = items.filter((item) => !item.read).length;

  return (
    <Popover title="Notifications" trigger={trigger} open={open} onOpenChange={onOpenChange}>
      <div className="b4-notification-panel">
        {unreadCount > 0 && onMarkAllRead && (
          <div className="b4-notification-panel__header">
            <Button variant="ghost" size="sm" onClick={onMarkAllRead}>
              Mark all as read
            </Button>
          </div>
        )}
        {items.length === 0 ? (
          <p className="b4-notification-panel__empty">{emptyMessage}</p>
        ) : (
          <ul className="b4-notification-panel__list">
            {items.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className={[
                    "b4-notification-panel__item",
                    !item.read ? "b4-notification-panel__item--unread" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => onItemClick?.(item.id)}
                >
                  <span className="b4-notification-panel__item-marker" aria-hidden="true" />
                  <span className="b4-notification-panel__item-content">
                    <span className="b4-notification-panel__item-title">
                      {item.title}
                      {!item.read && <span className="b4-notification-panel__visually-hidden"> (unread)</span>}
                    </span>
                    {item.description && (
                      <span className="b4-notification-panel__item-description">{item.description}</span>
                    )}
                    {item.timestamp && (
                      <span className="b4-notification-panel__item-timestamp">{item.timestamp}</span>
                    )}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Popover>
  );
}
