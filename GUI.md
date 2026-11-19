# GUI.md — visual/interaction conventions for coding agents

Companion to `AGENTS.md` (structure/process), `DESIGN_PRINCIPLES.md`
(the why), and `ADAPTIVE_UX_SPEC.md` (touch ergonomics, gesture intent, safe areas).
This file is the quick-reference for *what to actually build* when adding UI.

## Picking a variant/size vocabulary

Don't invent new variant names per component. The established vocabulary
(from `Button`, to be extended as more components land):

- **Variants**: `primary` (the one emphasized action), `secondary` (default
  neutral action), `ghost` (lowest emphasis, transparent until hover),
  `destructive` (irreversible/dangerous). A component that doesn't need all
  four should still use a subset of *these names*, not synonyms.
- **Sizes**: `sm` / `md` / `lg`. Independent of the density token axis —
  size is an explicit per-instance choice, density is a global user/app
  setting. Don't conflate them.

## States every interactive component needs to visibly support

hover, focus (`:focus-visible` with the token focus ring — never remove the
outline without replacing it), active/pressed, selected (where applicable —
use `--b4-control-bg-selected`, a real fill change, not just a color
change), loading (where the action is async), disabled. Missing any of these
is an incomplete component, not a "nice to have."

## Motion — which preset, when

See `MOTION_SPEC.md`'s table. Quick version: in-place feedback → `snap`.
Something physically moves/travels → `travel`. A whole surface opens/closes
→ `settle`. Ambient/low-urgency → `gentle`. Always gate on
`useReducedMotion()` from `@b4/motion`.

## Layout

- Controls: height from `--b4-control-height(-sm|-lg)`, horizontal padding
  from `--b4-control-padding-x`, internal gaps from `--b4-control-gap`.
  These already respond to the density axis — don't hardcode pixel values
  that duplicate them.
- Radius: `--b4-control-radius` for controls, `--b4-surface-radius` for
  cards/panels/surfaces. Don't pick an arbitrary radius value per
  component.

## Composing a page with B4 components (for the eventual Studio showcases)

Wrap the app root in a themed element with `data-b4-theme="graphite"` (or
`"porcelain"`) — see `apps/studio/index.html` and `.storybook/preview.tsx`
for the pattern — then import both `@b4/tokens/css` and
`@b4/react/styles.css` once at the app root. Components read tokens from
the nearest themed ancestor; there's no per-component theme prop.

## What NOT to do

- Don't reach for inline `style={{ background: "#..." }}` — if a token
  doesn't cover the case, add the token (see `AGENTS.md`).
- Don't build a "simpler version" of an existing component inline instead
  of extending the real one, even for a one-off page — see
  `COMPONENT_INVENTORY.md`/`AGENTS.md` on reuse.
- Don't skip the loading/disabled/focus states "because this instance
  probably won't need them" — that's exactly how a design system
  fragments.
