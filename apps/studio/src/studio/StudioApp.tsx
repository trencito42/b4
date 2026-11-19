import { useEffect, useMemo, useState, type ReactNode } from "react";
import { AppShell, Button, Link, SearchField, SegmentedControl, Sidebar, ToastProvider } from "@b4/react";
import {
  b4ContrastModes,
  b4Densities,
  b4MotionModes,
  b4RadiusModes,
  b4Themes,
  type B4ContrastMode,
  type B4Density,
  type B4MotionMode,
  type B4RadiusMode,
  type B4Theme,
} from "@b4/tokens";
import { STUDIO_COMPONENT_COUNT } from "./catalog.js";
import { CatalogPage } from "./pages/CatalogPage.js";
import { HomePage } from "./pages/HomePage.js";
import { MotionLabPage } from "./pages/MotionLabPage.js";
import { ShowcaseAnalyticsPage } from "./pages/ShowcaseAnalyticsPage.js";
import { ShowcaseBillingPage } from "./pages/ShowcaseBillingPage.js";
import { ShowcaseInfrastructurePage } from "./pages/ShowcaseInfrastructurePage.js";
import {
  applyStudioSettings,
  defaultStudioSettings,
  loadStudioSettings,
  saveStudioSettings,
  type StudioPreviewWidth,
  type StudioSettings,
} from "./settings.js";
import { storybookHomeUrl } from "./storybook.js";
import "./studio.css";

export type StudioRoute =
  | "home"
  | "catalog"
  | "motion-lab"
  | "showcase-analytics"
  | "showcase-infrastructure"
  | "showcase-billing";

export function StudioApp() {
  const [route, setRoute] = useState<StudioRoute>("home");
  const [settings, setSettings] = useState<StudioSettings>(() => loadStudioSettings());
  const [navQuery, setNavQuery] = useState("");
  const [catalogQuery, setCatalogQuery] = useState("");

  useEffect(() => {
    applyStudioSettings(settings);
    saveStudioSettings(settings);
  }, [settings]);

  const activeSidebarId =
    route === "catalog"
      ? "catalog"
      : route === "motion-lab"
        ? "motion-lab"
        : route.startsWith("showcase")
          ? route
          : "home";

  const content = useMemo(() => {
    switch (route) {
      case "catalog":
        return <CatalogPage initialQuery={catalogQuery} />;
      case "motion-lab":
        return <MotionLabPage />;
      case "showcase-analytics":
        return <ShowcaseAnalyticsPage previewWidth={settings.previewWidth} />;
      case "showcase-infrastructure":
        return <ShowcaseInfrastructurePage previewWidth={settings.previewWidth} />;
      case "showcase-billing":
        return <ShowcaseBillingPage previewWidth={settings.previewWidth} />;
      default:
        return <HomePage />;
    }
  }, [route, settings.previewWidth, catalogQuery]);

  return (
    <ToastProvider>
      <div className="b4-studio">
        <AppShell
          sidebarLabel="Studio"
          sidebar={
            <Sidebar
              activeItemId={activeSidebarId}
              sections={[
                {
                  id: "main",
                  label: "Studio",
                  items: [
                    { id: "home", label: "Overview", onClick: () => setRoute("home") },
                    { id: "catalog", label: "Components", onClick: () => setRoute("catalog") },
                    { id: "motion-lab", label: "Motion Lab", onClick: () => setRoute("motion-lab") },
                  ],
                },
                {
                  id: "showcases",
                  label: "Showcases",
                  items: [
                    { id: "showcase-analytics", label: "Analytics", onClick: () => setRoute("showcase-analytics") },
                    {
                      id: "showcase-infrastructure",
                      label: "Infrastructure",
                      onClick: () => setRoute("showcase-infrastructure"),
                    },
                    { id: "showcase-billing", label: "Billing", onClick: () => setRoute("showcase-billing") },
                  ],
                },
              ]}
            />
          }
          header={
            <div className="b4-studio__header-actions">
              <button type="button" className="b4-studio__brand" onClick={() => setRoute("home")}>
                <span className="b4-studio__brand-mark" aria-hidden="true">
                  B4
                </span>
                Studio
              </button>
              <form
                role="search"
                style={{ flex: "1 1 16rem", maxWidth: "22rem" }}
                onSubmit={(event) => {
                  event.preventDefault();
                  setCatalogQuery(navQuery);
                  setRoute("catalog");
                }}
              >
                <SearchField
                  label="Search components"
                  hideLabel
                  placeholder="Jump to catalog…"
                  value={navQuery}
                  onValueChange={setNavQuery}
                />
              </form>
              <Configurator settings={settings} onChange={setSettings} showPreview={route.startsWith("showcase")} />
              <Button variant="secondary" size="sm" onClick={() => window.open(storybookHomeUrl(), "_blank", "noopener,noreferrer")}>
                Storybook
              </Button>
            </div>
          }
        >
          <div className="b4-studio__content">{content}</div>
        </AppShell>
        <p className="b4-studio__muted" style={{ textAlign: "center", padding: "var(--b4-space-8)" }}>
          {STUDIO_COMPONENT_COUNT} verified public components ·{" "}
        <Link href={storybookHomeUrl()} external tone="neutral">
          Open Storybook
        </Link>
        </p>
      </div>
    </ToastProvider>
  );
}

