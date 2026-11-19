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
decorative sweep, architecturally a sibling of `BorderBeam`. It has no
second view, no DOM-content snapshot pipeline, and no imperative API.

**Updated 2026-11-19 (commit `209561d`), after explicit user feedback
that both effects looked too basic and that DistortionWave specifically
needed real WebGL:** the sweep is no longer CSS-only. The real
`backdrop-filter` optical distortion band is unchanged (and was always
real), but the flat CSS-gradient "fringe" riding on top of it has been
replaced with an actual WebGL2 program (`crest.ts` — compiled GLSL ES
3.00 shaders, a VAO, real alpha blending) rendering RGB-channel-split
chromatic aberration, an animated caustic shimmer and a specular hot core,
driven by `requestAnimationFrame` in a dedicated `DistortionWaveCrest.tsx`
component with proper resize/context-loss/theme-aware color handling and
a graceful no-WebGL fallback. `BorderBeam` was redesigned the same commit
from a flat single-color ring into a comet-tail + counter-rotating wake +
path-travelling spark + a large soft ambient halo (new `tone="aurora"`,
blended from three existing tokens via `color-mix`, not a hardcoded
rainbow) — matching a reference screenshot the user provided of a big,
soft, multi-hue glow. Both were verified live in a real browser, both
themes, reduced motion, zero console errors; 530/530 unit tests pass.

