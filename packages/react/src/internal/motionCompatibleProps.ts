type NativeMotionConflicts = "onAnimationStart" | "onDrag" | "onDragStart" | "onDragEnd";

/** Base UI supplies native DOM props. These four names mean different
 * events in Motion. Internal render targets do not use them; retain all
 * pointer, keyboard, focus, form, accessibility and ref props unchanged. */
export function motionCompatibleProps<
  T extends {
    onAnimationStart?: unknown;
    onDrag?: unknown;
    onDragStart?: unknown;
    onDragEnd?: unknown;
  },
>(props: T): Omit<T, NativeMotionConflicts> {
  const result = { ...props };
  delete result.onAnimationStart;
  delete result.onDrag;
  delete result.onDragStart;
  delete result.onDragEnd;
  return result;
}
