# AGENTS.md — for coding agents working in B4

Read `PROGRESS.md`, `HANDOFF.md`, and `ADAPTIVE_UX_SPEC.md` first. This file is about *how* to work
in this repo, not what's done. B4 adheres to iOS-inspired interaction ergonomics and continuity
while maintaining its distinctive Graphite and Porcelain aesthetic.

## The one rule that matters most: reuse, don't recreate

Before writing a new component, check `COMPONENT_INVENTORY.md` and
`packages/react/src/components/`. If something close exists, compose/extend
it. If a pattern (variant/size prop naming, motion preset choice, CSS class
naming `b4-<component>--<modifier>`) exists on `Button`, copy the pattern,
don't invent a new one. The mission is a *system* — components that each
solved their own naming/structure problem independently is exactly the
failure mode to avoid.

## Where things live

- `packages/tokens` — CSS custom properties, two themes (`graphite`/
  `porcelain`), five modifier axes (`theme`/`density`/`radius`/`contrast`/
  `motion`) via `data-b4-*` attributes. **Never hardcode a color/spacing/
  radius value in a component** — read the token. If the token you need
  doesn't exist, add it here first (and justify it in a comment, per
  `DESIGN_PRINCIPLES.md`), don't improvise inline.
- `packages/motion` — `durations`/`easings`/`springs` constants,
  `useReducedMotion()`. Every animated component imports from here, picks
  the spring preset that matches the *category* of motion (see
  `MOTION_SPEC.md`'s table), and checks `useReducedMotion()` before
  animating.
- `packages/react` — the actual component library. One directory per
  component under `src/components/<Name>/`: `<Name>.tsx`, `<Name>.css`,
  `<Name>.stories.tsx`, `<Name>.test.tsx`. Register the CSS in
  `src/styles.css` (`@import`) and the export in `src/index.ts`.
- `apps/studio` — Storybook (primary docs surface right now) + a minimal
  Vite shell (placeholder until Phase 6).

## Building a new component — the checklist

Copy `packages/react/src/components/Button/` as the template. Specifically:

1. Component file: `forwardRef`, variant/size props following existing
   naming, reads tokens via CSS custom properties, reads `@b4/motion` for
   any animation, respects `useReducedMotion()`.
2. CSS file: class names `b4-<component>`, `b4-<component>--<variant>`,
   `b4-<component>--<size>`. No hardcoded colors/spacing — `var(--b4-*)`
   only.
3. `.stories.tsx`: `tags: ["autodocs"]`, a control per variant prop, an
   "all variants" and/or "all sizes" overview story, a do/don't comment
   where there's a real misuse risk.
4. `.test.tsx`: render + label, controlled click, disabled blocks
   interaction, keyboard activation if applicable, `jest-axe`
   `toHaveNoViolations()` across the variant matrix.
5. Add the CSS `@import` to `src/styles.css`, the export to `src/index.ts`.
6. Run the full check sequence from `TESTING.md` before marking it anything
   past IMPLEMENTED in `QUALITY_MATRIX.md`.
7. Update `QUALITY_MATRIX.md` (status + evidence) and
   `COMPONENT_INVENTORY.md` (status) for real — `VERIFIED` means the
   commands in `TESTING.md` were actually run and passed, not "looks done."

## Hard rules (violating these is the exact failure mode the mission brief
calls out)

- No Blipmade-specific import, API client, env var, or brand reference,
  ever, anywhere in this repo.
- No component ships styled independently of the token system "because it
  was faster."
- No component is marked VERIFIED based on compiling or "looking right" in
  one theme. Both themes, the real checks in `TESTING.md`.
- Don't silently drop or water down a component from
  `COMPONENT_INVENTORY.md`. If scope genuinely needs to change, log it in
  that file's "Scope changes log" with a reason.
- Don't invent test results or mark `PROGRESS.md`/`QUALITY_MATRIX.md`
  further along than what was actually run. If you're out of budget/context,
  stop and write `HANDOFF.md`'s next-actions honestly instead.
