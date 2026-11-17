# Changelog

B4 has not been published; this tracks real, meaningful repo milestones, not
a per-npm-release history.

## Unreleased

- Switch now uses shared spring travel between layout-defined thumb positions,
  including RTL, instead of a physical CSS translateX. Added neutral selection
  surfaces, snap press feedback, control ref and shared hit target. Seven focused
  tests and code/build checks passed; both-theme manual browser evidence is in
  HANDOFF.md. Full current browser regression remains pending.

- Checkbox uses neutral B4 selection surfaces, animated check drawing/mixed
  morph and snap press feedback, with instant reduced-motion changes. Added
  control ref forwarding, shared hit-target sizing, state overview and Select
  all stories. Focused Checkbox tests 9/9 and code/build checks passed; visual
  browser verification of this revision remains pending.

- Field's dropdown stories now reuse B4 Select (including its shared popup
  motion) instead of inline-styled native selects. Existing story links remain
  valid; docs explain that Select already includes Field.

### Family B interaction refinement

- Shared matte input surfaces and animated focus feedback. NumberField now
  animates accepted steps without replacing its editable input; PasswordField
  transitions the visibility glyph using the existing IconButton/TextTransition.
- RadioGroup adds a traveling selected row, animated radio dot and optional
  item descriptions. AnimatedIndicator supports an optional span render target.
- React 124/124 and motion 5/5 tests, typecheck, package and Storybook builds
  passed. Both-theme manual motion/responsive/axe evidence is recorded in
  HANDOFF.md; automated browser regression remains pending.

### Added

- Select (IMPLEMENTED; browser/visual verification pending): shared Field +
  Base UI selection, three sizes, descriptions, controlled values, form
  submission, null reset, read-only/disabled/error/empty states, settle-spring
  popup, 14 unit tests and 10 stories. See QUALITY_MATRIX.md for exact evidence.

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
- `@b4/react`: `IconButton`, `ToggleButton`, `Badge` (Family A). Badge is
  the first component e2e-tested in both Graphite and Porcelain, which
  found 3 more real contrast bugs (see Fixed, below).
- `@b4/react`: `Checkbox`, `Switch`, `RadioGroup` (Family B), built on
  Base UI primitives for real tri-state/keyboard/ARIA behavior. All
  e2e-tested in both themes from the start.
- `@b4/react`: `TextField` (Family B), built on Base UI's `Field` + `Input`
  — the base text-entry pattern for the rest of Family B's text fields.
- `@b4/react`: `Textarea`, `PasswordField`, `SearchField` (Family B),
  extending TextField's pattern.
- `@b4/react`: `Field` (Family B) — the shared label/hint/error wrapper,
  extracted from `TextField`/`Textarea`/`PasswordField`/`SearchField`.
  Also absorbs the brief's separate "FormField" entry (same component).
- `@b4/react`: `NumberField` (Family B), built on Base UI's full
  `NumberField` for real min/max clamping and stepper buttons.
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
- Graphite's `--b4-accent` used as Badge's accent-tone text measured
  2.68:1 (needs 4.5:1) against its own tint background — fixed by adding
  `--b4-accent-text`. Porcelain's `--b4-danger`/`--b4-info` were
  borderline (4.05–4.48:1) as Badge text on their own tints — fixed by
  darkening `--b4-danger` and tuning both tint percentages. All three
  found by testing Badge in both themes with real axe-core, not by eye or
  hand-calculated contrast math.
- `SearchField`'s clear button updated its own tracking state but never
  actually reset the underlying (uncontrolled) input's value — caught by
  its own unit test, fixed by always passing one fully-computed value to
  the underlying `Input` instead of mixing `value`/`defaultValue`.

### Corrective verification checkpoint

- Fixed Slider's double translation, native-input focus styling and extra
  Motion keyboard stop; added sizes, neutral/accent variants, range labels,
  formatted announcements, error/form support and responsive stories.
- Added Combobox using stable IDs and shared option-surface motion/styles.
- Fixed shared invalid-state semantics, disabled search/password actions,
  focus after search clear, explicit CSS reduced motion and token literals.
- Added modifier toolbars and aligned single-line fields with control-radius.
- Reclassified touched components as IMPLEMENTED until full browser checks
  are rerun. AUDIT_REPORT.md distinguishes real browser evidence from tests
  blocked by the environment; the overall plan remains unfinished.
