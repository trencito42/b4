# Changelog

B4 has not been published; this tracks real, meaningful repo milestones, not
a per-npm-release history.

## Unreleased

### Added

- Monorepo scaffold: pnpm workspace with `packages/tokens`, `packages/motion`,
  `packages/react`, `apps/studio`.
- `@b4/tokens`: B4 Graphite (dark) and B4 Porcelain (light) themes as plain
  CSS custom properties, plus the density/radius/contrast/motion modifier
  axes.
- `@b4/motion`: duration/easing/spring token constants and
  `useReducedMotion()`, mirroring the CSS motion tokens for Motion-for-React
  use.
- `@b4/react`: `Button` (primary/secondary/ghost/destructive × sm/md/lg,
  loading/disabled states) — the first component through the full quality
  gate (types, unit tests incl. axe, Storybook stories, Playwright + axe
  e2e).
- `@b4/react`: `SegmentedControl` (the Changelog/Login reference component
  named in the mission brief) — built on Base UI's `ToggleGroup`/`Toggle`
  for real keyboard/ARIA behavior, with a Motion `layoutId` traveling
  capsule indicator. Controlled + uncontrolled. Full quality gate passed,
  including a rapid-alternating-click check proving the indicator never
  duplicates.
- `@b4/react`: `AnimatedIndicator` (the shared traveling-surface primitive,
  extracted from SegmentedControl and now consumed by it), `TextTransition`
  (crossfade/vertical/horizontal replacement modes), `NumberTransition`
  (built on TextTransition, direction auto-derived from increase/decrease).
- `@b4/motion`: `useAsyncStatus` — a race-safe idle/pending/success/error
  async-state hook for the label→spinner→success(/error) pattern.
- B4 Studio: Storybook 10 instance (addon-a11y, addon-docs) plus a minimal
  Vite app shell.
- Full docs scaffolding (`ARCHITECTURE.md`, `DESIGN_PRINCIPLES.md`,
  `MOTION_SPEC.md`, `COMPONENT_INVENTORY.md`, `QUALITY_MATRIX.md`,
  `PROGRESS.md`, `TESTING.md`, `RELEASE_CHECKLIST.md`, `AGENTS.md`,
  `GUI.md`, `HANDOFF.md`).

### Fixed (caught by the quality gate, not by eye)

- Graphite theme's destructive-button and primary-button fills had
  insufficient white-text contrast (2.76:1 and 3.98:1) — caught by the
  Playwright + axe-core check, fixed by darkening `--b4-danger` and
  `--b4-accent-500`.
- Porcelain theme's `--b4-success` had insufficient contrast for a
  hypothetical white-on-fill use (future Toast/StatusBadge) — found by
  direct WCAG calculation while auditing the other status colors, fixed
  pre-emptively.
