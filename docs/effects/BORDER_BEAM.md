# BorderBeam

`packages/react/src/effects/BorderBeam/BorderBeam.tsx` · exported from
`@b4/react/effects`.

A light beam that travels the true rounded perimeter of its child — a
masked, rotating `conic-gradient` ring (two inset `linear-gradient` mask
layers composited with `mask-composite: exclude`), not a rectangular
gradient laid over the whole surface or clipped at the corners — plus a
large, soft ambient halo blooming behind the card. Four layers compose the
full effect (see "Rendering architecture"): a comet-tail ring, a dimmer
counter-rotating wake, a point spark travelling the exact border path, and
the halo. Redesigned 2026-11-19 from a single flat-color ring after
explicit feedback that it read as too basic/not "glowy."

## API

```tsx
import { BorderBeam } from "@b4/react/effects";

<BorderBeam tone="accent" size="sm" duration={6}>
  <Card>...</Card>
</BorderBeam>
```

| Prop | Type | Default | Notes |
|---|---|---|---|
| `children` | `ReactNode` | — | The surface the beam traces. |
| `active` | `boolean` | `true` | Mounts/unmounts the beam entirely when `false`. |
| `size` | `"sm" \| "md" \| "lg"` | `"sm"` | Controls beam thickness, mask clip width, and blur together (see geometry table below). |
| `tone` | `"accent" \| "success" \| "warning" \| "danger" \| "info" \| "aurora"` | `"accent"` | Maps to an existing B4 color token — never a custom hex. `"aurora"` is special: the ring/spark stay accent-colored, but the ambient halo blends three existing tokens (`--b4-accent-500`, `--b4-danger`, `--b4-warning`) into a multi-hue glow instead of one flat color — still only existing tokens through `color-mix`, never a hardcoded rainbow. |
| `duration` | `number` (seconds) | `6` | Full revolution time. |
| `radius` | `string` (CSS length) | `var(--b4-surface-radius)` | **Must match the radius of the wrapped child.** If the child has a different border-radius than the default token, pass the same value here or the beam and the child's edge visibly disagree. |
| `className` | `string` | — | Forwarded to the outer wrapper. |

There is no `onFinish`, imperative ref, or variant prop beyond the table
above — the effect is continuous (it loops), not a one-shot transition, so
it has no lifecycle to report back.

## Geometry presets

| `size` | beam width | mask clip | blur |
|---|---|---|---|
| `sm` | 1.5px | 6px | 3px |
| `md` | 2.5px | 9px | 4.5px |
| `lg` | 4px | 13px | 6px |

The mask clip is deliberately wider than the nominal beam width so the
blurred light has room to diffuse instead of being cut off against a hard
edge — this is what keeps the beam reading as a soft glow rather than a
visible solid ring (an earlier version was too solid/hard-edged; this was
corrected per explicit visual feedback, see `HANDOFF.md`).

## Rendering architecture

Still pure CSS — no canvas, no SVG, no WebGL — but now four layered
pieces instead of one flat ring:

- **Halo** (`.b4-border-beam__halo`): a large, heavily blurred (`blur(46px)`)
  radial-gradient block positioned with a deliberately negative `inset`
  (`-65%`) so it blooms well past the card's own edges, at `z-index: -1`
  behind `children` (the component sets `isolation: isolate` on its own
  root so that negative z-index stays contained to this component rather
  than falling behind unrelated page content). This is the big ambient
  glow — the "glowy" half of the effect. In `tone="aurora"` it's three
  overlapping radial gradients (different tokens, different positions)
  instead of one.
- **Comet ring** (`.b4-border-beam__gradient`): the original masked,
  rotating `conic-gradient` ring, now a comet rather than a flat arc — a
  white-hot head (`--b4-text-on-accent`, the same token every accent-filled
  control already uses) cooling through the beam's tone color into a long
  fading tail, instead of uniform brightness all the way around.
