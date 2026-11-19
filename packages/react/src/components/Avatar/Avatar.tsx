import { forwardRef, useState } from "react";

export type AvatarSize = "sm" | "md" | "lg";

export interface AvatarProps {
  /** The person/entity's name — used for the accessible label and the initials fallback. */
  name: string;
  src?: string;
  size?: AvatarSize;
  className?: string;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts.at(0);
  if (first === undefined) return "";
  const last = parts.at(-1);
  if (last === undefined || first === last) return first.slice(0, 2).toUpperCase();
  return (first[0]! + last[0]!).toUpperCase();
}

/**
 * Shows `src` when it loads successfully; falls back to initials derived
 * from `name` otherwise (including while `src` is loading, briefly, and
 * permanently if it 404s). Always has an accessible name from `name` —
 * never render an Avatar for an unnamed entity without at least a
 * placeholder name like "Unknown user".
 */
export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(function Avatar(
  { name, src, size = "md", className },
  ref,
) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(src) && !imageFailed;

  return (
    <span
      ref={ref}
      role="img"
      aria-label={name}
      className={["b4-avatar", `b4-avatar--${size}`, className ?? ""].filter(Boolean).join(" ")}
    >
      {showImage ? (
        <img
          src={src}
          alt=""
          className="b4-avatar__image"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span className="b4-avatar__initials" aria-hidden="true">
          {getInitials(name)}
        </span>
      )}
    </span>
  );
});
