import { forwardRef, type ReactNode } from "react";

export interface AspectRatioProps {
  /** width / height, e.g. 16 / 9. @default 1 */
  ratio?: number;
  children: ReactNode;
  className?: string;
}

/**
 * Constrains its content to a fixed width/height ratio (e.g. a 16:9
 * video or image placeholder) using the native CSS `aspect-ratio`
 * property. The child is absolutely positioned to fill the box — pass a
 * single block-level child (an `<img>`, a `<div>`, etc.) sized to
 * `100%`/`100%`.
 */
export const AspectRatio = forwardRef<HTMLDivElement, AspectRatioProps>(function AspectRatio(
  { ratio = 1, children, className },
  ref,
) {
  return (
    <div
      ref={ref}
      className={["b4-aspect-ratio", className ?? ""].filter(Boolean).join(" ")}
      style={{ aspectRatio: ratio }}
    >
      <div className="b4-aspect-ratio__content">{children}</div>
    </div>
  );
});