function Configurator({
  settings,
  onChange,
  showPreview,
}: {
  settings: StudioSettings;
  onChange: (next: StudioSettings) => void;
  showPreview: boolean;
}) {
  return (
    <div className="b4-studio__config" aria-label="Theme configurator">
      <ConfiguratorGroup label="Theme">
        <SegmentedControl<B4Theme>
          aria-label="Theme"
          size="sm"
          items={b4Themes.map((theme) => ({
            value: theme,
            label: theme === "graphite" ? "Graphite" : "Porcelain",
          }))}
          value={settings.theme}
          onValueChange={(theme) => onChange({ ...settings, theme })}
        />
      </ConfiguratorGroup>
      <ConfiguratorGroup label="Density">
        <SegmentedControl<B4Density>
          aria-label="Density"
          size="sm"
          items={[
            { value: "compact", label: "Compact" },
            { value: "comfortable", label: "Comfort" },
            { value: "spacious", label: "Spacious" },
          ]}
          value={settings.density}
          onValueChange={(density) => onChange({ ...settings, density })}
        />
      </ConfiguratorGroup>
      <ConfiguratorGroup label="Radius">
        <SegmentedControl<B4RadiusMode>
          aria-label="Radius"
          size="sm"
          items={b4RadiusModes.map((radius) => ({ value: radius, label: radius === "default" ? "Def" : radius }))}
          value={settings.radius}
          onValueChange={(radius) => onChange({ ...settings, radius })}
        />
      </ConfiguratorGroup>
      <ConfiguratorGroup label="Contrast">
        <SegmentedControl<B4ContrastMode>
          aria-label="Contrast"
          size="sm"
          items={b4ContrastModes.map((contrast) => ({ value: contrast, label: contrast === "default" ? "Std" : "Hi" }))}
          value={settings.contrast}
          onValueChange={(contrast) => onChange({ ...settings, contrast })}
        />
      </ConfiguratorGroup>
      <ConfiguratorGroup label="Motion">
        <SegmentedControl<B4MotionMode>
          aria-label="Motion"
          size="sm"
          items={b4MotionModes.map((motion) => ({ value: motion, label: motion }))}
          value={settings.motion}
          onValueChange={(motion) => onChange({ ...settings, motion })}
        />
      </ConfiguratorGroup>
      {showPreview && (
        <ConfiguratorGroup label="Preview">
          <SegmentedControl<StudioPreviewWidth>
            aria-label="Preview width"
            size="sm"
            items={[
              { value: "full", label: "Full" },
              { value: "390", label: "390" },
              { value: "768", label: "768" },
              { value: "1440", label: "1440" },
            ]}
            value={settings.previewWidth}
            onValueChange={(previewWidth) => onChange({ ...settings, previewWidth })}
          />
        </ConfiguratorGroup>
      )}
    </div>
  );
}

function ConfiguratorGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="b4-studio__config-group">
      <span className="b4-studio__config-label">{label}</span>
      {children}
    </div>
  );
}