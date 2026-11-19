# Advanced effects — performance

## `RefractionSweep`

- Pure CSS animation (no JS per-frame cost). Browser compositor handles the
  `@keyframes` sweep off the main thread where the animated properties
  allow it.
- Registers one `IntersectionObserver` per active instance; the observer
  callback toggles a CSS class, it does not re-render React state on every
  intersection change beyond the boolean flip needed.
- Pauses (stops the CSS animation class) when scrolled off-screen, so an
  off-screen instance costs nothing beyond the idle observer.
- Its `backdrop-filter` is inherently costlier than a plain gradient —
  filtering real pixels behind the band has a real per-frame cost. No
  measured budget/frame-time numbers exist yet for this repository; this
  is a known gap, not a verified "fast" claim.

## `TextMorph`

- Measurement (`getBoundingClientRect`) and the FLIP pass only run inside
  `useLayoutEffect`, gated on an actual `value`/`mode` change — not on
  every render.
- Animation count scales with the number of tokens that actually changed
  (entered, exited, or moved), not the full string length.
- A new `value` arriving mid-animation stops all in-flight `animate()`
  calls for the previous diff before starting the next one — this bounds
  the number of concurrent animations to roughly one diff's worth, even
  under rapid updates, rather than accumulating.
- No virtualization or memoization beyond this — morphing very long strings
  (hundreds of tokens) has not been specifically profiled; treat it as
  intended for short, bounded content (labels, counters, statuses), not
  paragraphs.

## Open work

- No Lighthouse/performance-trace numbers are recorded for either effect
  in this repository. Record real numbers here once measured — do not
  fill this section with estimated or assumed figures.

## `BorderBeam` and `DistortionWave` were removed (2026-11-19)

Both previously documented here. Removed by explicit mission-brief
decision — see `docs/effects/README.md`.
