# Advanced effects — testing

Follow the repository's general `TESTING.md` checklist for any change to
these components. This page records what exists specifically for the
two remaining effects, not a separate test philosophy.

## Current coverage (as of 2026-11-19)

| Effect | Unit tests | E2E tests | Notes |
|---|---|---|---|
| `RefractionSweep` | 9 (`RefractionSweep.test.tsx`) | `e2e/refraction-sweep.spec.ts`, 11 tests, both themes | |
| `TextMorph` | engine (`engine.test.ts`) + component (`TextMorph.test.tsx`) | Playwright tests | Engine tests cover segmentation/diffing independent of React. |

Run the monorepo's standard gate (`pnpm typecheck`, `pnpm --filter @b4/react
run test`, `npx playwright test`) per `TESTING.md` before marking any
change to either of these VERIFIED — a passing build or a visually "looks
right" screenshot is not sufficient per `AGENTS.md`.

`BorderBeam` and `DistortionWave` (and their `e2e/border-beam.spec.ts`/
`e2e/distortion-wave.spec.ts`) were removed (2026-11-19) along with the
effects themselves — see `docs/effects/README.md`.

## What to add before trusting a future change here

- **Reduced motion**: every test file above should assert the
  reduced-motion path explicitly (snapped/static state), not just the
  animated default — check the current spec files directly rather than
  assuming coverage from this table.
- **Interruption**: `TextMorph` receiving a new `value` mid-animation is
  covered at the engine level (diff correctness) — whether a dedicated e2e
  test asserts no visual tearing under rapid interruption should be
  verified by reading `e2e/` directly, not assumed from this document.
- **Composition**: no test currently exercises more than one effect active
  at once on the same subtree — see the open work noted in
  [COMPOSITION.md](./COMPOSITION.md).

## Honesty rule

This file, like the rest of `docs/effects/`, must only claim test coverage
that was actually run and observed to pass. If a future change updates one
of these three components without re-running its suite, update this table
to reflect reality (including "unknown/stale" if the suite wasn't re-run)
rather than leaving stale pass claims in place.