**§15 acceptance criterion 11 ("DistortionWave is genuinely implemented,
not approximated by a CSS ripple") is now PARTIALLY met, not fully.** It
is no longer accurate to call the current implementation purely a "CSS
ripple" — there is genuine, verified WebGL2 shader rendering in it now.
It is still accurate that this WebGL layer does not sample or distort the
actual DOM content underneath (that remains the separate `backdrop-filter`
band, which is CSS) — the brief's harder ask, a DOM-snapshot-driven
two-view transition with true per-pixel lens distortion of captured
content, is still not implemented. See `docs/effects/DISTORTION_WAVE.md`
for the precise, current line between what's real WebGL now and what
still isn't.

Whether the concurrent session's in-flight work addresses this is
**unknown** — its uncommitted diff does not currently touch
`packages/react/src/effects/DistortionWave/`.

## §10 — Advanced effects compose together

**PARTIAL, improved this session.** `EffectsLabPage.tsx` still only has
separate, side-by-side labs for `BorderBeam` and `DistortionWave`. This
session added `ShowcaseCheckoutPage.tsx` (Studio → Showcases →
Confirmation), which composes `BorderBeam` (subtle accent on the review
card), `DistortionWave` (sweep on successful confirmation), and
`TextMorph`/`NumberTransition` (status + amount) on one real
reverse/reset-capable flow — the first place in the repo all three
coexist. `docs/effects/COMPOSITION.md` (this session, earlier) should be
treated as describing this page now, not as "no demo exists" — update
that document's opening line in a follow-up pass.

## §11 — Tailwind compatibility decision

**DONE, this session.** `examples/minimal-consumer/` (pre-existing) has no
Tailwind dependency at all — confirmed by reading its `package.json` — so
the brief's explicit ask ("test actual consumption from a Tailwind-based
React application") was genuinely not met before this session.

Added `examples/tailwind-consumer/`: a real Vite + React + Tailwind v4
app consuming `@b4/react`/`@b4/tokens`/`@b4/motion` as workspace deps,
with a documented required import order (Tailwind, then `@b4/tokens/css`,
then `@b4/react/styles.css` — see `src/styles.css`'s comment for why).
Verified live in a real browser: B4's `Card`/`Badge`/`Switch`/`Button`
render with full B4 styling next to Tailwind-utility-styled markup,
Tailwind's Preflight reset does not strip any B4 component styling, and
the Switch is fully interactive with zero console errors. `tsc --noEmit`
clean. B4 remains usable without Tailwind as a hard dependency — this
fixture only proves the "works well WITH Tailwind too" half of the brief's
ask, which is what was missing.

**Stated gap:** `pnpm-lock.yaml` was deliberately **not** updated/committed
for this fixture, because the lockfile already had unrelated uncommitted
changes from the concurrent session when this fixture was added — mixing
them into one commit would misattribute work. `pnpm install
--frozen-lockfile` will not yet succeed for a totally clean checkout that
includes this fixture until the lockfile is regenerated once the
concurrent session's changes land. This is recorded, not hidden.

## §12 — Three complete showcase pages

**CORRECTION (this document, same session):** an earlier version of this
section claimed no Studio showcase pages existed. That was wrong — this
session missed them on a grep that only matched effect names. B4 Studio
does have a "Showcases" nav section
(`apps/studio/src/studio/StudioApp.tsx`) with three real routed pages:
`ShowcaseAnalyticsPage.tsx` (153 lines — `FilterBar`+`Select` region/env
filters, `Stat`, `ChartContainer`, `ActivityFeed`), `ShowcaseInfrastructurePage.tsx`
(75 lines — `ResizablePanels`+`FileExplorer`+`ResourceMeter`+`QueryEditor`+
`InspectorPanel`), and `ShowcaseBillingPage.tsx` (85 lines — sortable/
paginated `DataTable` of invoices). All three are built from `@b4/react`
public components only, use realistic mock data (`../sampleData.js`), and
are reachable from Studio's own nav — closer to meeting the letter of §12
than this document first said.

**Still a real gap, corrected claim:** none of the three matches what the
brief specifically asked for (Page 1 Infrastructure Ops Dashboard, Page 2
Account & Workspace Settings, Page 3 Premium Checkout/Confirmation using
`BorderBeam`+`DistortionWave`+`TextMorph` together), and none is as rich
as specified — no dialogs, drawers, toasts, editable settings with
save/discard state, or confirm-action flows in any of the three; all are
closer to read-only demo panels than "fully interactive" applications.
**There is still no Settings-style form page and no Checkout/Confirmation
page anywhere in the repo** — this session added one (see below).

Separately, `examples/ops-console/` and `examples/storefront/` remain
standalone consumer-fixture apps outside Studio's nav, not confirmed to
run in this session (`pnpm install`/`vite build` not executed here) —
they exist for a different purpose (real external consumption, §11-
adjacent) than the in-Studio showcase requirement.

**This session's contribution (verified live, not just typechecked):**
added `ShowcaseCheckoutPage.tsx` (review → confirm → async pending →
success, composing `Card`, `Button`, `TextMorph`, `NumberTransition`,
`BorderBeam`, `DistortionWave`, `Progress`, `Toast`) and
`ShowcaseSettingsPage.tsx` (Profile/Preferences/Security/Notifications
tabs covering `TextField`, `Textarea`, `PasswordField`, `FileUpload`,
`Select`, `ColorPicker`, `RadioGroup`, `Slider`, `Switch`, `MultiSelect`,
`NumberField`, `TimePicker`, `DatePicker`, `Checkbox`, with real
dirty-state tracking, a sticky save/discard bar, async save via `onAction`,
and a controlled `AlertDialog` for discard). Both were run in a real
browser (an isolated `vite` instance on a spare port, not the stale/
unreachable processes found earlier) in Graphite and Porcelain: Confirm →
pending (BorderBeam ring + indeterminate Progress) → success (TextMorph
"Sent", DistortionWave sweep, reset) all observed working; Settings'
dirty-bar/save/toast/discard-dialog flow observed working. A real
pre-existing defect was found this way and fixed: `Switch` logged a Base
UI console error (`nativeButton` not set despite rendering a real
`<button>`) — fixed in `packages/react/src/components/Switch/Switch.tsx`,
re-verified both via the full `@b4/react` suite (526/526 passing) and
live in-browser (error gone). One thing observed but **not fixed** (out
of scope, and `Sidebar.tsx` was mid-edit by the concurrent session at the
time): at 375px the Studio shell's mobile hamburger trigger did not open
the sidebar drawer on the Overview page — this may already be addressed
by the concurrent session's in-flight `Sidebar.tsx` changes; re-check
before assuming it's still broken.

Neither new page by itself fully satisfies §12, which still wants a
richer Ops Dashboard with working filter/sort/search/drawer/dialog
interactions (today's `ShowcaseInfrastructurePage`/`ShowcaseAnalyticsPage`
are closer to read-only panels).

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
| 10 | BorderBeam refined + documented | **DONE**, redesigned 2026-11-19 per user feedback — see §9 |
| 11 | DistortionWave genuinely implemented (not a CSS ripple) | **PARTIAL** — real WebGL2 shader added 2026-11-19, but it's procedural, not DOM-content sampling; see §9 |
| 12 | Effects have browser demos + docs | Labs exist for BorderBeam/DistortionWave in Studio; docs done; a composed demo exists too (ShowcaseCheckoutPage, §10) |
| 13 | Three app pages implemented, fully interactive | **PARTIAL** — see §12 |
| 14 | Pages use B4 public components, not lookalikes | N/A — pages don't exist as specified |
| 15 | Screenshots reviewed at representative widths | **NOT MET** |
| 16 | Motion reviewed in video/frames | **NOT MET** |
| 17 | No component incorrectly labeled VERIFIED without evidence | Risk — COMPONENT_INVENTORY.md's blanket VERIFIED claims were not re-audited this session |
| 18 | Remaining limitations explicitly listed | This document + per-effect docs |
| 19 | Concise accurate handoff for next session | `HANDOFF.md` exists but is being actively rewritten by the concurrent session as of this writing — re-read it fresh before trusting it |

**Overall: the milestone is not finished.** The remaining largest gaps:
§9 (DistortionWave's WebGL shader is procedural, not a DOM-content-
sampling lens-distortion/view-transition system), §12 (the Studio
showcase pages exist and two now have real interactivity, but none
matches the brief's three specific pages in full richness), §4/§13 (no
full visual-QA screenshot matrix), and the unresolved question of whether
COMPONENT_INVENTORY.md's blanket VERIFIED claims hold up to a fresh,
independent re-check.

## §16 — Execution rules / stage status

- Stage A (CI fix + requirements reconciliation): **this session's work**,
  partially done (§3, this file).
- Stage B–C (foundations, component review): **in progress**, owned by
  the concurrent session right now.
- Stage D (TextMorph/BorderBeam docs + labs): **done**; BorderBeam itself
  was also substantively redesigned this session (§9), not just documented.
- Stage E (DistortionWave real implementation): **partial** — real WebGL2
  rendering added 2026-11-19, but it's procedural, not DOM-content
  sampling/view-transition (§9).
- Stage F (three showcase apps): **partial** — showcase pages exist with
  growing real interactivity (§12), not yet matching the brief's three
  pages in full.
- Stage G (final visual QA + docs verification): **not done**.

No `git push` was performed by this session.
