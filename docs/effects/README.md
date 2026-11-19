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
`DistortionWave` as committed is a single-surface decorative accent, in the
same family as `BorderBeam` (decorative overlay, `aria-hidden`, no DOM
swap, no snapshot/capture pipeline). It does not transition between two
views and has no `revealed`/`source`/`capture` API.

As of 2026-11-19 it **does** include real WebGL2 rendering (added after
explicit feedback that the first CSS-only version read as too basic): a
`backdrop-filter` band genuinely distorts the real content behind it, and
a GLSL ES 3.00 shader running in an actual `<canvas>` renders the
chromatic-aberration/caustic-shimmer/specular crest riding on top of that
band — not a flat CSS gradient standing in for one. `BorderBeam` was
upgraded the same day from a thin uniform ring to a comet-tail gradient
plus a path-travelling spark plus a large soft multi-hue ambient halo
(`tone="aurora"`, blended from existing B4 tokens via `color-mix`, not a
hardcoded rainbow). Neither upgrade implements the brief's harder ask —
DOM-content snapshot capture and a two-view transition system — see each
effect's own doc for the precise, current gap list.

Do not treat this README or the per-effect docs as claiming the original
WebGL *view-transition* `DistortionWave` (the snapshot/two-view system)
exists. It does not, as of this writing (2026-11-19). What changed today
is that the single-surface decorative effects now use real WebGL
rendering where they didn't before — a real quality upgrade, not the
harder, separate view-transition feature.

## Composing effects

See [COMPOSITION.md](./COMPOSITION.md) for how `BorderBeam`,
`DistortionWave` and `TextMorph` can be used together on the same surface
without fighting over z-index, focus, or clipping.