- **Wake** (`.b4-border-beam__gradient--wake`): a second, dimmer,
  larger-blur conic gradient rotating in the opposite direction at a
  different speed (`duration × 1.35`, reversed) so the ring never reads as
  one bright dash chasing an empty gap.
- **Spark** (`.b4-border-beam__spark`): a small radial-gradient dot
  travelling the card's exact rounded-rect perimeter via CSS `offset-path:
  inset(0 round <radius>)` and an animated `offset-distance`, duration-
  synced with (but a structurally independent technique from) the conic
  gradient's own rotation.

The halo and the ring+wake+spark group are siblings, not nested — the
ring's `mask-composite: exclude` clips its *entire subtree* to a thin
border band, so the halo (meant to bloom far past the card's edges) has to
live outside that masked element, not inside it.

## Behavior

- **Reduced motion**: `useReducedMotion()` stops the ring's rotation, the
  wake, the spark's travel, and the halo's breathing pulse; the ring
  collapses to a static full-perimeter glow and the halo stays visible at
  its base opacity rather than disappearing — the color alone can still
  carry meaning (e.g. an in-progress state).
- **Breathing halo**: while spinning, the halo pulses slowly (`4s
  ease-in-out infinite alternate`, scale 0.97→1.03, opacity 0.45→0.75) —
  tied to the same `spinning` state as the ring, not a separate toggle.
- **Off-screen pausing**: an `IntersectionObserver` on the container stops
  the spin class when the element scrolls out of view, resuming when it
  re-enters.
- **No pointer interception**: the ring is `pointer-events: none` and
  `aria-hidden`, so it never blocks clicks or gets announced.
- **No layout shift**: the ring is absolutely positioned relative to the
  wrapper; it never affects the wrapper's box size.
- **Multiple instances**: each `BorderBeam` owns its own
  `IntersectionObserver` and CSS animation; instances do not share state,
  so multiple beams on a page are independent and safe.

## Use cases

- A pending/processing card (paired with an async `Button` state).
- A "live" or "selected" indicator on a panel without adding a persistent
  solid border that fights the card's own border token.
- A subtle accent on a confirmation surface (see
  [COMPOSITION.md](./COMPOSITION.md)).

## Anti-patterns

- Don't use it as the *only* indicator of a state — it's decorative and
  `aria-hidden`; pair it with a real status via text, `StatusBadge`, etc.
- Don't nest multiple `BorderBeam`s inside each other on the same card —
  pick one owner of the perimeter accent.
- Don't pass a `radius` that doesn't match the child's own visible corner
  radius — the beam will visibly clip against a differently-rounded edge.

## Accessibility

- `aria-hidden="true"`, `pointer-events: none`.
- Respects `prefers-reduced-motion` via `@b4/motion`'s `useReducedMotion()`.
- Carries no semantic meaning on its own; never use it as a substitute for
  a real accessible status.

## Compatibility / performance

- Pure CSS; no WebGL context, no canvas, no per-frame JS. Cost is now four
  composited/blurred layers per active instance instead of one — the
  halo's `blur(46px)` over a large negative-inset box is the most
  expensive of the four; no measured frame-time numbers are recorded yet
  (see `docs/effects/PERFORMANCE.md`).
- Pausing off-screen via `IntersectionObserver` keeps idle/scrolled-away
  instances from costing anything (stops the ring/wake/spark animations
  and the halo's breathing pulse together, via the shared `spinning`
  state).

## Tests

- `BorderBeam.test.tsx` — 9 unit tests (includes the halo/aurora/wake/
  spark additions).
- `e2e/border-beam.spec.ts` — Playwright, both themes (not re-run against
  this redesign in this session — re-run before relying on this count).

## Studio

A BorderBeam Lab lives in B4 Studio's Effects Lab page
(`apps/studio/src/studio/pages/EffectsLabPage.tsx`) with live controls for
`size`, `tone` (including `aurora`), `duration`, and `active`.
