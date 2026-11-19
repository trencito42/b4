# TextMorph

`packages/react/src/components/TextMorph/TextMorph.tsx` · exported from
`@b4/react` (not the `/effects` entry — this is a first-class component,
not an opt-in decorative extra).

Reference inspiration: https://torph.lochie.me/ (interaction quality, not
code — B4's implementation is original).

A text/number display that morphs its visible content between successive
`value`s instead of swapping it: surviving characters/words travel to their
new position (FLIP), entering content fades/blurs in, exiting content
fades/blurs out in an absolutely-positioned overlay so it doesn't affect
layout of what remains.

## API

```tsx
import { TextMorph } from "@b4/react";

<TextMorph value={balance} mode="numbers" spring="travel" as="span" />
```

| Prop | Type | Default | Notes |
|---|---|---|---|
| `value` | `string \| number` | — | The content to display and morph toward. |
| `mode` | `"auto" \| "words" \| "characters" \| "numbers"` | `"auto"` | Segmentation/matching granularity — see below. |
| `spring` | `SpringToken` (`@b4/motion`) | `"travel"` | B4 spring preset: `"travel"`, `"snap"`, `"settle"`, or `"gentle"`. |
| `locale` | `string` | — | Passed to `Intl.Segmenter` / numeric formatting. |
| `as` | `"span" \| "div" \| "p" \| "h1"–"h6"` | `"span"` | Root element tag. |
| `className` | `string` | — | Forwarded to the root. |
| `style` | `CSSProperties` | — | Forwarded to the root. |
| `aria-label` | `string` | the stringified `value` | Override only if the visible text isn't the right accessible label. |

### `mode`

- `"auto"` — resolves per-value via `resolveEffectiveMode()`: numeric
  strings use digit place-value matching, everything else uses word-level
  segmentation (falls through to character-level for very short words —
  see `engine.ts`).
- `"words"` — `Intl.Segmenter`-based word/punctuation tokens.
- `"characters"` — Unicode grapheme-cluster tokens (`segmentGraphemes`),
  correct for combining marks, emoji, and Romanian diacritics as single
  clusters rather than splitting on UTF-16 code units.
- `"numbers"` — digit place-value aware (`segmentNumeric`): place values
  morph in place rather than the whole number crossfading.

## Matching behavior

When the value, mode, or locale changes, `tokenizeText(value, mode, locale)`
and `diffTokens` compare the new tokens with the previous list to classify each token as
surviving (same id, possibly moved), entering, or exiting — an
identity/affinity match, not a naive index comparison, so reordering,
duplicate words, insertions and deletions each get the animation that
matches what actually changed rather than a full crossfade.

## Rendering / layout architecture

- Visual tokens render in normal flow inside the root element, each in its
  own `<span aria-hidden>` keyed by a stable token id.
- A visually-hidden `<span>` holds the full, unbroken string for screen
  readers (`b4-text-morph__sr-only`) — the per-token spans are all
  `aria-hidden`, so assistive tech reads one coherent value, never
  per-token fragments mid-animation.
- The layout pass snapshots the outgoing frame before updating its tokens,
  measures the incoming frame at its natural size, and then starts motion.
- An inner sizing box interpolates width and height. The incoming text
  keeps its measured line layout during that interpolation.
- Surviving tokens follow the selected spring from their rendered position.
  Words that exchange places on the same line pass on opposite sides of
  the baseline. Entering and exiting tokens use short opacity and vertical
  position tweens. The outgoing layer clears when its tween ends while the
  surviving tokens continue settling.

## Behavior

- **Rapid updates / interruption**: a new value starts from the positions
  and opacity of the current painted frame. Cleanup stops the old animations
  and removes their inline styles before measuring the new target layout.
- **Reduced motion**: `useReducedMotion()` skips the animated path
  entirely and snaps token/container rects to their final measured state
  with zero duration; exiting tokens are cleared immediately rather than
  fading.
- **Stable layout**: the container's own width/height is animated to the
  new content's measured size rather than reflowing instantly, so
  surrounding layout doesn't jump when morphed text changes length.
- **Numeric place-value morphing**: digits are segmented so the "tens"
  place animates independently of the "ones" place, etc., rather than the
  whole number re-rendering as one token.

## Integration

- `TextTransition` and `NumberTransition` both support a backwards
  compatible `mode="morph"` that delegates to this engine (see their own
  component files) — prefer that over swapping a `TextTransition` for a
  raw `TextMorph` if the surrounding component already standardizes on
  `TextTransition`'s API.
- Do not wrap arbitrary static/informational text in `TextMorph` — it
  exists for values that actually change at runtime (counters, statuses,
  labels bound to live state), not as a drop-in replacement for `<span>`.

## Accessibility

- Single accessible value via the visually-hidden span; per-token spans
  are `aria-hidden` so assistive tech never reads fragments mid-transition.
- Respects `prefers-reduced-motion`.

## Performance

- FLIP measurement happens only on actual `value`/`mode` changes (not
  every render), gated behind the `useLayoutEffect` diff.
- Animation count scales with the number of changed tokens, not the full
  string length — an unchanged prefix/suffix produces no animated nodes
  beyond their (possible) position delta.

## Known limitations

- `mode="auto"`'s heuristic (numeric vs. word vs. character) is a fixed
  rule set in `resolveEffectiveMode()`, not configurable per call beyond
  picking an explicit `mode`.
- No built-in debouncing — morphing on every keystroke-driven `value`
  change is the caller's choice and cost to manage.

## Tests

- `engine.test.ts` — 13 engine unit tests (segmentation, diffing, matching).
- `TextMorph.test.tsx` — 6 component unit tests.
- `e2e/text-morph.spec.ts` — 7 browser tests, including frame-by-frame
  checks for line stability and word crossings, and a rapid-interruption
  check for the character story.

The line stability and word crossing checks reproduced the defects in the
previous Storybook build. After the fix, the release gate and the full
Playwright suite passed (453 tests). Reduced motion was checked at 390 px in
Graphite and Porcelain.

## Studio

A `TextMorphLabPage` in B4 Studio provides 6 benchmark cards covering word
reordering, numeric place-value changes, insertions/deletions, and rapid
interrupted updates.
