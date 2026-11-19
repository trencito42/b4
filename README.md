# B4

A standalone, commercially distributable React + TypeScript component
library and design system. Two first-class themes — **B4 Graphite** (dark,
sculptural) and **B4 Porcelain** (light, refined) — share one component and
motion system. Built for SaaS apps, dashboards, developer tools, and hosting
panels; has no dependency on any particular consumer's APIs or branding.

**Status: component inventory complete (families A–F, all VERIFIED).** B4 Studio
Vite app (`pnpm dev:studio`, port 5173) is the product shell with theme
configurator and three integration showcases; Storybook remains the per-component
reference. See `PROGRESS.md` and `HANDOFF.md`.

## Packages

- `@b4/tokens` — design tokens (CSS custom properties), two themes, five
  modifier axes (density/radius/accent/contrast/motion).
- `@b4/motion` — motion tokens and shared Motion-for-React utilities.
- `@b4/react` — the component library.
- `@b4/studio` (`apps/studio`) — Storybook-based interactive docs/showcase.

`@b4/*` is a local placeholder scope, not a published/reserved npm
namespace. **Not published anywhere; do not publish without explicit
authorization** — see `RELEASE_CHECKLIST.md`.

## Getting started

```bash
pnpm install
pnpm --filter @b4/tokens run build
pnpm --filter @b4/motion run build
pnpm --filter @b4/react run build
pnpm storybook        # interactive component docs, http://localhost:6106
pnpm dev:studio        # B4 Studio app, http://localhost:5173
```

See `TESTING.md` for the full verification sequence (typecheck, unit
tests, Playwright + axe) and `ARCHITECTURE.md` for the version/tooling
rationale.

## Docs map

| File | What it's for |
|---|---|
| `ARCHITECTURE.md` | Tooling/version choices and why. |
| `ART_DIRECTION.md` | Graphite/Porcelain identity — follow on every new UI. |
| `DESIGN_PRINCIPLES.md` | The visual/interaction rules behind B4. |
| `DECISIONS.md` | Architectural decision log. |
| `MOTION_SPEC.md` | Motion tokens and the semantic-motion contract. |
| `COMPONENT_INVENTORY.md` | Full component scope and status. |
| `QUALITY_MATRIX.md` | Per-component quality-gate status with evidence. |
| `PROGRESS.md` | Phase-by-phase status; read on every resume. |
| `TESTING.md` | How to actually verify a component. |
| `RELEASE_CHECKLIST.md` | Packaging proofs + what's needed before npm publish. |
| `PHASE7_AUDIT.md` | Phase 7 horizontal quality audit record. |
| `CHANGELOG.md` | Real repo milestones. |
| `HANDOFF.md` | Next actions and non-obvious gotchas; read on every resume. |
| `AGENTS.md` | How a coding agent should work in this repo. |
| `GUI.md` | Visual/interaction conventions for building new components. |
