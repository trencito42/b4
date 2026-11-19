import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Button } from "@b4/react";
import "@b4/tokens/css";
import "@b4/react/styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Button variant="primary">Consumer OK</Button>
  </StrictMode>,
);