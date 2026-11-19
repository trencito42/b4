# B4 Advanced Effects

| Effect | Package path | Kind | Doc |
|---|---|---|---|
| `TextMorph` | `packages/react/src/components/TextMorph` (`@b4/react`) | Text/number transition | [TEXT_MORPH.md](./TEXT_MORPH.md) |
| `RefractionSweep` | `packages/react/src/effects/RefractionSweep` (`@b4/react/effects`) | Decorative surface-crossing accent | [REFRACTION_SWEEP.md](./REFRACTION_SWEEP.md) |

`TextMorph` is a first-class component exported from `@b4/react`.
`RefractionSweep` is exported from the separate `@b4/react/effects` entry
point so the base component bundle never pays for it unless a consumer
opts in — see `packages/react/src/effects/index.ts`.

## `BorderBeam` and `DistortionWave` were removed (2026-11-19)

Both were decorative, opt-in effects (`BorderBeam`: an animated border
glow; `DistortionWave`: first a CSS refraction band, later rebuilt as a
real WebGL2 dual-view transition engine). They were removed by explicit
mission-brief decision: B4's priority is one coherent, exceptionally
polished component system, not a decorative-effects engine. This is a
deliberate scope decision, not an unfinished task — do not resurrect
either effect, under these names or new ones, without the user asking
for it again. See `CHANGELOG.md` and `HANDOFF.md` for the removal record,
and `REQUIREMENTS_TRACEABILITY.md` for how this is tracked against the
original brief.

## Composing effects

See [COMPOSITION.md](./COMPOSITION.md) for how `RefractionSweep` and
`TextMorph` can be used together on the same surface without fighting
over z-index, focus, or clipping.
