# B4 corrective audit - 2026-11-17

Release readiness: NOT READY. Phase 2 is incomplete. This is a corrective
checkpoint, not the completed independent release audit or the finished plan.

## Evidence and scope

Current public exports: 20 components. All 119 React tests and 5 motion tests
passed. Workspace typecheck, package build and Storybook build passed. CLI
Playwright was attempted, but its web server failed before tests began due
to profile-settings EPERM. No new CLI e2e pass is claimed.

Browser control can access the user's running Storybook. It was used for real
screenshots, geometry, keyboard interaction and the live accessibility panel.
These checks are separate from the CLI results and do not replace the missing
full automated regression gate. Changed components remain IMPLEMENTED. Older
VERIFIED evidence on unchanged components is historical, not a fresh audit.

## Component results

| Component | Current corrective result | Remaining verification |
|---|---|---|
| Button | Replaced spinner stroke literal with matching token; full unit suite passed | Fresh theme/state/viewport browser sweep |
| IconButton | Replaced fixed dimensions and spinner stroke with matching tokens | Fresh browser matrix |
| ToggleButton | No component source change; included in passing unit suite | Fresh independent visual/motion review |
| SegmentedControl | Replaced gap, padding and height offsets with matching tokens | Fresh travel-interruption and theme/viewport checks |
| Badge | Replaced fixed height with equivalent token expression | Fresh both-theme tone matrix |
| AnimatedIndicator | No component source change; existing tests passed | Fresh motion and interruption review |
| TextTransition | No component source change; existing tests passed | Fresh entrance/exit and interruption review |
| NumberTransition | No component source change; existing tests passed | Fresh formatting, theme and motion review |
| Field | External error now sets primitive invalid state | Full browser recheck of every consumer |
| TextField | Shared stroke/geometry tokens; control-radius; responsive size story; Graphite/Porcelain screenshots at 390px reviewed | Full browser state and modifier matrix |
| Textarea | Keeps surface-radius for multiline shape; inherits Field invalid-state fix | Fresh resizing, wrapping, mobile and theme checks |
| PasswordField | Disabled visibility action no longer works; regression test added | Fresh browser state matrix |
| SearchField | Disabled clear blocked; clearing returns focus to input; two regression tests added | Fresh real-browser interaction checks |
| NumberField | Inherits shared Field invalid state and control geometry fixes | Fresh stepping/disabled/theme checks |
| Checkbox | Matching geometry and stroke tokens replace pixel literals | Fresh both-theme state matrix |
| Switch | Matching geometry/padding/travel tokens replace pixel literals | Fresh interaction and motion checks |
| RadioGroup | Matching geometry and stroke tokens replace pixel literals | Fresh arrow navigation and theme checks |
| Slider (also range) | Corrected geometry and states; actual browser evidence below | Full automated suite, pointer/touch drag, remaining modifier/device cases |
| Select | Added previously; now shares popup motion with Combobox, correct demo width and disabled description color | Full browser matrix after refactor |
| Combobox | Added stable-ID filtering, keyboard selection, clear, loading, empty/error/disabled/read-only, form and ref support | Complete automated/browser matrix and assistive-technology review |

## Defects found and fixed

- Slider applied CSS transform translate on top of Base UI's translate
  longhand. In a real screenshot the thumbs were displaced over the label.
  Removed the duplicate transform and added a geometry regression test.
- Slider's focus rule targeted the wrapper, although the native range input
  owns focus. It now styles the wrapper through :has(input:focus-visible).
- Motion whileTap made the slider wrapper an extra keyboard stop. Explicit
  tabIndex=-1 on the render target preserves the native input as the tab stop.
- Isolated Slider/Select examples shrank to intrinsic text width. Responsive
  demo widths now show the actual geometry; TextField's size example also
  fits a 320px viewport.
- Slider now has the size/variant/error/form and per-thumb label
  affordances used to exercise its states. Neutral is now the default;
  variant="primary" opts into the accent fill. Value formatting also feeds
  aria-valuetext. Range values still use the same component, as logged in
  the inventory; no duplicate RangeSlider implementation was added.
- Field.Error visibility alone did not mark the control invalid. The shared
  wrapper now forwards invalid to Base UI, benefiting all composed controls.
