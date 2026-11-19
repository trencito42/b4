# Advanced effects — architecture overview

Three independent implementations, intentionally not sharing a runtime:

| Effect | Mechanism | Owns DOM nodes | Owns animation |
|---|---|---|---|
| `BorderBeam` | CSS `conic-gradient` + mask-composite ring | 1 `aria-hidden` sibling span | CSS `@keyframes` (spin), toggled by class |
| `DistortionWave` | CSS `backdrop-filter` sweep band | 1 `aria-hidden` sibling span (band + fringe) | CSS `@keyframes` (sweep), toggled by class |
| `TextMorph` | FLIP (measure → invert → play) over per-token spans | N token spans + exiting-overlay spans | `motion/react`'s imperative `animate()`, JS-driven |

`BorderBeam` and `DistortionWave` are declarative, continuous, CSS-only
decorative overlays: they have no JS animation loop, no imperative API, and
cost one composited layer each while active. `TextMorph` is JS-driven
because it needs per-update measurement (`getBoundingClientRect`) to know
what actually moved — a CSS-only transition can't do a FLIP diff.

Both effects pause via `IntersectionObserver` rather than, e.g., a shared
visibility context — this was a deliberate simplicity choice (no shared
effects-runtime/provider to coordinate) at the cost of one observer per
instance. If B4 ever ships effects with meaningfully higher per-frame cost
(e.g. the WebGL `DistortionWave` described as a gap in
[DISTORTION_WAVE.md](./DISTORTION_WAVE.md)), that cost tradeoff should be
revisited rather than copied as-is.

## Bundle boundary

`BorderBeam` and `DistortionWave` live under `packages/react/src/effects/`
and are exported only from the `@b4/react/effects` subpath
(`packages/react/src/effects/index.ts`), not from the package root. A
consumer importing only `@b4/react` never pays for either effect's CSS or
JS. `TextMorph` is exported from the package root because it is treated as
a core component, not an opt-in extra.

## What "architecture" does *not* mean here

There is no shared snapshot/capture pipeline, no shared WebGL context pool,
and no shared effects registry. Each effect is a self-contained component.
This is accurate as of 2026-11-19 — see [DISTORTION_WAVE.md](./DISTORTION_WAVE.md)
for where a future, heavier effect (the brief's original view-transition
`DistortionWave`) would need that kind of shared infrastructure and
currently does not have it.
