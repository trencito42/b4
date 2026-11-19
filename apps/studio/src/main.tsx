import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../../../packages/tokens/src/index.css";
import "../../../packages/react/src/styles.css";
import { applyStudioSettings, loadStudioSettings } from "./studio/settings.js";
import { App } from "./App.js";

applyStudioSettings(loadStudioSettings());

const root = document.getElementById("root");
if (!root) throw new Error("#root element not found");

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
