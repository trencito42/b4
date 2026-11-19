# B4 — Release Checklist

**B4 has not been published anywhere and must not be, without explicit
user authorization.** Component inventory families A–F are VERIFIED in-repo;
Phase 8 packaging proofs are done in-repo (see `pnpm release:verify`).

## Packaging (Phase 8 — in-repo proofs done; publish still blocked)

- [ ] Confirm the real npm scope/package names to publish under (`@b4/*` is
      a local placeholder, unverified as a reserved namespace).
- [x] `exports` maps — `scripts/consumer-smoke.mjs` imports published entry
      points from built `dist/` (also in CI).
- [x] ESM tree-shake — `scripts/treeshake-check.mjs` via
      `examples/minimal-consumer/` (no DataGrid/FileExplorer/CommandPalette
      strings in bundle).
- [x] SSR smoke — `scripts/ssr-smoke.mjs` (`renderToString(Button)`).
- [x] `.d.ts` — consumer-smoke exercises typed imports from dist.
- [x] CSS distribution — consumer + Studio import `@b4/react` styles without
      extra CSS tooling.
- [x] Ops Console and Storefront exercise public package entry points in
      `pnpm consumer-fixtures-smoke`, part of the local release gate and CI.
- [x] `LICENSE` (MIT) at repo root.
- [x] `CHANGELOG.md` tracks repo milestones (not npm releases yet).

## Before any `npm publish` / `pnpm publish`

- [ ] Explicit, current-conversation authorization from the user to publish.
- [ ] Package names/scope double-confirmed with the user (not assumed from
      the placeholder).
- [ ] Dry run (`pnpm publish --dry-run`) reviewed file-by-file.

## CI

- [x] GitHub Actions workflow `.github/workflows/ci.yml` — typecheck, build,
      unit tests, Storybook build, Playwright (verify on first CI run on
      GitHub).
- [x] Visual regression specs in Playwright (`e2e/visual-regression.spec.ts`,
      snapshot baselines committed).
