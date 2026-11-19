# B4 — Adaptive UX Specification

## Mission & Direction

B4 is an adaptive, premium web design system combining **iOS-inspired touch ergonomics, interaction continuity, and motion quality** with B4's own **sculptural Graphite and Porcelain visual identity**.

B4 is **not** an iOS clone: it does not copy proprietary Apple widgets, Liquid Glass, SF Pro typography, or iOS platform navigation chrome. Instead, it adopts the *interaction principles* that make iOS feel exceptionally crafted:
- **Immediate tactile responsiveness**: every touch target responds on contact, not on release.
- **Gesture continuity & physical believability**: indicators and surfaces travel with fluid springs, follow the finger without lag, and settle naturally.
- **Adaptive layout ergonomics**: interfaces adapt their interaction model between coarse pointer / small viewports (phones) and fine pointer / high-density displays (desktops).
- **Graceful cancellation**: gestures can always be cancelled or interrupted without stuck states or unintended commits.

---

## 1. Touch Targets & Pointer Ergonomics

### The 44px Rule for Coarse Pointers
On touchscreens and devices reporting `@media (pointer: coarse)`:
- All interactive targets (buttons, toggles, menu items, table action icons, tabs, segments) must have an effective hit area of at least **44 × 44 CSS pixels**, even if their visible geometry is smaller (e.g. an 18px checkbox or a 16px slider thumb uses invisible pseudo-element padding `::after` with `min-width: 44px; min-height: 44px;`).
- On fine pointer devices (`@media (pointer: fine)`), components preserve desktop density (`--b4-control-height`, default 36px–40px, or 32px in compact mode).

### Pointer Hover vs. Tap Distinctions
- Never rely on hover to reveal primary actions or critical status information.
- Wrap `:hover` CSS styles inside `@media (hover: hover) and (pointer: fine)` to avoid sticky hover artifacts on iOS Safari and touch browsers.
- Active states (`:active`, `data-active`, `data-pressed`) must be immediate on pointer down.

---

## 2. Dynamic Viewports & Safe Areas

### Viewport Height Units
- Use dynamic viewport units (`100dvh` for full-screen modals, drawers, and mobile AppShell views; `100svh` for fixed chrome) rather than legacy `100vh`, which is obscured by the dynamic iOS Safari address/tab bar.

### Safe Area Insets
All fixed or anchored components (`Toast`, `Drawer`, `Sheet`, `AppShell`, `CommandPalette`, `Dialog`) must respect device safe areas:
```css
padding-top: max(var(--b4-space-4), env(safe-area-inset-top));
padding-bottom: max(var(--b4-space-4), env(safe-area-inset-bottom));
padding-left: max(var(--b4-space-4), env(safe-area-inset-left));
padding-right: max(var(--b4-space-4), env(safe-area-inset-right));
```

---

## 3. Gesture Intent & Axis Locking

### Touch-Slop Threshold (8px Rule)
- Direct touch tracking must not fight native browser vertical scrolling.
- When an interactive component supports horizontal gestures (e.g. `SegmentedControl` scrubbing, `Tabs` swipe navigation, `Drawer` swipe-to-dismiss), it must use `useGestureIntent`:
  - Movements `< 8px` are treated as potential taps.
  - If horizontal displacement `|dx| > |dy|` and `|dx| >= 8px`, horizontal gesture intent is locked. The event calls `e.preventDefault()` / uses `touch-action: pan-y` to lock out vertical scrolling for the duration of that touch.
  - If vertical displacement `|dy| > |dx|`, horizontal gesture tracking aborts immediately and yields 100% to native browser vertical scrolling.

---

## 4. Preview vs. Committed State

Components that allow pointer dragging or scrubbing (`SegmentedControl`, `Slider`, `ColorPicker`, `Tabs` swipe):
1. **Initial Touch**: highlights current element and prepares gesture tracking.
2. **Dragging / Scrubbing**: updates the **preview state** in real time (`displayValue`). Visual indicators follow the finger smoothly.
3. **Commit on Release**: the selection commits to application state (`onValueChange`) only when the pointer is released over a valid, non-disabled target.
4. **Cancellation**: if the gesture is cancelled (e.g. pointer leaves window, phone call arrives, Escape pressed, or dragged outside bounds), the component reverts smoothly to its initial committed state using `springs.snap` or `springs.travel`.
5. **Single Callback Guarantee**: rapid scrubbing across multiple options must **never** fire duplicate callbacks or intermediate commits.

---

## 5. Adaptive Overlay Presentations

Overlays adapt to the screen size and pointer type:

| Component | Desktop (`> 768px`, Fine Pointer) | Mobile (`<= 768px`, Coarse Pointer) |
|---|---|---|
| **Dialog / AlertDialog** | Centered floating modal with backdrop | Bottom-anchored or full-width sheet with safe-area padding |
| **Drawer / Sheet** | Side sheet or floating drawer | Bottom sheet with drag-handle and swipe-to-dismiss |
| **DropdownMenu / ContextMenu** | Anchored floating popover | Anchored floating popover (with min 44px row heights) |
| **Select / Combobox** | Anchored dropdown list | Anchored dropdown with max-height constrained to safe viewport |
| **Popover / HoverCard** | Hover/click anchored card | Tap-activated modal popover; HoverCard requires explicit tap |

---

## 6. AppShell & Adaptive Layouts

- **Desktop (`>= 1024px`)**: permanent collapsible sidebar navigation, multi-column dashboard layouts.
- **Tablet (`768px – 1023px`)**: compact icon-only or collapsible sidebar.
- **Mobile (`< 768px`)**:
  - The sidebar collapses into an off-canvas slide-over drawer triggered by a header hamburger menu.
  - Header remains fixed at the top with `env(safe-area-inset-top)`.
  - Main content scrolls smoothly with rubber-banding, zero horizontal overflow (`overflow-x: hidden`).
  - Never render fixed 240px sidebars on mobile screens.

---

## 7. Motion Choreography & Spring Physics

Motion in B4 explains causality and physical state:
- **`springs.snap`** (`stiffness: 400, damping: 30`): in-place tactile feedback, button presses, switch toggles, checkbox checks.
- **`springs.travel`** (`stiffness: 350, damping: 35`): physical surface travel between coordinates (SegmentedControl capsule, Tabs active bar).
- **`springs.settle`** (`stiffness: 260, damping: 28`): surfaces opening, drawer/sheet dismissals, dialog entrances.
- **`springs.gentle`** (`stiffness: 180, damping: 24`): ambient or background layout changes.

### Reduced Motion Guarantee
When `useReducedMotion()` is active or `data-b4-motion="reduced"` is set:
- Traveling indicators jump instantly (`duration: 0`).
- Overlays crossfade with simple opacity instead of scale/slide transforms.
- Gestures still track 1:1 with the finger during scrub, but settle instantly upon release.

---

## 8. Accessibility & Alternative Inputs

Every adaptive gesture must have an equivalent keyboard and screen-reader interaction:
- `SegmentedControl`: ArrowLeft/ArrowRight moves selection; Space/Enter commits.
- `Tabs`: ArrowLeft/ArrowRight roves tab focus; Enter activates.
- `Drawer` / `Sheet` / `Dialog`: Escape dismisses; focus is trapped while open and restored to trigger on close.
- `Switch`: Space/Enter toggles state.
- `Slider`: ArrowLeft/ArrowRight steps value; Home/End jumps to min/max.
