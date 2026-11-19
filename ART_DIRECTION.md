# B4 — Art Direction

Canonical visual identity for B4. Implementation lives in `packages/tokens`
and `packages/react`; this file is what future agents follow instead of
reinterpreting the mission brief.

## Graphite (dark)

- Canvas: near-black graphite (`--b4-surface-canvas`), not pure `#000`.
- Hierarchy: surfaces step up via lightness (`--b4-surface-1` … `overlay`).
- Controls: capsule geometry (`--b4-control-radius` → full by default),
  selected state = substantial fill (`--b4-control-bg-selected`), not a
  hairline border swap.
- Typography: confident scale for page titles; UI chrome stays restrained.
- Motion: traveling indicators use `springs.travel`; in-place press uses
  `snap`.

## Porcelain (light)

- Canvas: warm near-white, not hospital blue-white.
- Same token names and component behavior as Graphite — only theme CSS
  values change.
- Contrast is re-verified per theme (accent/danger text on tinted surfaces
  has separate tokens where one color cannot serve two directions).

## Geometry and spacing

- Density, radius, contrast, and motion are global via `data-b4-*` on a
  root element (`applyB4ThemeSettings` from `@b4/tokens`).
- Do not hardcode pixel colors or radii in components.

## Reference

Graphical Alloy (Graphical UI Forma preset) informed material quality and
restraint only — no copied assets or proprietary layouts.

Approved implementation screenshots: use Storybook + B4 Studio showcases;
no checked-in reference gallery yet (repository size / licensing).