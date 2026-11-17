import { Button } from "@b4/react";

/**
 * Phase 0 placeholder shell. The real B4 Studio (nav, category browser,
 * theme/density/radius/accent/motion configurator, responsive preview,
 * integration showcases) is built in Phase 6 — see PROGRESS.md. Storybook
 * (`pnpm storybook`) is the primary interactive documentation surface until
 * then.
 */
export function App() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
        background: "var(--b4-surface-canvas)",
        color: "var(--b4-text-primary)",
        fontFamily: "var(--b4-font-sans)",
      }}
    >
      <h1 style={{ fontSize: "var(--b4-text-3xl)", fontWeight: "var(--b4-weight-semibold)" }}>
        B4 Studio
      </h1>
      <p style={{ color: "var(--b4-text-secondary)" }}>
        Phase 0 scaffold — run <code>pnpm storybook</code> for the full component docs.
      </p>
      <Button variant="primary">It's alive</Button>
    </main>
  );
}
