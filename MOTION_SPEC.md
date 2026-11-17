# B4 — Motion Spec

Source of truth for *values*: `packages/motion/src/tokens.ts` (JS/Motion-for-
React) and `packages/tokens/src/base.css` (CSS custom properties for
transition/animation declared in plain CSS). **Keep them in sync** — if you
change a spring's stiffness/damping or a duration, change both files and say
so in the commit message. There is currently no automated check that they
agree; that's a real gap, tracked in `HANDOFF.md`.

## Duration scale

| Token | Value | Use |
|---|---|---|
| `instant` | 80ms | Micro-feedback: color/opacity swaps on press. |
| `fast` | 140ms | Hover, focus-ring, small color transitions. |
| `base` | 220ms | Default for most tween transitions (menus, tooltips opening). |
| `slow` | 360ms | Larger surfaces (dialogs, drawers, sheets). |
| `slower` | 520ms | Full-page/section transitions; used rarely. |

## Spring presets (`@b4/motion`'s `springs`)

| Preset | stiffness/damping | Use |
|---|---|---|
| `snap` | 500 / 40 | In-place state changes: hover, pressed, selection. Used by `Button`'s `whileTap`. |
| `travel` | 420 / 38 | Things that move across the layout: the segmented-control indicator (Phase 1), drag handles. |
| `settle` | 300 / 32 | Entry/exit of whole surfaces: dialogs, drawers, popovers. |
| `gentle` | 220 / 26 | Low-urgency ambient motion: skeleton shimmer, slow emphasis. |

No preset is "bouncy" (damping is always close to critical damping for its
stiffness) — B4's motion language is sculptural and precise, not playful.

## Reduced motion contract

Two independent signals, both honored:

1. **OS `prefers-reduced-motion: reduce`** — the default once set, unless
   overridden.
2. **B4's explicit `data-b4-motion` override** on the themed root
   (`"full"` forces motion on even under OS reduced-motion; `"reduced"`
   forces it off regardless of OS setting) — this is what the Studio's
   motion toggle will drive once built (Phase 6).

`@b4/motion`'s `useReducedMotion()` hook is the single source of truth every
motion-bearing component must call before choosing a spring/tween vs. an
instant, no-animation state change. `Button` already does this for
`whileTap`. CSS-only transitions get the same behavior for free via the
`@media (prefers-reduced-motion: reduce)` block in `base.css`, which zeroes
`--b4-duration-*` unless `data-b4-motion="full"` is set.

**Status: foundation only.** The reusable `TextTransition`/`NumberTransition`/
`AnimatedIndicator` primitives, layout/morph helpers, and async
state-transition utilities described in the mission brief are **Phase 1**
work and do not exist yet — see `PROGRESS.md`. This file documents the
tokens and contract they must build on, not finished components.

## Motion is semantic, not decorative — the standard for every future component

- **Selection preserves continuity** → a selected-state change moves an
  indicator (`travel` spring) rather than cutting between two static states.
- **Navigation shows spatial relationships** → directional transitions match
  the direction of navigation (e.g. forward = content enters from the
  trailing edge).
- **Confirmation shows completion** → a label→spinner→success sequence
  completes visibly rather than just disappearing.
- **Loading shows real async progress**, never a fixed decorative delay.
- **Destructive actions feel serious, not showy** — slower, no bounce,
  often paired with a confirmation step rather than motion as the "weight."
- **Data changes preserve orientation** — e.g. a sort/filter animates
  existing rows to their new position rather than cross-fading the whole
  table.
- **Expanding surfaces appear connected to their origin** — a popover/menu
  should visually originate from the control that opened it, not just fade
  in centered on screen.
