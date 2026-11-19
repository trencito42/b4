# Advanced effects — accessibility

## `RefractionSweep`

A purely decorative overlay:

- `aria-hidden="true"` on the effect layer — never announced.
- `pointer-events: none` — never intercepts clicks, taps, or hit-testing.
- Respects `prefers-reduced-motion` via `@b4/motion`'s `useReducedMotion()`:
  it stops sweeping *and* drops the `backdrop-filter` blur (so no content
  is left permanently obscured behind frosted glass).
- Never a substitute for a real accessible status. If a component uses
  `RefractionSweep` to draw attention to a change, the actual state must
  also be conveyed via text, `aria-live`, `StatusBadge`, etc. — the effect
  adds nothing to the accessibility tree on its own.

`BorderBeam` and `DistortionWave` were removed (2026-11-19) — see
`docs/effects/README.md`.

## `TextMorph`

- Renders one visually-hidden `<span>` holding the full, current,
  unbroken string value (`b4-text-morph__sr-only`) as the accessible
  content. Every per-token visual span, including exiting-overlay tokens,
  is `aria-hidden="true"`.
- This means assistive tech reads the value once, as a single committed
  string on each update — never the in-between animated fragments, and
  never a doubled/duplicated reading from the entering and exiting layers
  both existing in the DOM during a transition.
- `aria-label` can be overridden when the visible text isn't the right
  label (e.g. visible "42%" but the accessible label should be the full
  sentence it's embedded in).
- Respects `prefers-reduced-motion`: under reduced motion the layout and
  token rects snap to final state with zero animation duration; nothing
  about the accessible output changes either way (it never depended on
  the animation).

## Verification status

- `RefractionSweep`: covered by axe scans in `e2e/refraction-sweep.spec.ts`,
  both themes.
- `TextMorph`: covered by its own e2e spec; no explicit axe assertion list
  has been independently re-confirmed for this document — see
  `e2e/` and `TextMorph.test.tsx` directly for the current, authoritative
  set of accessibility assertions rather than trusting this summary as the
  full list.
