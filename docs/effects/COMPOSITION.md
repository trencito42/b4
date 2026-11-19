# Composing B4's advanced effects

`BorderBeam`, `DistortionWave`, and `TextMorph` are built to be independent
and safely composable, but **no dedicated "all three together" demo exists
in the repository yet** (checked 2026-11-19 against `apps/studio/src/studio/
pages/EffectsLabPage.tsx`, which currently has separate, side-by-side labs
for `BorderBeam` and `DistortionWave` only — it does not render
`TextMorph`, and there is no confirmation-card/checkout composition page).
This document is composition *guidance*, not a description of a built
demo. Building that composed demo (a confirmation card: `BorderBeam` accent
+ async button + `DistortionWave` sweep on success + `TextMorph` on the
status/amount, per the mission brief's §10) is open work.

## Why they don't conflict

- **Both effects layers are `aria-hidden`, `pointer-events: none`, and
  absolutely positioned relative to their own wrapper** — stacking a
  `BorderBeam` wrapper around a `DistortionWave` wrapper (or vice versa)
  does not create a focus trap or a click-blocking layer, because neither
  layer is ever in the tab order or the hit-testing path.
- **Neither affects layout.** Both wrappers size to their child; nesting
  them doesn't change the child's box.
- **`TextMorph` doesn't touch z-index or overlay layers at all** — it only
  affects its own text content's internal token spans, so it has nothing
  to conflict with either effect.
- **Each owns independent state**: own `IntersectionObserver`, own CSS
  animation / own FLIP measurement. Nothing is global or singleton, so
  using more than one instance, or nesting effects, doesn't require
  coordination.

## Known composition pattern

```tsx
import { BorderBeam, DistortionWave } from "@b4/react/effects";
import { TextMorph, Button, Card } from "@b4/react";

function ConfirmationCard() {
  const [status, setStatus] = useState<"review" | "pending" | "done">("review");

  return (
    <BorderBeam active={status === "pending"} tone="accent" size="sm">
      <DistortionWave active={status === "done"} amplitude="sm" direction="horizontal">
        <Card radius="var(--b4-surface-radius)">
          <TextMorph value={status === "done" ? "Sent" : "Review"} mode="words" />
          {/* ...amount via NumberTransition/TextMorph, Button with its own
              async pending state driving `status`... */}
        </Card>
      </DistortionWave>
    </BorderBeam>
  );
}
```

Nesting order matters only for which wrapper's `radius` governs the
outermost clip — pass the **same** `radius` to every layer and to the
card itself so all the rounded edges agree (see each effect's own "must
match the child's radius" note).

## What to verify before calling a composed demo done

If/when the composed demo above is built, verify (not merely assume):

1. Toggling `BorderBeam` and `DistortionWave` on/off independently doesn't
   cause a layout shift (their wrappers are purely additive).
2. No duplicated focus ring or duplicated accessible name from stacking
   two `aria-hidden` wrapper `<div>`s.
3. `TextMorph`'s FLIP container-resize animation and `DistortionWave`'s
   CSS `backdrop-filter` layer don't visually fight when both animate at
   once (e.g. the blur layer briefly going stale against a resizing
   container) — inspect real frames, not just the final state.
4. Reduced motion disables all three simultaneously and the end state is
   still correct and legible.
5. Reverse/reset (toggling `status` back to `"review"`) correctly
   re-triggers `BorderBeam`/re-enters `DistortionWave` rather than leaving
   either effect in a stale visual state.

See [PERFORMANCE.md](./PERFORMANCE.md) and
[ACCESSIBILITY.md](./ACCESSIBILITY.md) for the general per-effect
guidance referenced above (where present), and [TESTING.md](./TESTING.md)
for how these effects are currently covered.
