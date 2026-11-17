import { Avatar, type AvatarSize } from "../Avatar/Avatar.js";

export interface AvatarGroupPerson {
  name: string;
  src?: string;
}

export interface AvatarGroupProps {
  people: readonly AvatarGroupPerson[];
  /** Show at most this many avatars before collapsing the rest into a "+N" indicator. */
  max?: number;
  size?: AvatarSize;
  className?: string;
}

/**
 * A stack of overlapping avatars with a "+N" overflow indicator —
 * assignees on a ticket, participants in a thread. Overflow is a real
 * count derived from `people.length - max`, not a decorative cutoff.
 */
export function AvatarGroup({ people, max = 4, size = "md", className }: AvatarGroupProps) {
  const visible = people.slice(0, max);
  const overflow = people.length - visible.length;

  return (
    <div
      className={["b4-avatar-group", `b4-avatar-group--${size}`, className ?? ""]
        .filter(Boolean)
        .join(" ")}
    >
      {visible.map((person, i) => (
        <span className="b4-avatar-group__item" key={`${person.name}-${i}`}>
          <Avatar name={person.name} src={person.src} size={size} />
        </span>
      ))}
      {overflow > 0 && (
        <span
          className="b4-avatar-group__item b4-avatar-group__overflow"
          role="img"
          aria-label={`${overflow} more ${overflow === 1 ? "person" : "people"}`}
        >
          +{overflow}
        </span>
      )}
    </div>
  );
}
