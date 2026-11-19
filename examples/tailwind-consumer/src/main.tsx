import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { Badge, Button, Card, Switch } from "@b4/react";
import "./styles.css";

/**
 * Verifies @b4/react survives real Tailwind consumption: Tailwind's
 * Preflight reset doesn't strip B4 component styling, Tailwind utility
 * classes on surrounding layout don't bleed into B4's `.b4-*` classes, and
 * both libraries' classes can sit on sibling elements without visual
 * corruption. See src/styles.css for the required import order and
 * REQUIREMENTS_TRACEABILITY.md section 11 for what this fixture is for.
 */
function App() {
  const [on, setOn] = useState(true);

  return (
    <div className="min-h-screen bg-slate-950 p-10 text-slate-100">
      <div className="mx-auto flex max-w-xl flex-col gap-6">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          B4 inside a Tailwind app
        </h1>
        <p className="text-sm text-slate-400">
          This paragraph, its spacing, and the heading above are styled
          entirely with Tailwind utility classes. The card below is a real
          <code className="mx-1 rounded bg-slate-800 px-1.5 py-0.5 text-xs">@b4/react</code>
          <strong>Card</strong> — if Tailwind's Preflight reset were winning
          the cascade, its button and switch would look like unstyled
          native HTML instead of B4's own design.
        </p>

        <Card variant="raised" padding="lg" style={{ display: "flex", flexDirection: "column", gap: "var(--b4-space-6)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--b4-space-4)" }}>
            <Badge tone="success">B4 Badge</Badge>
            <Badge tone="accent">Accent</Badge>
          </div>
          <Switch label="B4 Switch (real component, not Tailwind)" checked={on} onCheckedChange={setOn} />
          <Button variant="primary">B4 Button</Button>
        </Card>

        <button className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-400">
          Plain Tailwind button (for visual contrast only)
        </button>
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
