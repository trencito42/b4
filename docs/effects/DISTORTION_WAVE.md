# DistortionWave

`packages/react/src/effects/DistortionWave/DistortionWave.tsx` · exported
from `@b4/react/effects`.

## Read this first: scope vs. the original brief

The mission brief that requested `DistortionWave` asked for a **view
transition** effect — swapping one rendered React view for another (e.g. a
review card into a success/receipt view) via a DOM snapshot pipeline (SVG
`foreignObject` + Canvas2D, falling back to/augmented by WebGL2), a
shader-based lens-distortion pass with chromatic aberration and particles,
and an imperative `revealed`/`revealedContent`/`overlay`/`source`/`capture`
API with `play()/reverse()/reset()/prepare()`.

**That effect does not exist in this repository as of 2026-11-19.** What is
implemented and documented below is a smaller, different effect: a
single-surface decorative accent, architecturally a sibling of
`BorderBeam` rather than a view-transition system. It:

- wraps **one** child (no `overlay`/`revealedContent`/second view),
- uses `backdrop-filter` to distort the real pixels already rendered behind
  it (so the distortion is of real content, not painted), but
- never swaps DOM, never captures a snapshot, has no WebGL context, and has
  no imperative API.

This gap is tracked, not hidden. If a future session is asked to build the
real view-transition `DistortionWave` from the brief, it should treat this
component as prior art for the "decorative sweep" half of the problem only,
and build the snapshot/WebGL transition as new, separate work — not try to
retrofit this component's API.

## API (as implemented)

```tsx
import { DistortionWave } from "@b4/react/effects";

<DistortionWave amplitude="md" direction="horizontal" tone="accent" duration={6}>
  <Card>...</Card>
</DistortionWave>
```

| Prop | Type | Default | Notes |
|---|---|---|---|
| `children` | `ReactNode` | — | The single surface the wave sweeps across. |
| `active` | `boolean` | `true` | Mounts/unmounts the wave layer entirely when `false`. |
| `amplitude` | `"sm" \| "md" \| "lg"` | `"md"` | Strength of the refraction (blur/saturate/contrast), not the size of the band — the band always covers the same fraction of the surface so the fringe stays aligned with the refraction at every amplitude. |
| `direction` | `"horizontal" \| "vertical"` | `"horizontal"` | Axis the band travels along. |
| `tone` | `"accent" \| "success" \| "warning" \| "danger" \| "info"` | `"accent"` | Maps to an existing B4 color token (chromatic fringe tint). |
| `duration` | `number` (seconds) | `6` | Full sweep time. |
| `radius` | `string` (CSS length) | `var(--b4-surface-radius)` | Must match the wrapped child's own radius, same reasoning as `BorderBeam`. |
| `className` | `string` | — | Forwarded to the outer wrapper. |

No `revealed`, `revealedContent`, `overlay`, `source`, `focus`, `palette`,
`waveStyle`, `scale`, `cornerRadius`, `scrub`, `capture`, `live`,
`prewarm`, `resolution`, `onFinish`, or imperative ref — none of these
exist on the current implementation.

## Amplitude presets

| `amplitude` | blur | saturate | contrast |
|---|---|---|---|
| `sm` | 2px | 1.25 | 1.04 |
| `md` | 4px | 1.45 | 1.08 |
| `lg` | 7px | 1.7 | 1.12 |

## Rendering architecture

- Outer wrapper renders `children` plus a sibling `<span aria-hidden>`
  layer (`b4-distortion-wave__layer`) containing a `__band` and `__fringe`
  child, both driven by one CSS keyframe track so they cannot drift apart.
- The band uses `backdrop-filter: blur() saturate() contrast()` so it
  distorts whatever is actually rendered behind it (real text/icons/
  surfaces), not a pre-rendered image.
- `direction` toggles a CSS class (`b4-distortion-wave--horizontal` /
  `--vertical`) that changes which axis the keyframe track animates along.
- No canvas, no SVG, no WebGL2 context.

## Behavior

- **Reduced motion**: the band stops travelling and holds a static
  position; critically, under reduced motion the component also stops
  applying the `backdrop-filter` blur (class flips from `--moving` to
  `--static`), so no text is left permanently sitting behind frosted glass.
- **Off-screen pausing**: `IntersectionObserver`, same pattern as
  `BorderBeam`.
- **No pointer interception**: `pointer-events: none`, `aria-hidden`.
- **No layout shift**: absolutely positioned overlay layer.

## Browser support / fallback

`backdrop-filter` is required for the refraction to be visible. In a
browser without `backdrop-filter` support, the band and fringe still
render (opacity/gradient), just without the blur-based distortion — there
is no explicit `@supports` fallback branch in the component; this is a
known limitation, not a tested fallback path.

## Use cases

- A subtle "something changed" sweep across a card after a value updates.
- Paired with `TextMorph`/`NumberTransition` to draw the eye toward a
  number that just changed, without implying a full-screen transition.

## Anti-patterns

- Don't use this expecting a success/confirmation *screen transition* —
  it does not swap views. For that, compose it with ordinary React
  conditional rendering / `TransitionGroup`, not as a replacement for one.
- Don't stack `direction="horizontal"` and `direction="vertical"` instances
  on the same child — pick one axis per surface.

## Accessibility

- `aria-hidden="true"`, `pointer-events: none`.
- Respects `prefers-reduced-motion`.

## Known limitations (explicit)

1. Not a view-transition effect — see the scope note at the top of this
   document.
2. No WebGL, no DOM snapshot/capture, no shader-based lens distortion or
   chromatic-aberration pass beyond a CSS filter tint — "chromatic fringe"
   here is a tinted gradient layer, not true per-channel offset.
3. No documented `@supports` fallback for browsers without
   `backdrop-filter`.
4. No imperative API (`play`/`reverse`/`reset`/`prepare`) — the effect is
   purely declarative/continuous via `active`.

## Tests

- `DistortionWave.test.tsx` — 9 unit tests.
- `e2e/distortion-wave.spec.ts` — 11 Playwright tests, both themes.

## Studio

A DistortionWave Lab lives in B4 Studio's Effects Lab page
(`apps/studio/src/studio/pages/EffectsLabPage.tsx`) with live controls for
`amplitude`, `direction`, `tone`, `duration`, and `active`.
