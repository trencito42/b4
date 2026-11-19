# Advanced effects — architecture overview

Two independent implementations, intentionally not sharing a runtime:

| Effect | Mechanism | Owns DOM nodes | Owns animation |
|---|---|---|---|
| `RefractionSweep` | CSS `backdrop-filter` sweep band | 1 `aria-hidden` sibling span (band + fringe) | CSS `@keyframes` (sweep), toggled by class |
| `TextMorph` | FLIP (measure → invert → play) over per-token spans | N token spans + exiting-overlay spans | `motion/react`'s imperative `animate()`, JS-driven |

`RefractionSweep` is a declarative, continuous, CSS-only decorative
overlay: no JS animation loop, no imperative API, one composited layer
while active. `TextMorph` is JS-driven because it needs per-update
measurement (`getBoundingClientRect`) to know what actually moved — a
CSS-only transition can't do a FLIP diff.

`RefractionSweep` pauses via `IntersectionObserver` rather than, e.g., a
shared visibility context — this was a deliberate simplicity choice (no
shared effects-runtime/provider to coordinate) at the cost of one
observer per instance.

## Bundle boundary

`RefractionSweep` lives under `packages/react/src/effects/` and is
exported only from the `@b4/react/effects` subpath
(`packages/react/src/effects/index.ts`), not from the package root. A
consumer importing only `@b4/react` never pays for its CSS or JS.
`TextMorph` is exported from the package root because it is treated as a
core component, not an opt-in extra.

## What "architecture" does *not* mean here

There is no shared snapshot/capture pipeline, no shared WebGL context
pool, and no shared effects registry. Each effect is a self-contained
component.

## `BorderBeam` and `DistortionWave` were removed (2026-11-19)

Both previously lived here (`BorderBeam`: an animated CSS border glow;
`DistortionWave`: first a CSS refraction band, later a real WebGL2
dual-view transition engine with its own capture/shader pipeline).
Removed by explicit mission-brief decision — see `docs/effects/README.md`
and `HANDOFF.md`. This is not a gap to fill back in.
