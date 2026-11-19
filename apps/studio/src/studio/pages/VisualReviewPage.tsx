import { useState } from "react";
import { PageHeader, Select } from "@b4/react";
import { STUDIO_FAMILIES } from "../catalog.js";
import type { StudioSettings } from "../settings.js";
import { storybookFrameUrl } from "../storybook.js";

const formsStory = "family-b-forms-inputs-forms-review--default";
const stories = [
  { value: formsStory, label: "Forms comparison" },
  { value: "review-component-comparison--default", label: "Cross-family comparison" },
  ...STUDIO_FAMILIES.flatMap((family) =>
    family.components.map((component) => ({
      value: `${family.storybookFamilySlug}-${component.storySlug}--default`,
      label: component.name,
      description: family.title,
    })),
  ),
];
const widths = [320, 390, 768, 1024, 1440, 1920].map((width) => ({
  value: String(width),
  label: `${width} px`,
}));

export function VisualReviewPage({ settings }: { settings: StudioSettings }) {
  const [story, setStory] = useState(formsStory);
  const [width, setWidth] = useState("390");

  return (
    <section className="b4-studio__visual-review">
      <PageHeader
        title="Visual review"
        description="Compare the same live Storybook story in both themes at an exact viewport width."
      />
      <div className="b4-studio__visual-controls">
        <Select
          label="Story"
          items={stories}
          value={story}
          onValueChange={(value) => value && setStory(value)}
        />
        <Select
          label="Viewport width"
          items={widths}
          value={width}
          onValueChange={(value) => value && setWidth(value)}
        />
      </div>
      <div
        className="b4-studio__visual-scroll"
        role="region"
        aria-label="Scrollable theme previews"
        tabIndex={0}
      >
        {(["graphite", "porcelain"] as const).map((theme) => {
          const label = theme === "graphite" ? "Graphite" : "Porcelain";
          const globals = `b4Theme:${theme};b4Density:${settings.density};b4Radius:${settings.radius};b4Contrast:${settings.contrast};b4Motion:${settings.motion}`;
          const src = storybookFrameUrl(story, globals);
          return (
            <section
              className="b4-studio__visual-panel"
              key={theme}
              style={{ width: Number(width) }}
            >
              <h2>{label}</h2>
              <iframe src={src} title={`${label} story preview`} />
            </section>
          );
        })}
      </div>
    </section>
  );
}
