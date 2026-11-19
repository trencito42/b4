# BorderBeam

`packages/react/src/effects/BorderBeam/BorderBeam.tsx` · exported from
`@b4/react/effects`.

A restrained light beam that travels the true rounded perimeter of its
child — a masked, rotating `conic-gradient` ring (two inset
`linear-gradient` mask layers composited with `mask-composite: exclude`),
not a rectangular gradient laid over the whole surface or clipped at the
corners.

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
| `tone` | `"accent" \| "success" \| "warning" \| "danger" \| "info"` | `"accent"` | Maps to an existing B4 color token — never a custom hex. |
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

- Outer `<div>` carries `children` plus a sibling `<span aria-hidden>` ring.
- The ring is pure CSS: a rotating `conic-gradient` background, masked down
  to a ring the width of `size`, rounded by `radius`, then blurred.
- No canvas, no SVG, no WebGL — this is intentionally the cheapest possible
  implementation for a *subtle, continuous, decorative* accent.

## Behavior

- **Reduced motion**: `useReducedMotion()` stops the rotation; the ring
  stays rendered as a static glow rather than disappearing, since the color
  alone can still carry meaning (e.g. an in-progress state).
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

- Pure CSS; no WebGL context, no canvas, no per-frame JS. Cost is one
  composited layer per active instance.
- Pausing off-screen via `IntersectionObserver` keeps idle/scrolled-away
  instances from costing anything.

## Tests

- `BorderBeam.test.tsx` — 7 unit tests.
- `e2e/border-beam.spec.ts` — Playwright, both themes.

## Studio

A BorderBeam Lab lives in B4 Studio's Effects Lab page
(`apps/studio/src/studio/pages/EffectsLabPage.tsx`) with live controls for
`size`, `tone`, `duration`, and `active`.
