import { Card, CodeBlock, Link, Stat } from "@b4/react";
import { STUDIO_COMPONENT_COUNT, STUDIO_FAMILIES } from "../catalog.js";
import { storybookHomeUrl } from "../storybook.js";

export function HomePage() {
  return (
    <div className="b4-studio__hero">
      <StudioIntro />
      <StudioMetrics />
      <Card variant="raised">
        <CodeBlock
          language="bash"
          code={`pnpm add @b4/react @b4/tokens @b4/motion
import "@b4/tokens/css";
import "@b4/react/styles.css";`}
        />
      </Card>
      <p className="b4-studio__muted">
        Component API reference and isolated previews live in{" "}
        <Link href={storybookHomeUrl()} external>
          Storybook
        </Link>
        . This app is the product-level shell and integration demos.
      </p>
    </div>
  );
}

function StudioIntro() {
  return (
    <div>
      <p className="b4-studio__muted" style={{ marginBottom: "var(--b4-space-4)" }}>
        B4 Studio
      </p>
      <h1 style={{ fontSize: "var(--b4-text-3xl)", fontWeight: 600, letterSpacing: "-0.03em", margin: 0 }}>
        A commercial-grade React design system
      </h1>
      <p className="b4-studio__muted" style={{ marginTop: "var(--b4-space-5)", maxWidth: "40rem" }}>
        Graphite and Porcelain share one component library, one motion language, and one token contract. Every public
        component in the inventory below passed the same quality gate.
      </p>
    </div>
  );
}

function StudioMetrics() {
  return (
    <div className="b4-studio__hero-grid">
      <Card>
        <Stat label="Public components" value={String(STUDIO_COMPONENT_COUNT)} trend={{ label: "All VERIFIED", direction: "neutral" }} />
      </Card>
      <Card>
        <Stat label="Families" value={String(STUDIO_FAMILIES.length)} description="A through F" />
      </Card>
      <Card>
        <Stat
          label="Themes"
          value="2"
          description="Graphite + Porcelain"
          trend={{ label: "Equal completeness", direction: "up" }}
        />
      </Card>
      <Card>
        <Stat label="E2E checks" value="359" description="Playwright + axe (last gate)" />
      </Card>
    </div>
  );
}