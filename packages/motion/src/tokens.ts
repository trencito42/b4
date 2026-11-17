/**
 * Motion tokens — the JS-side mirror of the duration/easing custom
 * properties in @b4/tokens' base.css. Kept as plain numbers/arrays (not CSS
 * var() reads) because Motion-for-React spring/tween configs need real
 * values at animation-start time, not strings resolved per-frame.
 *
 * If you change a duration or easing curve here, change the matching
 * `--b4-duration-*` / `--b4-ease-*` custom property in
 * packages/tokens/src/base.css too — see MOTION_SPEC.md "Keeping CSS and JS
 * motion tokens in sync".
 */

export const durations = {
  instant: 0.08,
  fast: 0.14,
  base: 0.22,
  slow: 0.36,
  slower: 0.52,
} as const;

export type DurationToken = keyof typeof durations;

/** CSS cubic-bezier easing curves, for non-spring (tween) transitions. */
export const easings = {
  standard: [0.4, 0, 0.2, 1] as const,
  enter: [0.16, 1, 0.3, 1] as const,
  exit: [0.4, 0, 1, 1] as const,
  emphasized: [0.2, 0, 0, 1] as const,
};

export type EasingToken = keyof typeof easings;

/**
 * Spring presets for Motion's `type: "spring"` transitions, tuned by feel
 * for the sculptural-but-precise B4 motion language — nothing bouncy,
 * nothing slow. `snap` is the default for in-place state changes (hover,
 * pressed, selection). `travel` is for things that move across the layout
 * (the segmented-control indicator, drag handles). `settle` is for
 * entry/exit of whole surfaces (dialogs, drawers, popovers).
 */
export const springs = {
  snap: { type: "spring", stiffness: 500, damping: 40, mass: 1 } as const,
  travel: { type: "spring", stiffness: 420, damping: 38, mass: 1 } as const,
  settle: { type: "spring", stiffness: 300, damping: 32, mass: 1 } as const,
  gentle: { type: "spring", stiffness: 220, damping: 26, mass: 1 } as const,
};

export type SpringToken = keyof typeof springs;

/** Standard tween transition built from a duration + easing token pair. */
export function tween(duration: DurationToken, easing: EasingToken) {
  return {
    type: "tween" as const,
    duration: durations[duration],
    ease: easings[easing],
  };
}