- Password/search auxiliary native buttons stayed active while the field
  was disabled. They now receive disabled. Search clearing restores focus.
- Explicit data-b4-motion="reduced" changed a scale variable but left CSS
  durations intact. It now zeros every duration token. Actual browser
  duration checks: reduced 0s, full 0.14s on Combobox.
- Existing component CSS still contained pixel dimensions/strokes despite
  the token-only rule. Matching values now resolve through shared tokens;
  the scan of component CSS found no remaining px or literal color matches.
- Text entry radius ignored the configured control-radius. Single-line
  controls now use that token; multiline textarea retains surface-radius.
- The original verification labels overstated the current state. Touched
  components have been reset to IMPLEMENTED pending a full browser rerun.

## Real browser evidence

Slider long-label geometry: both Graphite and Porcelain at 320, 390, 768,
1440, 1920px. No horizontal overflow, no header overlap, zero vertical error
between handle center and track center. Screenshots reviewed in Graphite,
Porcelain and compact/tight/high-contrast/reduced settings. Real Tab landed
on INPUT type=range; ArrowRight changed 40 to 41; focus ring was solid.
Storybook live axe AllVariants: 0 violations, 0 inconclusive, 19 passes in
each theme. This is not proof of every possible Slider state.

Combobox: popup fit all five widths in both themes after positioning settled.
Screenshots reviewed in both themes. Typed Roma, selected Romania from the
keyboard, closed the popup and cleared the input while preserving focus.
Navigated forty options from the input, observed the last item highlighted
inside the scrolled popup (scrollTop 1884), and selected Region 40. Repeated
four interrupted close/open cycles in explicit reduced and full motion:
exactly one popup/list remained, then exited normally.

Live axe on the open Combobox Default: 0 violations, 2 inconclusive results
in each theme. They concern a label obscured behind the modal popup and a
negative-tabindex scrolling surface. The label occlusion was inspected;
keyboard scrolling was exercised as described above. The raw inconclusive
counts are retained; no complete accessibility certification is claimed.

## First-versus-last quality comparison

The deterioration risk was real: later Slider code had a visible layout
failure which unit/axe-only checks missed. Earlier components also violated
the documented token-only rule. Therefore neither age nor an inherited
VERIFIED label is treated as proof of polish. Shared tokens, Field behavior,
popup motion and modifier controls were corrected across generations.

## Still unfinished

Most inventory components are not implemented. Studio is still a placeholder
alongside Storybook. Full visual regression, screen-reader checks, complete
device/modifier coverage, clean external consumer/package validation, CI,
licensing review and release packaging remain open. No licensed/proprietary
assets were added in this checkpoint; the repository-wide licensing audit
has not been completed. No component is claimed perfect or release-ready.

Final supplementary checks: focused ESLint and standalone TypeScript checks
for the new e2e files passed. Slider, Select and Combobox imported through
@b4/react from the Studio consumer and rendered with react-dom/server without
errors. This workspace consumer check is not a clean external install test.
Commit/push was attempted but blocked at git add by .git/index.lock permission
denial. No commit from this corrective pass was created or pushed.

## Family B motion refinement (2026-11-17, latest)

Shared FieldControl replaces the static focus treatment on text-entry controls.
It uses snap feedback without replacing native inputs. NumberField animates
accepted step changes, preserving typing/caret identity; PasswordField reuses
TextTransition on its eye glyph only. RadioGroup reuses AnimatedIndicator for
the selected row and animates its dot. Optional descriptions support richer
choices without introducing a separate component. Existing tokens and reduced
motion are retained; no new visual palette or independent motion system.

Passed commands: React 124/124, motion 5/5, typecheck, package build, Storybook
build, focused ESLint and standalone TypeScript for e2e/field-motion.spec.ts.
Actual browser evidence: 30 viewport/theme checks on the three controls with
no overflow; both-theme screenshots; intermediate numeric transform/opacity,
password icon opacity/blur and radio travel observed. Explicit reduced-motion
checks showed immediate changes. Six live Storybook accessibility scans returned
zero violations and zero inconclusive results. These scans are separate from
the CLI Playwright suite, which remains unrun for this revision. Physical touch,
IME, screen-reader and the complete shared-consumer regression remain pending.
