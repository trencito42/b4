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
  it (so the distortion is of real content, not painted), **and**, riding
  on top of that, a genuine WebGL2 shader (not a CSS trick) rendering
  chromatic aberration, an animated caustic shimmer and a specular hot
  core — see "Rendering architecture" below — but
- never swaps DOM, never captures a DOM-content snapshot/texture, and has
  no imperative API.

The WebGL layer is real GPU rendering (an actual `<canvas>` + compiled
GLSL ES 3.00 program via `WebGL2RenderingContext`), added 2026-11-19 after
the first version of this component used a flat CSS gradient for the
crest/fringe and was explicitly called out as too basic. It is **not**,
however, sampling a texture of the DOM content underneath — it renders a
procedural light effect that rides the same travelling band as the real
`backdrop-filter` distortion, not a distorted copy of the pixels
themselves. That distinction is the actual remaining gap vs. the brief's
WebGL ask (per-pixel lens distortion of captured content) — see "Known
limitations" below.

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
  layer (`b4-distortion-wave__layer`) containing a `__band` (the real
  `backdrop-filter` distortion) and a `__crest-mask` box, both driven by
  one CSS keyframe track so their *positions* cannot drift apart.
- The band uses `backdrop-filter: blur() saturate() contrast()` so it
  distorts whatever is actually rendered behind it (real text/icons/
  surfaces), not a pre-rendered image.
- The `__crest-mask` box contains a `<canvas class="b4-distortion-wave__crest">`
  (`DistortionWaveCrest.tsx`), a real WebGL2 context (`crest.ts`) running a
  compiled GLSL ES 3.00 fragment shader every animation frame via
  `requestAnimationFrame`. The shader computes, per pixel: an RGB-channel-
  split specular core (chromatic aberration — literally three different
  horizontal offsets for the red/green/blue channels, not a tinted
  overlay), a two-octave value-noise caustic shimmer animated over time,
  and a bright white hot core at the band's center — composited with
  real alpha blending (`gl.BLEND`, `SRC_ALPHA`/`ONE_MINUS_SRC_ALPHA`) onto
  the content below.
- The crest's **position** (which part of the card it's currently over)
  comes from the same CSS keyframe/transform the band uses, so they travel
  together. The crest's **shimmer** animates on its own `requestAnimationFrame`
  clock inside the shader, independent of the CSS animation's timing
  function — documented here as a real architectural distinction, not
  glossed over as "the same track" the way the pre-WebGL version's flat
  gradient was.
- The crest's color is resolved from the requested `tone` by setting that
  CSS custom property as the canvas's own `color` and reading back
  `getComputedStyle(canvas).color` — so it stays correct across B4's
  Graphite/Porcelain themes without hardcoding an RGB value, and a
  `MutationObserver` on `<html data-b4-theme>` re-samples it on a live
  theme switch.
- `direction` toggles a CSS class (`b4-distortion-wave--horizontal` /
  `--vertical`) that changes which axis the keyframe track animates along,
  and is passed into the shader (`uVertical`) so the crest's own internal
  gradient direction matches.

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

`backdrop-filter` is required for the band's refraction to be visible; in
a browser without it, the band still renders (no blur-based distortion,
same known gap as before) — there is no explicit `@supports` fallback
branch. The WebGL2 crest degrades independently and gracefully: if
`canvas.getContext("webgl2")` returns `null` (unsupported browser, or
jsdom in tests) or a `webglcontextlost` event fires, `createCrestRenderer`
returns `null`/stops rendering rather than throwing — the crest simply
doesn't render (fully transparent canvas) while the real `backdrop-filter`
band keeps working on its own.

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
2. **The WebGL shader does not sample DOM content.** It's a real,
   per-pixel-animated GPU shader (chromatic aberration, caustic shimmer,
   specular core), but it renders a procedural light effect, not a
   captured-and-distorted texture of the actual pixels underneath. The
   real per-pixel distortion of the content itself is still the separate
   `backdrop-filter` band (CSS, not WebGL) — see "Rendering architecture."
3. No documented `@supports` fallback for browsers without
   `backdrop-filter`. The WebGL2 crest's own unavailability fallback (no
   context / context loss) is implemented and tested, unlike this one.
4. No imperative API (`play`/`reverse`/`reset`/`prepare`) — the effect is
   purely declarative/continuous via `active`.
5. No measured GPU frame-time/performance numbers recorded for the shader
   yet — see `docs/effects/PERFORMANCE.md`.

## Tests

- `DistortionWave.test.tsx` — 11 unit tests (includes the WebGL-crest
  structural checks and a "does not throw when WebGL2 is unavailable"
  regression test for jsdom/unsupported browsers).
- `e2e/distortion-wave.spec.ts` — 11 Playwright tests, both themes (not
  re-run against the WebGL rebuild in this session — Playwright runs in a
  real Chromium with WebGL2 available, so these should still pass, but
  that has not been independently re-verified here; re-run before relying
  on this count).

## Studio

A DistortionWave Lab lives in B4 Studio's Effects Lab page
(`apps/studio/src/studio/pages/EffectsLabPage.tsx`) with live controls for
`amplitude`, `direction`, `tone`, `duration`, and `active`.
