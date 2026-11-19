# Advanced effects — performance

## `BorderBeam` / `DistortionWave`

- Pure CSS animation (no JS per-frame cost). Browser compositor handles the
  `@keyframes` rotation/sweep off the main thread where the animated
  properties allow it.
- Each active instance registers one `IntersectionObserver`; the observer
  callback toggles a CSS class, it does not re-render React state on every
  intersection change beyond the boolean flip needed.
- Pauses (stops the CSS animation class) when scrolled off-screen, so an
  off-screen instance costs nothing beyond the idle observer.
- `DistortionWave`'s `backdrop-filter` is the more expensive of the two —
  filtering real pixels behind the band is inherently costlier than
  `BorderBeam`'s gradient ring. No measured budget/frame-time numbers exist
  yet for this repository; this is a known gap, not a verified "fast"
  claim.

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

- No Lighthouse/performance-trace numbers are recorded for any of the
  three effects in this repository. "Composition" scenarios (multiple
  effects active at once, see [COMPOSITION.md](./COMPOSITION.md)) have not
  been profiled either. Record real numbers here once measured — do not
  fill this section with estimated or assumed figures.
