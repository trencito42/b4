# B4 — Architectural decisions

| ID | Decision | Rationale | Date |
|---|---|---|---|
| ADR-001 | `@base-ui/react` for headless behavior | Avoid reinventing ARIA/focus for overlays, menus, selects. B4 owns tokens, motion, and visuals. | 2026-11-17 |
| ADR-002 | `motion` (Motion for React) for animation | Springs, layout, `AnimatePresence` — centralized in `@b4/motion`. | 2026-11-17 |
| ADR-003 | CSS custom properties, no Tailwind in library | Consumers get portable compiled CSS; tokens in `@b4/tokens`. | 2026-11-17 |
| ADR-004 | TypeScript 6.0.3, not TS 7 | `typescript-eslint` peer cap `<6.1.0`; no programmatic TS API on TS 7 yet. | 2026-11-17 |
| ADR-005 | Storybook + Vite Studio app | Storybook for per-component docs; `apps/studio` for product shell and showcases. | 2026-11-19 |
| ADR-006 | DataTable sort controlled; DataGrid sorts internally | Table only sees rendered cells; grid has `getValue` accessors. | 2026-11-19 |
| ADR-007 | QueryEditor: textarea + token layer | Preserves native editing/IME; real scanner for SQL subset diagnostics. | 2026-11-19 |
| ADR-008 | Playwright webServer uses local `storybook.cmd` | `pnpm` not guaranteed on PATH in all agent/CI shells. | 2026-11-19 |