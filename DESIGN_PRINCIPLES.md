# B4 — Design Principles

## Two influences, one system

- **Sculptural dark UI**: very dark graphite canvases, large confident
  typography, capsule-shaped controls, soft substantial selected surfaces
  (`--b4-control-bg-selected`, not a 1px border), active indicators that
  physically travel between options, minimal decoration.
- **Graphical Alloy craftsmanship** (inspiration only, never copied): material
  quality, surface hierarchy by lightness rather than borders/shadows,
  typographic restraint, neutral palettes, consistent geometry.

Both **B4 Graphite** (dark) and **B4 Porcelain** (light) implement the same
component behavior and the same token *names* — see `packages/tokens/src`.
A component is never "finished for dark" while Porcelain lags; the quality
gate in `QUALITY_MATRIX.md` tracks both themes as one row.

## Rules, not vibes

1. **Elevation is lightness, not borders.** `--b4-surface-1/2/3/overlay` step
   up in lightness (dark theme) or step toward white (light theme). Borders
   (`--b4-border-subtle/default/strong`) exist for separation where lightness
   alone isn't legible (e.g. adjacent same-level panels), not as the default
   way to show structure.
2. **Controls are capsules by default.** `--b4-control-radius` defaults to
   `var(--b4-radius-full)`. A control only gets a smaller radius
   (`data-b4-radius="tight"`) as an explicit, system-wide choice — never a
   one-off per component.
3. **Selection is a surface, not a checkmark.** Where a control has a
   selected/active state, it gets `--b4-control-bg-selected` (a visibly
   heavier fill) and, where there's a traveling indicator, that indicator uses
   a spring (`springs.travel` in `@b4/motion`), not a cut/instant swap.
4. **Color never carries meaning alone.** Status colors (success/warning/
   danger/info) pair with an icon or label, not just a hue — see
   `TESTING.md`'s a11y gate.
5. **Every color combination that ships is contrast-checked against its real
   adjacent surface**, not eyeballed. The Button destructive/primary variants
   had their accent/danger lightness values tuned specifically because the
   axe-core Playwright check (`e2e/button.spec.ts`) failed at the original
   values — see `ARCHITECTURE.md`'s token notes and git history for the
   before/after. This is the standard every new component is held to, not a
   one-time fix.
6. **Motion has to mean something.** See `MOTION_SPEC.md` — no decorative
   animation, no motion that fires on every component identically regardless
   of what state actually changed.
7. **Density/radius/accent/contrast/motion are orthogonal.** Changing one
   (via `data-b4-*` attributes, see `@b4/tokens`'s `applyB4ThemeSettings`)
   never requires a component to branch its logic — only its CSS custom
   property values change.

## What "generic shadcn/Tailwind-dashboard" looks like, and why B4 avoids it

- Arbitrary `rounded-md` on everything regardless of control type → B4 ties
  radius to a single axis token, and controls default to full capsules.
- Border-and-shadow-heavy cards with little tonal separation → B4 separates
  surfaces by lightness first, shadow only for things that truly lift
  (`--b4-shadow-raised`/`overlay`, used sparingly).
- Low-contrast muted gray text everywhere → `--b4-text-secondary/tertiary`
  are chosen per theme to stay legible, and `data-b4-contrast="high"`
  exists as a real, equally-maintained mode, not an afterthought.
- Identical hover/tap treatment on every element regardless of weight →
  B4's spring presets (`snap`/`travel`/`settle`/`gentle` in `@b4/motion`) are
  chosen per interaction category, not applied uniformly.
