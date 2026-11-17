# HANDOFF — read this first on any resume

**Last session made solid progress into Phase 2** (full details:
`PROGRESS.md`). This is a deliberate checkpoint, not a context-exhaustion
cutoff — but it's still far from the full mission (8 phases total, ~160
components in `COMPONENT_INVENTORY.md`, 16 VERIFIED).

## Immediate next action

Continue **Phase 2**. Family A still needs ButtonGroup, SplitButton, Link,
StatusBadge, Avatar, AvatarGroup, KeyboardShortcut. Family B still needs
NumberField, InputGroup, Select, Combobox, MultiSelect, Slider,
RangeSlider, DatePicker, TimePicker, ColorPicker, FileUpload. `Field`
(the shared label/hint/error wrapper — also covers the brief's separate
"FormField" entry, see `COMPONENT_INVENTORY.md`'s scope-changes log) now
exists and is used by `TextField`/`Textarea`/`PasswordField`/
`SearchField` — use it for `NumberField` too rather than inlining Base
UI's `Field` parts again. **Important gotcha if you touch `Field`**: its
label only auto-associates with a Base-UI-aware control (`Input`,
`Checkbox`, `Switch`, or your own element via `Field.Control`'s `render`
prop) — a bare native element passed as `children` does not get the
wiring for free. This was found the hard way building `Field`'s own test;
see `QUALITY_MATRIX.md`'s "A docs-accuracy catch" and don't re-break it
by "simplifying" `NumberField`'s increment/decrement buttons to sit
outside a `Field.Control`-wrapped input. After Family B's remaining
inputs: Select/Combobox (check `@base-ui/react`'s `select`/`combobox`
exports the way this session did for `toggle-group`/`checkbox`/`switch`/
`radio-group`/`field`/`input` before building from scratch — Base UI has
primitives for both).

Use `packages/react/src/components/Button/` or `SegmentedControl/` as the
structural template (see `AGENTS.md`'s checklist). Consider wiring
`useAsyncStatus` (in `@b4/motion`) into Button's `loading` prop and into
whatever form-submit pattern Family B's Field/FormField end up needing,
rather than each component re-inventing pending/success/error state.

## Things the next session needs to know that aren't obvious from the code

1. **TypeScript is pinned to 6.0.3, not latest (7.0.2).** Don't "helpfully"
   bump it — `typescript-eslint` doesn't support TS 7 yet (peer dep caps at
   `<6.1.0`). Check `npm view typescript-eslint peerDependencies` before
   ever changing this; revisit once that cap lifts.
2. **CSS and JS motion tokens are two separate files that must be changed
   together**: `packages/tokens/src/base.css` (durations/easings as CSS
   vars) and `packages/motion/src/tokens.ts` (durations/easings/springs as
   JS values for Motion-for-React). There is no build step that keeps them
   in sync automatically — this is a real gap. If you have spare capacity,
   consider generating one from the other, but don't let that block
   component work.
3. **Workspace packages must be built (`pnpm build`, not just
   `typecheck`) before a dependent package's `typecheck`/dev server can
   resolve their types** — `tsc --noEmit` alone doesn't produce `dist/`.
   If `apps/studio` or `packages/react` suddenly can't find `@b4/tokens` or
   `@b4/motion` types, this is almost certainly why. Storybook/Vite dev
   mode is the exception — it imports CSS and would import TS source
   directly if asked, so it doesn't need the dist build, but production
   builds and `tsc` do.
4. **Storybook story IDs don't slugify the way you'd guess** from the
   `title` string (punctuation like "—" and "&" collapses in non-obvious
   ways). If a Playwright test can't find a story by a guessed ID, build
   Storybook (`pnpm --filter @b4/studio run build-storybook`) and read
   `apps/studio/storybook-static/index.json` for the real ID.
5. **Never `import "./Component.css"` inside a component's `.tsx` file in
   `packages/react`.** This package has no CSS-import loader configured for
   its `tsc`/`tsup` build (unlike `apps/studio`, which has `vite/client`
   types and Vite's CSS handling) — it broke `tsc --noEmit` immediately
   when tried while building `TextTransition`. Every component's CSS is
   registered exactly once, via `@import` in `packages/react/src/
   styles.css` — follow that pattern for any new component, don't import
   CSS from the component file itself.
6. **jsdom has no `window.matchMedia`.** It's polyfilled in
   `packages/react/src/test/setup.ts`. Any new test-setup file (a new
   package with its own Vitest config) needs the same polyfill or any
   component calling `useReducedMotion()` will throw in tests.
7. **Color tokens that work as "white text on this fill" and "this color as
   text on the dark canvas" are not automatically the same safe value** on
   the Graphite (dark) theme, because the two reference backgrounds (white
   button-fill text vs. dark canvas) are different colors — the ratio that
   clears 4.5:1 against one can fail against the other. This is why
   `--b4-danger-text` and `--b4-accent-text` exist alongside `--b4-danger`/
   `--b4-accent` — building `Badge` and testing it in Porcelain (not just
   Graphite, which every earlier component had settled for) found a real
   2.68:1 failure on Graphite's accent text and two borderline Porcelain
   failures (danger, info) that hand-calculated sRGB math didn't reliably
   predict — only the real Playwright + axe-core run did. **Every new
   component that puts a status/accent color behind text (not a solid
   white-text fill) should be e2e-tested in both themes before being
   marked VERIFIED** — see `e2e/badge.spec.ts` for the pattern
   (`&globals=b4Theme:porcelain` in the iframe URL). Button/SegmentedControl/
   TextTransition/NumberTransition were only ever checked in Graphite —
   revisiting them with the same both-themes e2e pattern is good, cheap
   follow-up work.
8. **Git**: a local repo exists with Phase 0 committed. **Do not add the
   GitHub remote or push yet.** A sibling session
   (`local_7e987ca8-a1a8-4f5b-ae73-edd712e66288`) first asked for a push
   after the first commit, then explicitly corrected that to: wait until
   the *entire* mission is done (all 8 phases, or a genuine stopping
   blocker), then run:
   ```
   git branch -M main
   git remote add origin https://github.com/trencito42/b4.git
   git push -u origin main
   ```
   If that push is ever rejected or the remote already has history, stop
   and report back — don't force-push.

9. **Playwright's default worker count can flake against the shared
   Storybook dev server** ("Execution context was destroyed, most likely
   because of a navigation" from `AxeBuilder.analyze()`), purely from
   resource contention, not a real bug. `playwright.config.ts` caps
   `workers: 4` for this reason — don't remove that cap without reason,
   and if tests flake anyway, rerun once before assuming a regression.

## Known gaps to eventually close (not blockers, just don't forget)

- No CI workflow yet (`RELEASE_CHECKLIST.md`).
- No visual regression testing yet.
- The Porcelain-theme axe check for Button only exists as a manual WCAG
  calculation, not a Playwright run with the theme toolbar switched —
  see `QUALITY_MATRIX.md`'s "known gaps."
- `apps/studio`'s Vite app shell is a one-screen placeholder, not the real
  B4 Studio (nav, category browser, configurator, 3 integration
  showcases) — that's explicitly Phase 6, not a Phase 0 shortfall.
