# REQUIREMENTS_TRACEABILITY.md

Maps the master continuation brief's 16 sections to what actually exists in
this repository, as of **2026-11-19, commit `038ce2d` on `main`**, with a
second, concurrent session ("minimax") actively editing ~44 files at the
same time this document was written (see `git log`/`git status` for the
current state — this snapshot will drift quickly).

Status values: **DONE** (built + has test evidence), **IN PROGRESS**
(actively being worked, not yet landed), **PARTIAL** (something real
exists but doesn't meet the brief's full requirement), **NOT STARTED**,
**CLAIMED** (another doc asserts DONE; this session did not independently
re-verify it — see the note under each).

This document does not re-run the project's test suite to re-verify every
existing claim; where it defers to `COMPONENT_INVENTORY.md`/
`QUALITY_MATRIX.md`, that is marked CLAIMED, not DONE, per `AGENTS.md`'s
rule against restating unverified claims as fact.

## §0 — Current project status

DONE (informational). Last inspected HEAD stated in the brief
(`0536a44…`) is stale — `main` has since advanced through `54ce6a2`
(DistortionWave + Effects Lab), `90e6fa6`, `4289018` (this session's CI
fix) and `038ce2d` (this session's effects docs), with further
uncommitted work from the concurrent session on top. Always re-check
`git log`/`git status` rather than trusting any cached HEAD value,
including this document's.

## §1 — Original vision

NOT TRACKED AS A DELIVERABLE. Directional only; see `ART_DIRECTION.md`,
`DESIGN_PRINCIPLES.md`.

## §2 — Preserve previous requirements / this document

DONE (this file). `AGENTS.md`, `ARCHITECTURE.md`, `ART_DIRECTION.md`,
`DESIGN_PRINCIPLES.md`, `GUI.md`, `MOTION_SPEC.md`, `ADAPTIVE_UX_SPEC.md`,
`COMPONENT_INVENTORY.md`, `QUALITY_MATRIX.md`, `CRAFTMANSHIP_AUDIT.md`,
`PROGRESS.md`, `HANDOFF.md`, `TESTING.md` all exist and were read before
writing this file.

## §3 — Restore a healthy foundation (clean-checkout CI)

**DONE** for the one specific, previously-diagnosed failure: `main`
(`4289018`) now tracks `apps/studio/public/.gitkeep` so a fresh clone has
the directory Storybook's `staticDirs: ["../public"]` expects. This was
not run end-to-end against an actual fresh `git clone` in this session
(would require a full `pnpm install` + build in an isolated checkout,
which was skipped for time) — the root cause (empty untracked directory)
was confirmed directly (`git check-ignore` exit 2, directory absent from
`git ls-files`), so the fix is well-founded but not re-verified by a real
clean-clone CI run from this session.

**NOT INDEPENDENTLY VERIFIED**: whether `pnpm typecheck` / the full
Vitest suite / `pnpm --filter @b4/studio run build-storybook` /
`npx playwright test` currently pass on `main`, given the concurrent
session has ~44 files mid-edit as of this writing. Do not trust any
"all green" claim until that session's work lands and the gate is re-run.

**CRAFTMANSHIP_AUDIT.md** (42 blockers / 217 warnings, per the brief) is
being actively edited by the concurrent session right now — this document
does not restate its current contents since they are mid-change.

## §4 — Complete all existing components (individual audit, cross-family
coherence, real visual QA)

**IN PROGRESS**, by the concurrent session, not this one. Its uncommitted
diff (as of this writing) touches ~35 component `.tsx` files across
Families A–F (Avatar, Badge, Spinner, Skeleton, Stat, Timeline, etc.) plus
`CRAFTMANSHIP_AUDIT.md`, `QUALITY_MATRIX.md`, `PROGRESS.md`. This session
did not open or re-verify those edits — avoid duplicating this work; check
`git log`/`git status` before touching any of the files listed there.

**CLAIMED** (not independently re-verified here): `COMPONENT_INVENTORY.md`
marks all ~83 public components **VERIFIED**. Per `AGENTS.md`'s own rule
("don't mark VERIFIED based on compiling or looking right"), a future
session should re-run the real `TESTING.md` checks rather than trust this
table at face value, especially for any component currently being touched
by the concurrent audit pass.

