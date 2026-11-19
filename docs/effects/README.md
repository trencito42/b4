# B4 Advanced Effects

B4 ships three first-party advanced-motion capabilities, each independent and
opt-in — none of them run unless a component explicitly uses them.

| Effect | Package path | Kind | Doc |
|---|---|---|---|
| `TextMorph` | `packages/react/src/components/TextMorph` (`@b4/react`) | Text/number transition | [TEXT_MORPH.md](./TEXT_MORPH.md) |
| `BorderBeam` | `packages/react/src/effects/BorderBeam` (`@b4/react/effects`) | Decorative perimeter accent | [BORDER_BEAM.md](./BORDER_BEAM.md) |
| `DistortionWave` | `packages/react/src/effects/DistortionWave` (`@b4/react/effects`) | Decorative surface-crossing accent | [DISTORTION_WAVE.md](./DISTORTION_WAVE.md) |

`TextMorph` is a first-class component exported from `@b4/react`.
`BorderBeam` and `DistortionWave` are exported from the separate
`@b4/react/effects` entry point so the base component bundle never pays for
them unless a consumer opts in — see `packages/react/src/effects/index.ts`.

## Honest status vs. the original brief (read this first)

The mission brief that asked for `DistortionWave` (see repo history /
`HANDOFF.md`) specified a view-transition effect: two real React views, a
DOM/layout snapshot, SVG `foreignObject` + Canvas2D rasterization, a WebGL2
shader pass (lens distortion, chromatic aberration, particles), and an
imperative `play()/reverse()/reset()/prepare()` API accepting
`revealed`/`revealedContent`/`overlay`/`source` props to swap one rendered
view for another.

**What is actually implemented today is different and smaller in scope.**
`DistortionWave` as committed is a single-surface decorative accent: a
`backdrop-filter`-based refraction band that sweeps across one child using
CSS keyframes, in the same family as `BorderBeam` (decorative overlay,
`aria-hidden`, no DOM swap, no WebGL, no snapshot/capture pipeline). It does
not transition between two views and has no `revealed`/`source`/`capture`
API. This is recorded here rather than silently upgraded in the docs to
match the brief — see [DISTORTION_WAVE.md](./DISTORTION_WAVE.md) for the
real API and the explicit gap list.

Do not treat this README or the per-effect docs as claiming the original
WebGL view-transition `DistortionWave` exists. It does not, as of this
writing (2026-11-19).

## Composing effects

See [COMPOSITION.md](./COMPOSITION.md) for how `BorderBeam`,
`DistortionWave` and `TextMorph` can be used together on the same surface
without fighting over z-index, focus, or clipping.
