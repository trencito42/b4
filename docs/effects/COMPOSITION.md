# Composing B4's advanced effects

`RefractionSweep` and `TextMorph` are built to be independent and safely
composable. A real composed demo exists in the repository: B4 Studio's
Confirmation showcase (`apps/studio/src/studio/pages/ShowcaseCheckoutPage.tsx`)
— a review-to-success payment flow using `RefractionSweep` on success and
`TextMorph`/`NumberTransition` for the status/amount.

## Why they don't conflict

- **`RefractionSweep`'s layer is `aria-hidden`, `pointer-events: none`,
  and absolutely positioned relative to its own wrapper** — it is never
  in the tab order or the hit-testing path.
- **It doesn't affect layout.** The wrapper sizes to its child.
- **`TextMorph` doesn't touch z-index or overlay layers at all** — it
  only affects its own text content's internal token spans, so it has
  nothing to conflict with the effect.
- **Each owns independent state**: own `IntersectionObserver` (effect),
  own FLIP measurement (`TextMorph`). Nothing is global or singleton.

## Known composition pattern

```tsx
import { RefractionSweep } from "@b4/react/effects";
import { TextMorph, Button, Card } from "@b4/react";

function ConfirmationCard() {
  const [status, setStatus] = useState<"review" | "pending" | "done">("review");

  return (
    <RefractionSweep active={status === "done"} amplitude="sm" direction="horizontal" tone="success">
      <Card radius="var(--b4-surface-radius)">
        <TextMorph value={status === "done" ? "Sent" : "Review"} mode="words" />
        {/* ...amount via NumberTransition, Button with its own async
            pending state driving `status`... */}
      </Card>
    </RefractionSweep>
  );
}
```

## What to verify when composing

1. Toggling the effect on/off doesn't cause a layout shift (the wrapper
   is purely additive).
2. No duplicated focus ring or duplicated accessible name from the
   `aria-hidden` wrapper `<div>`.
3. Reduced motion disables the effect and the end state is still correct
   and legible.
4. Reverse/reset correctly re-triggers the effect rather than leaving it
   in a stale visual state.

See [PERFORMANCE.md](./PERFORMANCE.md) and
[ACCESSIBILITY.md](./ACCESSIBILITY.md) for the general per-effect
guidance referenced above, and [TESTING.md](./TESTING.md) for how this
effect is currently covered.

## `BorderBeam` and `DistortionWave` were removed (2026-11-19)

This document previously covered composing all three effects together.
`BorderBeam` and `DistortionWave` were removed by explicit mission-brief
decision — see `docs/effects/README.md`. Not a gap to fill back in.
