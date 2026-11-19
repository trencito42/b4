import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(join(here, "../packages/react/package.json"));
const { createElement } = require("react");
const { renderToString } = require("react-dom/server");
const { Button } = await import(pathToFileURL(join(here, "../packages/react/dist/index.js")).href);

const html = renderToString(createElement(Button, { variant: "primary", children: "Launch" }));

if (!html.includes("Launch")) {
  throw new Error("SSR smoke: Button label missing from renderToString output.");
}

console.log("ssr-smoke: renderToString(Button) OK.");