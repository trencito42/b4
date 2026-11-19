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

Each render computes `tokenizeText(value, mode, locale)` and diffs it
against the previous token list (`diffTokens`) to classify every token as
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
- On value change, a `useLayoutEffect`-driven FLIP pass:
  1. animates the container's width/height between old and new measured
     rect (fluid layout adaptation — the box doesn't jump-cut size),
  2. for each surviving token, inverts its position delta and animates it
     back to `(0,0)` via the chosen spring,
  3. for each entering token, fades/scales/blurs it in,
  4. for each exiting token, renders it in an absolutely-positioned overlay
     at its last measured rect and fades/scales/blurs it out, then unmounts
     it once its animation resolves.
- All animations for a given update share one spring config and run via
  `motion/react`'s `animate()`, tracked in a `Set` so a new value arriving
  mid-animation cleanly stops every in-flight animation before starting
  the next diff (interruption-safe, not "animations pile up").

## Behavior

- **Rapid updates / interruption**: a new `value` during an in-flight
  morph stops all active animations for the previous diff before
  re-diffing against the latest committed token list — no visible fighting
  between two overlapping morphs.
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
- `e2e` — 4 Playwright tests.

## Studio

A `TextMorphLabPage` in B4 Studio provides 6 benchmark cards covering word
reordering, numeric place-value changes, insertions/deletions, and rapid
interrupted updates.
