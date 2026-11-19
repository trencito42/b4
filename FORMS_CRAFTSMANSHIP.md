# Batch 3 forms audit

Baseline on the latest `origin/main` checkout on November 19, 2026. The mechanical audit counted 89 components and zero blockers. The existing forms Playwright suite passed 104 tests, including the NumberField and PasswordField motion checks previously flagged in `HANDOFF.md`. The six Forms Review screenshots were inspected in Graphite and Porcelain at 390, 768, and 1440 px.

| Component | Baseline finding |
| --- | --- |
| Field | The shared label and message styles are already reused. Custom children must opt into Base UI's labeling and validation wiring. Long labels and messages lack an explicit wrap policy. |
| TextField | Border-box geometry was two pixels taller than Select at the same nominal size. Long content needs a shrinkable field. |
| PasswordField | A pointer reveal steals focus from the editable input. Changing `type` can reset the selection in Chromium. The existing motion tests cover the icon, node identity and value. |
| SearchField | The clear icon collapses inside the padded 16 px button. Its desktop hit area is smaller than the other inline actions. |
| NumberField | The baseline reproduced neither the historical step nor animation failure. The browser suite had a click test, with no hold-to-bound or release check. |
| Textarea | Shares the text recipe. The resizable input can be narrower than its wrapper and does not use the entire multiline surface. |
| Checkbox | Controlled mixed/check animation already exists. Hover applies on touch and the label has no press feedback outside the checkbox itself. A browser check recorded two click events for one Space press after a tap because Base UI treated the native button as a non-native target. |
| Switch | Thumb travel already exists. Hover applies on touch and the label has no press feedback outside the switch itself. |
| RadioGroup | Controlled selection travels. The item has no row-level press treatment, and long unbroken descriptions can escape the row. |
| Select | Real Base UI trigger and popup. The trigger and popup styles have no coarse-pointer minimum and hover can stick on touch. |
| Combobox | Keyboard search, loading, disabled options and highlighted-option scrolling passed baseline. The input group lacks an open-state fill, and its coarse-pointer action sizes can leave insufficient space for text. |
| MultiSelect | Shares Select's geometry and coarse-pointer gaps. The summary stays bounded by a count after two selections. |
| Slider | Baseline covers native focus and basic dragging. During touch over the thumb, `touch-action: none` also prevents vertical page scrolling. |
| RangeSlider | An array passed to `Slider` renders multiple thumbs under the same Base UI root. The same touch issue applies. |
| DatePicker | The trigger uses button typography, has no popup affordance, and is not associated with the visible label or error. Keyboard opening focused the previous-month button. After navigating several months via the header, the grid can have no day in the tab order. |
| TimePicker | The AM/PM control overlaps the next column at 768 and 1440 px. The paired numeric controls need to wrap together, and disabled segments retain the normal input text color. |
| ColorPicker | Uses a different trigger radius and focus treatment. Controlled updates can leave stale hex text, grayscale loses the chosen hue, and pointer moves can update the color without a gesture starting in the area. |
| FileUpload | The transparent native input hides keyboard focus. A rejected replacement in single-file mode clears a valid file. Rejection text and filenames need long-content handling. |

## Browser review

The [Forms Review story](packages/react/src/FormsReview.stories.tsx) puts all 18 entries on the same canvas and includes both single and range Slider. The [Playwright checks](e2e/forms-review.spec.ts) compare the single-line control heights and corner radii, check each cell for overflow, and capture the same canvas in both themes at 390, 768, and 1440 px. The baseline and revised screenshots were inspected at all six theme and width combinations. The revised images show the search clear affordance, matching DatePicker and ColorPicker triggers, and the TimePicker meridiem control wrapping within its column.

At 390 px with a coarse pointer, the Select touch target and option rows measure at least 44 px once the spring settles. The test scrolls to the last option, taps it, and checks the selected value and closed popup. The DatePicker originally extended 23 px below the viewport in this test. Both picker surfaces now use the available portal height and scroll internally when needed. Open Select, DatePicker, and ColorPicker screenshots were inspected in both themes.

The range test moves the minimum thumb through four intermediate touch coordinates and checks both the value and rendered thumb position before release, then checks the fill width and unchanged maximum. A vertical swipe starting on the thumb scrolls the page and preserves the selected value. The NumberField test measures hold-to-repeat, release, quarter-step keyboard precision, and both bounds. The PasswordField test verifies that pointer reveal preserves the focused input and its selection. Tests also cover DatePicker header-to-grid keyboard focus and preserving the valid FileUpload selection after a rejected replacement.

ColorPicker's saturation and brightness plane previews the color during a drag and emits the accepted hex on release. Escape clears the preview without changing the value. The hue persists through gray or black, and the hex editor follows external controlled updates while open. The trigger now includes the field label in its accessible name, as does DatePicker. DatePicker uses an optional `Popover.initialFocus` prop to focus the selected day on keyboard open. Existing prop signatures remain compatible.

Supplemental browser checks in both themes covered editable fields and inline actions, controlled Checkbox/Switch/RadioGroup with touch followed by Space, Combobox and MultiSelect touch selection, read-only Select and Combobox, and FileUpload keyboard focus and the file chooser event. Frame samples showed intermediate checkbox mark geometry and switch thumb positions in both themes. The Checkbox now hands keyboard activation for its real button to the browser, which emits one click per Space press.

Focused controlled-mode checks also verified proposed edits and retained parent values in TextField, Textarea, PasswordField, SearchField, NumberField, MultiSelect and FileUpload. NumberField displayed the new value when the owner accepted the proposed step. The standalone checks complement the uncontrolled story interactions and the library's existing controlled stories and tests.

Chromium touch emulation supplied the browser touch input. Physical devices, native mobile keyboards, and the OS file chooser UI were outside the available test environment. Success is typically represented by an accepted field value or empty error; this family does not expose a dedicated success prop. Combobox owns the explicit loading example.
