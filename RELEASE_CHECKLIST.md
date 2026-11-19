# B4 — Release Checklist

**B4 has not been published anywhere and must not be, without explicit
user authorization.** Component inventory families A–F are VERIFIED in-repo;
Phase 8 packaging and consumer install proof are still open.

## Packaging (Phase 8 — not started)

- [ ] Confirm the real npm scope/package names to publish under (`@b4/*` is
      a local placeholder, unverified as a reserved namespace).
- [ ] `exports` maps in every package's `package.json` resolve correctly
      from a clean install in a throwaway consumer project (not just inside
      the monorepo via `workspace:*`).
- [ ] ESM build verified tree-shakeable (check a consumer bundle only pulls
      in the components it imports, not the whole library).
- [ ] SSR safety verified (components don't throw when rendered outside a
      browser — `useReducedMotion`'s `typeof window` guard is the pattern;
      every new browser-API usage needs the same guard, and this needs an
      actual SSR smoke test, not just code review).
- [ ] `.d.ts` output reviewed for a real consumer (not just "tsc didn't
      error" — open the generated declarations and check they're usable).
- [ ] CSS distribution confirmed to work without any build-step CSS tooling
      (plain `<link>`/`import "@b4/react/styles.css"` in a vanilla Vite/
      Next/CRA app).
- [ ] License file(s) added and recorded for every dependency that requires
      attribution.
- [ ] CHANGELOG.md reflects real version history, not a placeholder.

## Before any `npm publish` / `pnpm publish`

- [ ] Explicit, current-conversation authorization from the user to publish.
- [ ] Package names/scope double-confirmed with the user (not assumed from
      the placeholder).
- [ ] Dry run (`pnpm publish --dry-run`) reviewed file-by-file.

## CI

- [x] GitHub Actions workflow `.github/workflows/ci.yml` — typecheck, build,
      unit tests, Storybook build, Playwright (verify on first CI run on
      GitHub).
- [ ] Visual regression job (not started).