**NOT STARTED** in this repository (as far as this session found):
dedicated visual-comparison pages (Button vs. Select vs. TextField, etc.)
and a captured screenshot matrix at the six specified viewport widths ×
two themes × interaction states. No `docs/visual-qa/` or equivalent
artifact directory exists yet.

## §5 — Standard component foundation completeness

**CLAIMED DONE** per `COMPONENT_INVENTORY.md`'s Families A–F (actions,
forms, navigation, overlays) and layout primitives implied by `AppShell`/
`Sidebar`/`ResizablePanels`. This session did not independently audit
Base UI vs. B4-wrapper necessity for each primitive listed in the brief
(`ScrollArea`, `Separator`, `AspectRatio`, `Container`, `Stack`, `Grid`,
`VisuallyHidden`, `FocusScope`, `Portal`, `Collapsible`) — a future session
should grep `packages/react/src/components/` for each name explicitly
rather than assume coverage from the family tables above.

## §6 — Adaptive UX & mobile quality

**CLAIMED DONE**, largely per `HANDOFF.md`'s "Interaction Primitive
Hardening" log (`usePointerSelection`, `useGestureIntent`,
`useSwipeNavigation`, `usePressFeedback`, `AppShell` mobile architecture) —
real hooks exist at the paths named there. Device-level verification
("physical mobile devices where available") is explicitly **NOT DONE**;
`HANDOFF.md` does not claim otherwise either.

## §7 — Finish TextMorph

**DONE.** `docs/effects/TEXT_MORPH.md` (this session, `038ce2d`) documents
the actual implementation read from `packages/react/src/components/
TextMorph/`. Engine supports Unicode grapheme segmentation, word/character/
numeric modes, FLIP spatial continuity, interruption-safe animation
stopping, and reduced motion. See that doc for the full API and the one
real limitation (`mode="auto"`'s heuristic isn't independently
configurable).

## §8 — Finish BorderBeam

**DONE.** `docs/effects/BORDER_BEAM.md` (this session, `038ce2d`)
documents the actual CSS mask-XOR ring implementation, its geometry
presets, reduced-motion/off-screen behavior, and a Studio Effects Lab
(`apps/studio/src/studio/pages/EffectsLabPage.tsx`).

## §9 — Build genuine first-party DistortionWave

**PARTIAL — this is the most significant gap found in this repository.**
A `DistortionWave` exists (`packages/react/src/effects/DistortionWave/`,
committed `54ce6a2`) but it is **not** the effect the brief specifies. The
brief asks for a view-transition system: two real React views, DOM
snapshot capture (SVG `foreignObject` + Canvas2D), WebGL2 shader-based
lens distortion with chromatic aberration and particles, and an imperative
`revealed`/`revealedContent`/`overlay`/`source`/`capture` API with
`play()/reverse()/reset()/prepare()`.

What's actually built is a smaller, different thing: a single-surface
decorative `backdrop-filter` sweep, architecturally a sibling of
`BorderBeam`. It has no second view, no snapshot pipeline, no WebGL
context, and no imperative API. This is documented in full, including the
explicit prop-by-prop gap list, in `docs/effects/DISTORTION_WAVE.md`
(this session, `038ce2d`). §15 acceptance criterion 11 ("DistortionWave is
genuinely implemented, not approximated by a CSS ripple") is **not met**
by the current implementation — it is, by the brief's own definition, a
CSS-based effect rather than a DOM-view transition.

Whether the concurrent session's in-flight work addresses this is
**unknown** — its uncommitted diff does not currently touch
`packages/react/src/effects/DistortionWave/`.

## §10 — Advanced effects compose together

**NOT STARTED.** No demo combining `BorderBeam` + `DistortionWave` +
`TextMorph` on one confirmation-card flow exists.
`apps/studio/src/studio/pages/EffectsLabPage.tsx` has separate,
side-by-side labs for `BorderBeam` and `DistortionWave` only — it does
not render `TextMorph` and has no reverse/reset confirmation-flow
narrative. See `docs/effects/COMPOSITION.md` (this session) for
composition guidance and a verification checklist for whoever builds it.

## §11 — Tailwind compatibility decision

**PARTIAL.** `examples/minimal-consumer/` exists as a consumer fixture
(pre-dates this session). Whether it specifically exercises Tailwind
interop (style order, specificity, dynamic variants) was not verified in
this session — read `examples/minimal-consumer/` directly before trusting
either "it's covered" or "it's not."

## §12 — Three complete showcase pages

**NOT MET as specified.** The brief requires three pages reachable through
B4 Studio's own navigation under something like "Applications"/
"Showcases," built exclusively with `@b4/react` components. What exists
instead are two **separate standalone consumer-fixture apps** outside
Studio: `examples/ops-console/` (an operations console using `AppShell`,
`DataTable`-adjacent components, `CommandPalette`, etc. — functionally
close to Brief Page 1) and `examples/storefront/` (cart/filter/product
card composition). Neither is wired into B4 Studio's navigation, and
neither was confirmed in this session to actually run (`pnpm install` /
`vite build` were not executed here). **No page corresponding to Brief
Page 2 ("Account & Workspace Settings") or Brief Page 3 ("Premium
Checkout/Confirmation Experience" using `BorderBeam`+`DistortionWave`+
`TextMorph` together) was found anywhere in the repository.**

## §13 — Visual review of the complete library

**NOT STARTED**, same finding as §4: no dedicated Visual QA environment,
no captured screenshot matrix.

## §14 — Documentation completeness

**PARTIAL.** This session added `docs/effects/{README,ARCHITECTURE,
TEXT_MORPH,BORDER_BEAM,DISTORTION_WAVE,COMPOSITION,PERFORMANCE,
ACCESSIBILITY,TESTING}.md` and this file. `REQUIREMENTS_TRACEABILITY.md`
(this file) now exists per the brief's explicit ask. `COMPONENT_INVENTORY.md`,
`QUALITY_MATRIX.md`, `ADAPTIVE_UX_SPEC.md`, `MOTION_SPEC.md`, `HANDOFF.md`
all exist already (several are being actively updated by the concurrent
session right now).

## §15 — Acceptance criteria

Per-criterion read against this document's own findings above:

| # | Criterion | Status |
|---|---|---|
| 1 | Builds cleanly from fresh clone | Known blocker fixed (§3); not re-verified end-to-end |
| 2 | CI genuinely green | Unknown — concurrent edits in flight |
| 3 | Original requirements accounted for | This document |
| 4 | Component inventory individually reviewed | In progress (concurrent session), not this session's work |
| 5 | Missing standard foundations implemented | Claimed, not independently re-audited |
| 6 | Graphite/Porcelain consistent quality | Claimed per QUALITY_MATRIX.md, not re-verified |
| 7 | Mobile/desktop excellent | Claimed, device-level testing explicitly not done |
| 8 | Interaction/motion bugs resolved | Claimed per HANDOFF.md log |
| 9 | TextMorph refined + documented | **DONE** |
| 10 | BorderBeam refined + documented | **DONE** |
| 11 | DistortionWave genuinely implemented (not a CSS ripple) | **NOT MET** — see §9 |
| 12 | Effects have browser demos + docs | Labs exist for BorderBeam/DistortionWave in Studio; docs done; no composed demo (§10) |
| 13 | Three app pages implemented, fully interactive | **NOT MET** — see §12 |
| 14 | Pages use B4 public components, not lookalikes | N/A — pages don't exist as specified |
| 15 | Screenshots reviewed at representative widths | **NOT MET** |
| 16 | Motion reviewed in video/frames | **NOT MET** |
| 17 | No component incorrectly labeled VERIFIED without evidence | Risk — COMPONENT_INVENTORY.md's blanket VERIFIED claims were not re-audited this session |
| 18 | Remaining limitations explicitly listed | This document + per-effect docs |
| 19 | Concise accurate handoff for next session | `HANDOFF.md` exists but is being actively rewritten by the concurrent session as of this writing — re-read it fresh before trusting it |

**Overall: the milestone is not finished.** The two largest concrete gaps
are §9 (DistortionWave is the wrong kind of effect) and §12 (no showcase
pages exist as specified — only two unrelated standalone example apps).

## §16 — Execution rules / stage status

- Stage A (CI fix + requirements reconciliation): **this session's work**,
  partially done (§3, this file).
- Stage B–C (foundations, component review): **in progress**, owned by
  the concurrent session right now.
- Stage D (TextMorph/BorderBeam docs + labs): **done** for docs (this
  session); labs pre-existed.
- Stage E (DistortionWave real implementation): **not done** — current
  implementation is the wrong shape (§9).
- Stage F (three showcase apps): **not done** (§12).
- Stage G (final visual QA + docs verification): **not done**.

No `git push` was performed by this session.
